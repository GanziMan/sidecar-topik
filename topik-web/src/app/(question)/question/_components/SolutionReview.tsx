"use client";

import { EvaluationResponseUnion } from "@/types/topik-write.types";
import { QuestionType } from "@/types/topik.types";
import clsx from "clsx";
import { useState } from "react";
import tw from "tailwind-styled-components";
import AICorrectionReview from "./SolutionReview/AICorrectionReview";
import ModelReview from "./SolutionReview/ModelReview";
import LoadingOverlay from "@/components/LoadingOverlay";
import EvaluationHistory from "./SolutionReview/EvaluationHistory";
import { useCorrection } from "./hooks/useCorrection";
import { useEvaluationHistory } from "./hooks/useEvaluationHistory";
import EvaluationTabContent from "./SolutionReview/EvaluationTabContent";
import { Button } from "@/components/ui/button";

type ReviewTab = "ai_evaluation" | "ai_correction" | "model" | "ai_evaluation_comparison";

interface SolutionReviewProps {
  questionId: string;
  questionYear: number;
  questionRound: number;
  questionType: QuestionType;
  evaluationResult: EvaluationResponseUnion;
  essayAnswer: string;
  charCount: number;
}

const REVIEW_TABS: Array<{ label: string; value: ReviewTab }> = [
  { label: "AI 채점", value: "ai_evaluation" },
  { label: "AI 첨삭", value: "ai_correction" },
  { label: "모범 답안", value: "model" },
  { label: "AI 채점 비교", value: "ai_evaluation_comparison" },
];

export default function SolutionReview({
  questionId,
  questionYear,
  questionRound,
  questionType,
  evaluationResult,
  essayAnswer,
  charCount,
}: SolutionReviewProps) {
  const [reviewType, setReviewType] = useState<ReviewTab>("ai_evaluation");

  const { correctionResult, isCorrectionLoading } = useCorrection({
    reviewType,
    questionYear,
    questionRound,
    questionType,
    essayAnswer,
    evaluationResult,
  });

  const { evaluationRecords } = useEvaluationHistory(questionId, evaluationResult);

  const handleReviewTab = (review: ReviewTab) => {
    setReviewType(review);
  };

  return (
    <LoadingOverlay isLoading={isCorrectionLoading} label="첨삭 중...">
      <SolutionReviewContainer>
        <SolutionReviewActions role="tablist">
          {REVIEW_TABS.map((tab) => (
            <ReviewActionButton
              key={tab.value}
              label={tab.label}
              isActive={reviewType === tab.value}
              onClick={() => handleReviewTab(tab.value)}
            />
          ))}
        </SolutionReviewActions>
        {reviewType === "ai_evaluation" && (
          <EvaluationTabContent
            questionType={questionType}
            initialEvaluationResult={evaluationResult}
            evaluationRecords={evaluationRecords}
            charCount={charCount}
          />
        )}
        {reviewType === "ai_correction" && correctionResult && (
          <AICorrectionReview
            questionType={questionType}
            correctionResult={correctionResult}
            isLoading={isCorrectionLoading}
            initialScore={evaluationResult.total_score}
          />
        )}
        {reviewType === "model" && <ModelReview questionType={questionType} evaluationResult={evaluationResult} />}
        {reviewType === "ai_evaluation_comparison" && (
          <EvaluationHistory questionId={questionId} questionType={questionType} evaluationResult={evaluationResult} />
        )}
      </SolutionReviewContainer>
    </LoadingOverlay>
  );
}

interface ReviewActionButtonProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
}
function ReviewActionButton({ isActive, label, onClick }: ReviewActionButtonProps) {
  return (
    <Button
      role="tab"
      aria-selected={isActive}
      type="button"
      className={clsx(
        "rounded-[20px] p-2.5 h-12.5 leading-[30px] bg-white text-black",
        isActive && "bg-[#737373] text-white"
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

const SolutionReviewContainer = tw.div`p-5 flex flex-col gap-[30px] bg-white w-[553px]`;
const SolutionReviewActions = tw.div`flex gap-4.5`;
