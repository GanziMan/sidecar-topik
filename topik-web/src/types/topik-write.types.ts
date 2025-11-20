import { CorrectionResponse } from "./topik-correct.types";
import { QuestionType } from "./topik.types";

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

interface EvaluationBaseResponse {
  total_score: number;
  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: string[];
  overall_feedback: string;
}

// 51/52
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

export interface GetQuestionContentResponse {
  id: string;
  title: string;
  question_text: string;
  image_url?: string;
}

export interface SubmissionResult {
  evaluation: EvaluationResponseUnion;
  correction: CorrectionResponse;
}
export interface EvaluationRecord {
  id: string;
  attempt_no: number;
  created_at: string;
  user_answer: string | { answer1: string; answer2: string } | { essay_answer: string };
  submission_results: SubmissionResult;
}
