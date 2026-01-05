"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SentenceCompletionAnswer } from "@/types/question.types";
import tw from "tailwind-styled-components";

const answerFields = [
  { symbol: "ㄱ", key: "answer1" },
  { symbol: "ㄴ", key: "answer2" },
];

interface SentenceCompletionProps {
  handleSentenceCompletionAnswerChange: (e: React.ChangeEvent<HTMLInputElement>, symbol: string) => void;
  sentenceCompletionAnswer: SentenceCompletionAnswer;
  inputDisabled: boolean;
}
export default function SentenceCompletion({
  handleSentenceCompletionAnswerChange,
  sentenceCompletionAnswer,
  inputDisabled,
}: SentenceCompletionProps) {
  return (
    <SentenceCompletionContainer>
      {answerFields.map((field) => (
        <SentenceCompletionInput
          key={field.symbol}
          symbol={field.symbol}
          value={sentenceCompletionAnswer[field.key as keyof SentenceCompletionAnswer]}
          onChange={handleSentenceCompletionAnswerChange}
          disabled={inputDisabled}
        />
      ))}
    </SentenceCompletionContainer>
  );
}

interface SentenceCompletionInputProps {
  symbol: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>, symbol: string) => void;
  className?: string;
  disabled: boolean;
}

function SentenceCompletionInput({ symbol, value, onChange, className, disabled }: SentenceCompletionInputProps) {
  return (
    <SentenceCompletionInputContainer>
      <SentenceCompletionSymbol>{symbol}</SentenceCompletionSymbol>

      <Input
        type="text"
        className={cn("w-full h-[63px] pl-[63px] py-[15px] border-[0.5px] border-[#B3B3B3] rounded-[10px]", className)}
        placeholder="빈칸을 채워 입력하세요."
        value={value}
        onChange={(e) => onChange?.(e, symbol)}
        disabled={disabled}
      />
    </SentenceCompletionInputContainer>
  );
}

const SentenceCompletionContainer = tw.div`flex flex-col gap-5`;
const SentenceCompletionSymbol = tw.div`w-[33px] h-[33px] rounded-full absolute top-[15px] left-5 border-[#B3B3B3] border-[0.5px] flex items-center justify-center`;
const SentenceCompletionInputContainer = tw.div`relative`;
