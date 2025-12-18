import { createResponse, createErrorResponse } from "@/lib/api-utils";
import { GetUserSubmissionsResponse } from "@/types/question.types";
import { ApiResponse } from "@/types/common.types";
import { ErrorCode } from "@/config/error-codes.config";
import { SubmissionRepository } from "@/repositories/submission.repository";
import { UserRepository } from "@/repositories/user.repository";

// 해당 문제에 대한 채점 기록을 조회하는 API
export async function GET(
  request: Request,
  { params }: { params: Promise<{ question_id: string }> }
): Promise<ApiResponse<GetUserSubmissionsResponse>> {
  const { question_id } = await params;

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const user = await UserRepository.getCurrentUserOrThrow();

  if (!user) {
    return createErrorResponse("인증되지 않은 사용자입니다.", ErrorCode.UNAUTHORIZED, 401);
  }

  if (!question_id) {
    return createErrorResponse("문제 번호는 필수 입력 항목입니다.", ErrorCode.VALIDATION_ERROR, 400);
  }

  try {
    const submissionData = await SubmissionRepository.findAllByUserIdAndQuestionId(user.id, question_id, page, limit);

    return createResponse(submissionData as unknown as GetUserSubmissionsResponse, 200);
  } catch (error) {
    console.error("Unexpected error fetching submissions:", error);
    return createErrorResponse("Internal Server Error", ErrorCode.UNEXPECTED_ERROR, 500);
  }
}
