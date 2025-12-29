import {
  EvaluationResponseFor,
  EvaluationResponseUnion,
  SentenceCompletionAnswer,
  CorrectionResponse,
  WritingResponseScores,
} from "@/types/question.types";
import { NextApiClient } from "@/lib/ky";
import { ActionResponse, QuestionParams, QuestionType } from "@/types/common.types";
import { TopikWritingCorrectorRequest, TopikWritingEvaluatorRequest } from "@/app/schemas/topik-write.schema";

interface FetchEvaluationProps extends QuestionParams {
  questionId: string;
  answer: SentenceCompletionAnswer | string;
}

export async function fetchEvaluation<Q extends QuestionType>(
  params: FetchEvaluationProps
): Promise<ActionResponse<EvaluationResponseFor<Q>>> {
  const { year, round, type, questionId, answer } = params;
  const request = evaluationRequest(Number(year), Number(round), questionId, type, answer);

  return NextApiClient.post<TopikWritingEvaluatorRequest, EvaluationResponseFor<Q>>(
    "api/topik-write/evaluations",
    request
  );
}

interface FetchCorrectionProps extends QuestionParams {
  essayAnswer: string;
  evaluationResult: EvaluationResponseUnion;
}

export async function fetchCorrection(params: FetchCorrectionProps): Promise<ActionResponse<CorrectionResponse>> {
  const { year, round, type, essayAnswer, evaluationResult } = params;

  if (type !== QuestionType.Q53 && type !== QuestionType.Q54) {
    throw new Error("Correction is only available for questions 53 and 54.");
  }

  const payload = {
    year: Number(year),
    round: Number(round),
    questionNumber: type,
    answer: essayAnswer,
    evaluationResult,
    evaluationScores: evaluationResult.scores as WritingResponseScores,
  };

  return NextApiClient.post<TopikWritingCorrectorRequest, CorrectionResponse>("api/topik-write/corrections", payload);
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
