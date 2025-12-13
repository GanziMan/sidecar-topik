"use client";

import { UserSubmission, EvaluationResponseUnion } from "@/types/question.types";
import { QuestionType, Role } from "@/types/common.types";
import { useState } from "react";

import { Json } from "@/types/supabase";
import { SelectItem } from "@/components/ui/select";
import SelectHistory from "./SelectHistory";
import { useSession } from "next-auth/react";
import EvaluationReview from "@/components/question/writing-review/EvaluationReview";

interface EvaluationTabContentProps {
  questionType: QuestionType;
  initialEvaluationResult: EvaluationResponseUnion;
  evaluationHistories: UserSubmission[];
  charCount: number;
}

export default function EvaluationTabContent({
  questionType,
  initialEvaluationResult,
  evaluationHistories,
  charCount,
}: EvaluationTabContentProps) {
  const { data: session } = useSession();
  const isAdmin = session?.roles?.includes(Role.ADMIN);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Json | EvaluationResponseUnion>(initialEvaluationResult);
  const [selectedHistory, setSelectedHistory] = useState<UserSubmission | null>(null);

  const handleHistorySelect = (history: UserSubmission) => {
    setSelectedHistory(history);
    setSelectedEvaluation(history.submission_results?.evaluation!);
  };

  const handleCurrentSelect = () => {
    setSelectedHistory(null);
    setSelectedEvaluation(initialEvaluationResult);
  };

  return (
    <>
      {evaluationHistories.length > 1 && isAdmin && (
        <div className="flex justify-start">
          <EvaluationHistorySelect
            selectedHistory={selectedHistory}
            evaluationHistories={evaluationHistories}
            handleCurrentSelect={handleCurrentSelect}
            handleHistorySelect={handleHistorySelect}
          />
        </div>
      )}

      <EvaluationReview
        questionType={questionType}
        evaluationResult={selectedEvaluation}
        charCount={charCount}
        historyAnswer={selectedHistory}
      />
    </>
  );
}

interface EvaluationHistorySelectProps {
  selectedHistory: UserSubmission | null;
  evaluationHistories: UserSubmission[];
  handleCurrentSelect: () => void;
  handleHistorySelect: (history: UserSubmission) => void;
}

function EvaluationHistorySelect({
  selectedHistory,
  evaluationHistories,
  handleCurrentSelect,
  handleHistorySelect,
}: EvaluationHistorySelectProps) {
  return (
    <SelectHistory
      value={selectedHistory?.id ?? "current"}
      onValueChange={(value) => {
        if (value === "current") {
          handleCurrentSelect();
        } else {
          const history = evaluationHistories.find((h) => h.id === value);
          if (history) {
            handleHistorySelect(history);
          }
        }
      }}
      placeholder="회차 선택"
      triggerClassName="w-[140px] h-8 text-xs"
      contentClassName="h-[150px]"
      items={evaluationHistories.slice(1)}
      getItemValue={(history) => history.id}
      renderItem={(history) => `${history.attempt_no}번째`}
      prependItems={<SelectItem value="current">현재 채점 결과</SelectItem>}
    />
  );
}
