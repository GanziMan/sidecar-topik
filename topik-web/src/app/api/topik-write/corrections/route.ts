import { ServiceApiClient } from "@/lib/ky";
import { NextResponse } from "next/server";
import { CorrectionResponse } from "@/types/question.types";
import { topikWritingCorrectorRequestSchema } from "@/app/schemas/topik-write.schema";
import { ApiResponse } from "@/types/common.types";
import { createErrorResponse, parseAgentResponse } from "@/lib/api-utils";
import { ErrorCode } from "@/config/error-codes.config";

// 에이전트 첨삭 api
export async function POST(request: Request): Promise<ApiResponse<CorrectionResponse>> {
  const clientRequest = await request.json();

  const { success, data: parsedData, error } = topikWritingCorrectorRequestSchema.safeParse(clientRequest);

  if (!success) {
    console.error("validation error:", error);
    return createErrorResponse(error.message, ErrorCode.VALIDATION_ERROR, 400);
  }

  const { year, round, questionNumber, answer, evaluationResult } = parsedData;

  const response = await ServiceApiClient.post<Record<string, unknown>, any>("writing/corrector", {
    exam_year: year,
    exam_round: round,
    question_number: questionNumber,
    answer,
    evaluation_result: evaluationResult,
  });

  if (!response.success) {
    return createErrorResponse(response.error.message, response.error.code, 500);
  }

  // 무적의 파싱 로직 적용
  const agentResponse = parseAgentResponse<CorrectionResponse>(response.data);

  if (!agentResponse) {
    console.error("Failed to parse agent response:", response.data);
    return createErrorResponse(
      "첨삭을 진행할 수 없습니다. 에이전트 응답 형식이 올바르지 않습니다.",
      ErrorCode.VALIDATION_ERROR,
      400
    );
  }

  return NextResponse.json(agentResponse);
}
