"use server";

import { QuestionType } from "@/types/common.types";
import { Json } from "@/types/supabase";
import { SubmissionRepository } from "@/repositories/submission.repository";
import { UserRepository } from "@/repositories/user.repository";

export interface SubmissionHistoryItem {
  id: string;
  created_at: string;
  user_email: string; // join 필요
  question_type: QuestionType;
  score: number;
  prompt_snapshot: Json | null; // 저장된 프롬프트 스냅샷
}

export interface SubmissionHistoryResponse {
  data: SubmissionHistoryItem[];
  count: number;
  page: number;
  limit: number;
}

export async function getSubmissionHistory(page: number = 1, limit: number = 10): Promise<SubmissionHistoryResponse> {
  const user = await UserRepository.getCurrentUserOrThrow();

  try {
    const { data: richSubmissions, count } = await SubmissionRepository.findHistoryByUserId(user.id, page, limit);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableData = richSubmissions.map(({ id, created_at, user_id, questions, submission_results }: any) => {
      const evaluation = submission_results?.evaluation;
      const snapshot = submission_results?.prompt_snapshot;

      let score = 0;

      if (evaluation && typeof evaluation === "object" && "total_score" in evaluation) {
        score = (evaluation.total_score as number) || 0;
      } else if (evaluation && typeof evaluation === "object" && "score" in evaluation) {
        score = evaluation.score?.total_score || evaluation.total_score || evaluation.score || 0;
      }

      const questionNumber = questions?.question_number;

      return {
        id,
        created_at,
        user_email: user_id,
        question_type: questionNumber ? (`Q${questionNumber}` as QuestionType) : QuestionType.Q54,
        score,
        prompt_snapshot: snapshot || null,
      };
    });

    return {
      data: tableData,
      count: count || 0,
      page,
      limit,
    };
  } catch (error) {
    console.error("Failed to fetch rich history:", error);
    throw new Error("데이터를 불러오는 중 오류가 발생했습니다.");
  }
}
