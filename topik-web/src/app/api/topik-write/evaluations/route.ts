import { ServiceApiClient } from "@/lib/ky";
import { NextResponse } from "next/server";
import { EvaluationResponseUnion } from "@/types/question.types";
import { topikWritingEvaluatorRequestSchema } from "@/app/schemas/topik-write.schema";
import { cookies } from "next/headers";
import { USER_ID } from "@/config/shared";
import { ApiResponse } from "@/types/common.types";
import { createErrorResponse } from "@/lib/api-utils";
import { deleteAuthCookies } from "@/lib/serverActions/cookies";
import { ErrorCode } from "@/config/error-codes.config";
import { Json } from "@/types/supabase";
import { getRelevantPromptKeys } from "@/lib/prompt-utils";
import { SubmissionRepository } from "@/repositories/submission.repository";

// 에이전트 채점 api
export async function POST(request: Request): Promise<ApiResponse<EvaluationResponseUnion>> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(USER_ID)?.value ?? "";

  if (!userId) {
    console.error("User ID is required");
    await deleteAuthCookies();

    return createErrorResponse("권한이 없습니다. 다시 로그인해주세요.", ErrorCode.UNAUTHORIZED, 401);
  }

  const clientEvaluationRequest = await request.json();
  const { success, data: parsedData, error } = topikWritingEvaluatorRequestSchema.safeParse(clientEvaluationRequest);

  if (!success) {
    return createErrorResponse(error.message, ErrorCode.VALIDATION_ERROR, 400);
  }

  const { year, round, questionNumber, answer, question_id } = parsedData;

  let agentResponseText = "";
  const response = await ServiceApiClient.post<Record<string, unknown>, { result: string }>("writing/evaluator", {
    question_number: Number(questionNumber),
    answer,
    exam_year: year,
    exam_round: round,
  });
  if (response.success) agentResponseText = response.data?.result!;

  const textFromAgent = agentResponseText;

  // JSON 추출: 첫 번째 '{'와 마지막 '}' 사이의 내용을 찾습니다.
  // 에이전트가 설명 텍스트를 섞어 보내거나, 마크다운 코드 블록을 사용하는 경우를 모두 처리합니다.
  const jsonMatch = textFromAgent.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : "";

  let agentResponse;
  try {
    agentResponse = JSON.parse(jsonString);
  } catch (error) {
    console.warn("Agent response is not valid JSON:", textFromAgent);

    // JSON 파싱 실패 시: 에이전트의 거절 메시지나 엉뚱한 응답으로 간주
    return createErrorResponse(
      "채점을 진행할 수 없습니다. 올바른 답안을 입력했는지 확인해주세요.",
      ErrorCode.VALIDATION_ERROR,
      400
    );
  }

  if (!agentResponse) {
    return createErrorResponse("No agent response", ErrorCode.NO_AGENT_RESPONSE, 404);
  }

  // 0. 현재 사용 중인 프롬프트 스냅샷 가져오기
  let promptSnapshot = null;

  const promptsResponse = await ServiceApiClient.get<Record<string, unknown>>("prompts");

  if (promptsResponse.success === false) {
    return createErrorResponse(promptsResponse.error.message, promptsResponse.error.code, 500);
  }
  // 문제 유형에 맞는 프롬프트만 필터링
  const relevantKeys = getRelevantPromptKeys(questionNumber);

  promptSnapshot = Object.keys(promptsResponse.data!)
    .filter((key) => relevantKeys.includes(key))
    .reduce((obj, key) => {
      obj[key] = promptsResponse.data![key];
      return obj;
    }, {} as Record<string, unknown>);

  try {
    const latestAttemptNo = await SubmissionRepository.findLatestAttemptNo(userId, question_id);
    const newAttemptNo = latestAttemptNo + 1;

    // 제출 기록 생성
    const newSubmission = await SubmissionRepository.createSubmission({
      userId,
      questionId: question_id,
      answer: answer as Json,
      attemptNo: newAttemptNo,
    });

    // 제출 결과 생성
    await SubmissionRepository.createSubmissionResult({
      submissionId: newSubmission.id,
      evaluation: agentResponse,
      promptSnapshot: promptSnapshot as Json,
    });
  } catch (error) {
    return createErrorResponse("데이터베이스 오류가 발생했습니다.", ErrorCode.DATABASE_ERROR, 500);
  }

  return NextResponse.json(agentResponse);
}
