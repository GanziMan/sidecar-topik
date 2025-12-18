"use client";

import { EvaluationResponseUnion } from "@/types/question.types";
import { QuestionType } from "@/types/common.types";
import EvaluationReview from "@/components/question/writing-review/EvaluationReview";

interface EvaluationTabContentProps {
  questionType: QuestionType;
  initialEvaluationResult: EvaluationResponseUnion;
  charCount: number;
}

export default function EvaluationTabContent({
  questionType,
  initialEvaluationResult,
  charCount,
}: EvaluationTabContentProps) {
  return (
    <EvaluationReview questionType={questionType} evaluationResult={initialEvaluationResult} charCount={charCount} />
  );
}
