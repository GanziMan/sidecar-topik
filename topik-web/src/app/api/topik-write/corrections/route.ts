import { ServiceApiClient } from "@/lib/ky";
import { NextResponse } from "next/server";
import { CorrectionResponse } from "@/types/question.types";
import { topikWritingCorrectorRequestSchema } from "@/app/schemas/topik-write.schema";
import { ApiResponse } from "@/types/common.types";
import { createErrorResponse } from "@/lib/api-utils";
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

  let agentResponseText = "";
  const response = await ServiceApiClient.post<Record<string, unknown>, { result: string }>("writing/corrector", {
    exam_year: year,
    exam_round: round,
    question_number: questionNumber,
    answer,
    evaluation_result: evaluationResult,
  });
  if (response.success) agentResponseText = response.data?.result!;

  if (agentResponseText) {
    const textFromAgent = agentResponseText;

    const cleanedJsonString = textFromAgent
      .replace(/```json\n?/, "")
      .replace(/```$/, "")
      .trim();

    const agentResponse = JSON.parse(cleanedJsonString);
    return NextResponse.json(agentResponse);
  }

  return createErrorResponse("No final response with text from agent", ErrorCode.NO_TEXT_OUTPUT_EVENT, 500);
}
