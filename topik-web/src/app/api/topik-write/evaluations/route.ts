import { ServiceApiClient } from "@/lib/ky";
import { NextResponse } from "next/server";
import { EvaluationResponseUnion } from "@/types/question.types";
import { topikWritingEvaluatorRequestSchema } from "@/app/schemas/topik-write.schema";
import { cookies } from "next/headers";
import { ACCESS_TOKEN } from "@/config/shared";
import { ApiResponse } from "@/types/common.types";
import { createErrorResponse, parseAgentResponse } from "@/lib/api-utils";
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

  // ServiceApiClient가 JSON 응답을 자동으로 파싱하므로 TRes를 any로 설정하여 유연하게 대응
  const response = await ServiceApiClient.post<Record<string, unknown>, any>(endpoint, {
    question_number: qNum,
    answer,
    exam_year: year,
    exam_round: round,
  });

  if (!response.success) {
    return createErrorResponse(response.error.message, response.error.code, 500);
  }

  // 무적의 파싱 로직 적용
  const agentResponse = parseAgentResponse<EvaluationResponseUnion>(response.data);

  if (!agentResponse) {
    console.error("Failed to parse agent response:", response.data);
    return createErrorResponse(
      "채점을 진행할 수 없습니다. 에이전트 응답 형식이 올바르지 않습니다.",
      ErrorCode.VALIDATION_ERROR,
      400
    );
  }

  return NextResponse.json(agentResponse);
}
