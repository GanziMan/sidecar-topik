import { createClient } from "@/supabase/server";
import { DB_TABLES, DB_COLUMNS, SUPABASE_ERROR_CODES } from "@/config/db.config";
import { Json } from "@/types/supabase";

export interface CreateSubmissionParams {
  userId: string;
  questionId: string;
  answer: Json;
  attemptNo: number;
}

export interface CreateSubmissionResultParams {
  submissionId: string;
  evaluation: Json;
  correction?: Json;
  promptSnapshot: Json;
}

export interface SubmissionHistoryResult {
  data: any[];
  count: number | null;
}

export const SubmissionRepository = {
  async findLatestAttemptNo(userId: string, questionId: string): Promise<number> {
    const supabase = await createClient();

    const { data: latestSubmission, error } = await supabase
      .from(DB_TABLES.USER_SUBMISSIONS)
      .select(DB_COLUMNS.USER_SUBMISSIONS.ATTEMPT_NO)
      .eq(DB_COLUMNS.USER_SUBMISSIONS.USER_ID, userId)
      .eq(DB_COLUMNS.USER_SUBMISSIONS.QUESTION_ID, questionId)
      .order(DB_COLUMNS.USER_SUBMISSIONS.ATTEMPT_NO, { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== SUPABASE_ERROR_CODES.NO_ROWS_FOUND) {
      throw error;
    }

    return latestSubmission ? latestSubmission.attempt_no : 0;
  },

  async createSubmission(params: CreateSubmissionParams) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(DB_TABLES.USER_SUBMISSIONS)
      .insert({
        [DB_COLUMNS.USER_SUBMISSIONS.USER_ID]: params.userId,
        [DB_COLUMNS.USER_SUBMISSIONS.QUESTION_ID]: params.questionId,
        [DB_COLUMNS.USER_SUBMISSIONS.USER_ANSWER]: params.answer,
        [DB_COLUMNS.USER_SUBMISSIONS.ATTEMPT_NO]: params.attemptNo,
      })
      .select(DB_COLUMNS.USER_SUBMISSIONS.ID)
      .single();

    if (error) throw error;
    return data;
  },

  async createSubmissionResult(params: CreateSubmissionResultParams) {
    const supabase = await createClient();

    const { error } = await supabase.from(DB_TABLES.SUBMISSION_RESULTS).insert({
      [DB_COLUMNS.SUBMISSION_RESULTS.SUBMISSION_ID]: params.submissionId,
      [DB_COLUMNS.SUBMISSION_RESULTS.EVALUATION]: params.evaluation,
      [DB_COLUMNS.SUBMISSION_RESULTS.CORRECTION]: params.correction ?? {},
      [DB_COLUMNS.SUBMISSION_RESULTS.PROMPT_SNAPSHOT]: params.promptSnapshot,
    });

    if (error) throw error;
  },

  async findAllByUserIdAndQuestionId(userId: string, questionId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(DB_TABLES.USER_SUBMISSIONS)
      .select(
        `
       id,
      created_at,
      user_answer,
      attempt_no,
      submission_results (
        id,
        created_at,
        evaluation,
        correction
      )
    `
      )
      .eq(DB_COLUMNS.USER_SUBMISSIONS.USER_ID, userId)
      .eq(DB_COLUMNS.USER_SUBMISSIONS.QUESTION_ID, questionId)
      .order(DB_COLUMNS.USER_SUBMISSIONS.ATTEMPT_NO, { ascending: false });

    if (error) throw error;
    return data;
  },

  async findHistoryByUserId(userId: string, page: number, limit: number): Promise<SubmissionHistoryResult> {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from(DB_TABLES.USER_SUBMISSIONS)
      .select(
        `
        id,
        created_at,
        user_id,
        questions (
          question_number
        ),
        submission_results (
          evaluation,
          prompt_snapshot
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return { data: data || [], count };
  },
};
