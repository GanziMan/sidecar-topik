"use client";

import { Button } from "@/components/ui/button";
import { EvaluationRecord, EvaluationResponseUnion } from "@/types/topik-write.types";
import { QuestionType } from "@/types/topik.types";
import { useState } from "react";
import AIEvaluationReview from "./AIEvaluationReview";

interface EvaluationTabContentProps {
  questionType: QuestionType;
  initialEvaluationResult: EvaluationResponseUnion;
  evaluationRecords: EvaluationRecord[];
  charCount: number;
}

export default function EvaluationTabContent({
  questionType,
  initialEvaluationResult,
  evaluationRecords,
  charCount,
}: EvaluationTabContentProps) {
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationResponseUnion>(initialEvaluationResult);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const handleRecordSelect = (record: EvaluationRecord) => {
    setSelectedRecordId(record.id);
    setSelectedEvaluation(record.submission_results.evaluation);
  };

  const handleCurrentSelect = () => {
    setSelectedRecordId(null);
    setSelectedEvaluation(initialEvaluationResult);
  };

  return (
    <>
      <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <Button size="sm" variant={selectedRecordId === null ? "default" : "outline"} onClick={handleCurrentSelect}>
          현재 채점 결과
        </Button>
        {evaluationRecords.slice(1).map((record) => (
          <Button
            key={record.id}
            size="sm"
            variant={selectedRecordId === record.id ? "default" : "outline"}
            onClick={() => handleRecordSelect(record)}
          >
            {record.attempt_no}번째
          </Button>
        ))}
      </div>
      <AIEvaluationReview questionType={questionType} evaluationResult={selectedEvaluation} charCount={charCount} />
    </>
  );
}
