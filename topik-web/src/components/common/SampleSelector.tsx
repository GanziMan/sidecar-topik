"use client";

import { Button } from "@/components/ui/button";
import { SAMPLE_ANSWERS, SampleAnswer } from "@/data/samples";
import { QuestionType } from "@/types/common.types";

interface SampleSelectorProps {
  year: number;
  round: number;
  questionType: QuestionType;
  onSelect: (sample: SampleAnswer) => void;
}

export default function SampleSelector({ year, round, questionType, onSelect }: SampleSelectorProps) {
  const key = `${year}-${round}-${questionType}`;
  const samples = SAMPLE_ANSWERS[key] || [];

  if (samples.length === 0) return null;

  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      <span className="text-xs text-gray-500 self-center mr-2 font-bold">[시연용 샘플]</span>
      {samples.map((sample) => (
        <Button
          key={sample.label}
          variant="outline"
          size="sm"
          onClick={() => onSelect(sample)}
          className="text-xs h-7 px-2 bg-gray-50 hover:bg-gray-100"
        >
          {sample.label}
        </Button>
      ))}
    </div>
  );
}
