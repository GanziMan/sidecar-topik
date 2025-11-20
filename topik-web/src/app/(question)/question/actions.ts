import { EvaluationResponseFor, EvaluationResponseUnion, SentenceCompletionAnswer } from "@/types/topik-write.types";
import { ApiClient } from "@/lib/ky";
import { QuestionType } from "@/types/topik.types";
import { CorrectionResponse } from "@/types/topik-correct.types";
import { TopikWritingCorrectorRequest, TopikWritingEvaluatorRequest } from "@/app/schemas/topik-write.schema";

export async function fetchEvaluation<Q extends QuestionType>(
  year: number,
  round: number,
  questionId: string,
  questionType: Q,
  answer: SentenceCompletionAnswer | string
): Promise<EvaluationResponseFor<Q>> {
  const request = evaluationRequest(year, round, questionId, questionType, answer);

  const response = await ApiClient.post<TopikWritingEvaluatorRequest, EvaluationResponseFor<Q>>(
    "/api/topik-write/evaluations",
    request
  );
  return response;
}

export async function fetchCorrection(
  year: number,
  round: number,
  questionType: QuestionType,
  essayAnswer: string,
  evaluationResult: EvaluationResponseUnion
): Promise<CorrectionResponse> {
  if (questionType !== QuestionType.Q53 && questionType !== QuestionType.Q54) {
    throw new Error("Correction is only available for questions 53 and 54.");
  }

  const payload = {
    year,
    round,
    questionNumber: questionType,
    answer: essayAnswer,
    evaluationResult,
  };

  const response = await ApiClient.post<TopikWritingCorrectorRequest, CorrectionResponse>(
    "/api/topik-write/corrections",
    payload
  );
  return response;
}

function evaluationRequest(
  year: number,
  round: number,
  questionId: string,
  questionType: QuestionType,
  answer: SentenceCompletionAnswer | string
): TopikWritingEvaluatorRequest {
  return { year, round, question_id: questionId, questionNumber: questionType, answer };
}
