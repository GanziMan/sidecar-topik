import { ServiceApiClient } from "@/lib/ky";
import { NextResponse } from "next/server";
import { EvaluationResponseUnion } from "@/types/question.types";
import { topikWritingEvaluatorRequestSchema } from "@/app/schemas/topik-write.schema";
import { cookies } from "next/headers";
import { ACCESS_TOKEN } from "@/config/shared";
import { ApiResponse } from "@/types/common.types";
import { createErrorResponse } from "@/lib/api-utils";
import { deleteAuthCookies } from "@/lib/serverActions/cookies";
import { ErrorCode } from "@/config/error-codes.config";

// 에이전트 채점 api
export async function POST(request: Request): Promise<ApiResponse<EvaluationResponseUnion>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN)?.value ?? "";

  if (!accessToken) {
    console.error("Access token is required");
    await deleteAuthCookies();

    return createErrorResponse("권한이 없습니다. 다시 로그인해주세요.", ErrorCode.UNAUTHORIZED, 401);
  }

  const clientEvaluationRequest = await request.json();
  const { success, data: parsedData, error } = topikWritingEvaluatorRequestSchema.safeParse(clientEvaluationRequest);

  if (!success) {
    return createErrorResponse(error.message, ErrorCode.VALIDATION_ERROR, 400);
  }

  // TODO: 후에 evaluation 저장 로직 추가
  const { year, round, questionNumber, answer } = parsedData;
  const qNum = Number(questionNumber);

  // 문제 유형에 따라 엔드포인트 분기
  const endpoint = qNum === 51 || qNum === 52 ? "writing/evaluator/sentence" : "writing/evaluator/essay";

  let agentResponseText = "";
  const response = await ServiceApiClient.post<Record<string, unknown>, string>(endpoint, {
    question_number: qNum,
    answer,
    exam_year: year,
    exam_round: round,
  });

  if (response.success) agentResponseText = response.data!;
  else return createErrorResponse(response.error.message, response.error.code, 500);

  const textFromAgent = agentResponseText;

  // JSON 추출: 첫 번째 '{'와 마지막 '}' 사이의 내용을 찾습니다.
  // 에이전트가 설명 텍스트를 섞어 보내거나, 마크다운 코드 블록을 사용하는 경우를 모두 처리합니다.
  const jsonMatch = textFromAgent.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : "";

  let agentResponse;
  try {
    agentResponse = JSON.parse(jsonString);
  } catch {
    console.error("Agent response is not valid JSON:", textFromAgent);

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

  return NextResponse.json(agentResponse);
}
