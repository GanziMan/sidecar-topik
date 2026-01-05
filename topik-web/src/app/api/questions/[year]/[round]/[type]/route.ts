import { GetQuestionContentResponse } from "@/types/question.types";
import { NextRequest } from "next/server";
import { createResponse, createErrorResponse } from "@/lib/api-utils";
import { ErrorCode } from "@/config/error-codes.config";
import { ApiResponse } from "@/types/common.types";
import { QuestionRepository } from "@/repositories/question.repository";

interface GetQuestionContentRouteParams {
  year: string;
  round: string;
  type: string;
}

// 문제 조회 api
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<GetQuestionContentRouteParams> }
): Promise<ApiResponse<GetQuestionContentResponse>> {
  const { year, round, type } = await params;

  if (!type || !year || !round) {
    return createErrorResponse("년, 회차, 문제 번호는 필수 입력 항목입니다.", ErrorCode.VALIDATION_ERROR, 400);
  }

  try {
    const questionData = await QuestionRepository.findOne(Number(year), Number(round), Number(type));

    if (!questionData) {
      return createErrorResponse("문제를 찾을 수 없습니다.", ErrorCode.NOT_FOUND, 404);
    }

    return createResponse(questionData, 200);
  } catch (error) {
    console.error("Error fetching question:", error);
    return createErrorResponse("서버 오류가 발생했습니다.", ErrorCode.UNEXPECTED_ERROR, 500);
  }
}
