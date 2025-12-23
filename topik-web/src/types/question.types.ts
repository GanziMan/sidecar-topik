import { QuestionType } from "./common.types";
import { Json } from "./supabase";

export interface SentenceCompletionAnswer<T = string> {
  answer1: T;
  answer2: T;
}

export type EvaluationResponseById = {
  [QuestionType.Q51]: SentenceCompletionResponse;
  [QuestionType.Q52]: SentenceCompletionResponse;
  [QuestionType.Q53]: WritingResponse;
  [QuestionType.Q54]: WritingResponse;
};

export type EvaluationResponseFor<Q extends QuestionType> = EvaluationResponseById[Q];
export type EvaluationResponseUnion = EvaluationResponseById[QuestionType];

// ------------------------------------------------------------
// 채점 결과 기본 응답
// ------------------------------------------------------------
interface EvaluationBaseResponse {
  total_score: number;
  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: string[];
  overall_feedback: string;
}

// ------------------------------------------------------------
// 채점 결과
// ------------------------------------------------------------
export interface SentenceCompletionResponse extends EvaluationBaseResponse {
  scores: SentenceCompletionAnswer<number>;
  model_answer: SentenceCompletionAnswer;
}

// 53/54
interface WritingResponseScores {
  task_performance: number;
  structure: number;
  language_use: number;
}

export interface WritingResponse extends EvaluationBaseResponse {
  scores: WritingResponseScores;
  char_count: number;
  char_count_evaluation: string;
  model_answer: string;
}

// ------------------------------------------------------------
// 문제 내용
// ------------------------------------------------------------
export interface QuestionContent {
  meta: {
    score: number;
    number: number;
    difficulty?: string;
  };
  context: {
    format: string; // "text" | "image_with_text" | ...
    content: string;
    images?: {
      alt: string;
      url: string;
      caption?: string;
    }[];
  };
  instruction: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model_answer?: Json;
}

// 문제 내용 가져오기
export interface GetQuestionContentResponse {
  id: string;
  content: QuestionContent;
}

// ------------------------------------------------------------
// 제출 결과
// ------------------------------------------------------------
export interface SubmissionResult {
  id: string;
  created_at: string;
  evaluation: Json | EvaluationResponseUnion;
  correction: Json | CorrectionResponse;
}

export interface UserSubmission {
  id: string;
  attempt_no: number;
  created_at: string;
  // TODO: supabase json type 적용 추후 DB 변경 시 수정 필요
  user_answer: Json;
  submission_results: SubmissionResult | null;
}

export type GetUserSubmissionsResponse = UserSubmission[];

// ------------------------------------------------------------
// 첨삭 결과
// ------------------------------------------------------------
export interface CorrectionChangeSentence {
  original: string;
  revised: string;
  position: {
    paragraph: number;
    sentence: number;
  };
  reason: string;
}

export interface CorrectionImprovement {
  expected_score_gain: string;
  key_improvements: string[];
}

export interface CorrectionResponse {
  corrected_answer: string;
  sentence_corrections: CorrectionChangeSentence[];
  improvement_effects: CorrectionImprovement;
  overall_feedback: string;
}
