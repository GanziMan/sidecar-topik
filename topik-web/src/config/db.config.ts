export const DB_TABLES = {
  QUESTIONS: "questions",
  USER_SUBMISSIONS: "user_submissions",
  SUBMISSION_RESULTS: "submission_results",
  PROMPTS: "prompts",
  PROMPT_HISTORY: "prompt_history",
} as const;

export const DB_VIEWS = {} as const;

export const DB_COLUMNS = {
  QUESTIONS: {
    ID: "id",
    CONTENT: "content",
    QUESTION_TYPE: "question_type",
    EXAM_YEAR: "exam_year",
    EXAM_ROUND: "exam_round",
    QUESTION_NUMBER: "question_number",
  },
  USER_SUBMISSIONS: {
    ID: "id",
    USER_ID: "user_id",
    QUESTION_ID: "question_id",
    USER_ANSWER: "user_answer",
    ATTEMPT_NO: "attempt_no",
  },
  SUBMISSION_RESULTS: {
    SUBMISSION_ID: "submission_id",
    EVALUATION: "evaluation",
    CORRECTION: "correction",
    PROMPT_SNAPSHOT: "prompt_snapshot",
  },
} as const;

export const SUPABASE_ERROR_CODES = {
  NO_ROWS_FOUND: "PGRST116",
} as const;
