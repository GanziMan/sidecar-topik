"use client";

import { useEffect, useState } from "react";
import { EvaluationResponseUnion, CorrectionResponse } from "@/types/question.types";
import { QuestionType } from "@/types/common.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import tw from "tailwind-styled-components";
import CorrectionReview from "@/components/question/writing-review/CorrectionReview";
import ModelReview from "@/components/question/writing-review/ModelReview";
import EvaluationTabContent from "./EvaluationTabContent";

type ReviewTab = "evaluation" | "correction" | "model";

const REVIEW_TABS: { label: string; value: ReviewTab }[] = [
  { label: "AI 채점", value: "evaluation" },
  { label: "AI 첨삭", value: "correction" },
  { label: "모범 답안", value: "model" },
];

interface WritingReviewProps {
  questionType: QuestionType;
  evaluationResult: EvaluationResponseUnion;
  correctionResult: CorrectionResponse | null;
  isCorrectionLoading: boolean;
  charCount: number;
}

export default function WritingReview({
  questionType,
  evaluationResult,
  correctionResult,
  isCorrectionLoading,
  charCount,
}: WritingReviewProps) {
  const [activeTab, setActiveTab] = useState<ReviewTab>("evaluation");

  const availableTabs = REVIEW_TABS.filter((tab) => {
    if (tab.value === "correction") {
      return !(questionType === QuestionType.Q51 || questionType === QuestionType.Q52);
    }
    return true;
  });

  // 첨삭을 진행하면 AI 첨삭 탭으로 이동
  useEffect(() => {
    if (correctionResult) {
      setActiveTab("correction");
    }
  }, [correctionResult]);

  return (
    <ReviewContainer>
      <TabList role="tablist">
        {availableTabs.map(({ value, label }) => (
          <ReviewTab key={value} label={label} isActive={activeTab === value} onClick={() => setActiveTab(value)} />
        ))}
      </TabList>

      {activeTab === "evaluation" && (
        <EvaluationTabContent
          questionType={questionType}
          initialEvaluationResult={evaluationResult}
          charCount={charCount}
        />
      )}

      {activeTab === "correction" && (
        <CorrectionReview
          questionType={questionType}
          correctionResult={correctionResult || undefined}
          isLoading={isCorrectionLoading}
          initialScore={evaluationResult.total_score}
        />
      )}

      {activeTab === "model" && <ModelReview questionType={questionType} evaluationResult={evaluationResult} />}
    </ReviewContainer>
  );
}

const TabList = tw.div`flex gap-4.5`;
const ReviewContainer = tw.div`flex flex-col gap-[30px] bg-white w-[553px] p-5`;

// ----------------------------------------------------------------------
// Sub Components
// ----------------------------------------------------------------------

interface ReviewTabButtonProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
}

function ReviewTab({ isActive, label, onClick }: ReviewTabButtonProps) {
  return (
    <Button
      role="tab"
      type="button"
      variant="ghost" // Use ghost to avoid default background styles fighting with our custom ones
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "h-auto p-0 rounded-none text-base leading-[30px]",
        "bg-white text-black hover:bg-white hover:text-black",
        isActive ? "font-semibold border-b-2 border-black" : "font-normal border-b-2 border-transparent"
      )}
    >
      {label}
    </Button>
  );
}
