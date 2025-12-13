import { createResponse, createErrorResponse } from "@/lib/api-utils";
import { GetUserSubmissionsResponse } from "@/types/question.types";
import { ApiResponse } from "@/types/common.types";
import { createClient } from "@/supabase/server";
import { ErrorCode } from "@/config/error-codes.config";
import { SubmissionRepository } from "@/repositories/submission.repository";

// 해당 문제에 대한 채점 기록을 조회하는 API
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ question_id: string }> }
): Promise<ApiResponse<GetUserSubmissionsResponse>> {
  const supabase = await createClient();
  const { question_id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return createErrorResponse("인증되지 않은 사용자입니다.", ErrorCode.UNAUTHORIZED, 401);
  }

  if (!question_id) {
    return createErrorResponse("문제 번호는 필수 입력 항목입니다.", ErrorCode.VALIDATION_ERROR, 400);
  }

  try {
    // Repository로 교체
    const submissionData = await SubmissionRepository.findAllByUserIdAndQuestionId(user.id, question_id);

    // Repository 반환 타입과 API 반환 타입(UserSubmission) 매칭 필요 시 여기서 변환
    // 현재는 구조가 거의 동일하므로 그대로 반환 (엄격한 타입 체크 시 변환 필요)
    return createResponse(submissionData as unknown as GetUserSubmissionsResponse, 200);
  } catch (error) {
    console.error("Unexpected error fetching submissions:", error);
    // TODO: Error 객체에서 message 추출 로직 개선 (repository에서 throw error 그대로 함)
    return createErrorResponse("Internal Server Error", ErrorCode.UNEXPECTED_ERROR, 500);
  }
}
