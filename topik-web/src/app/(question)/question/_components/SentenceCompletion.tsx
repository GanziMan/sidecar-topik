"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { SentenceCompletionAnswer } from "@/types/topik-write.types";

const answerFields = [
  { icon: "ㄱ", key: "answer1" as const },
  { icon: "ㄴ", key: "answer2" as const },
];

interface SentenceCompletionProps {
  handleSentenceCompletionAnswerChange: (icon: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  sentenceCompletionAnswer: SentenceCompletionAnswer;
  inputDisabled: boolean;
  isSubmitted: boolean;
}
export default function SentenceCompletion({
  handleSentenceCompletionAnswerChange,
  sentenceCompletionAnswer,
  inputDisabled,
  isSubmitted,
}: SentenceCompletionProps) {
  return (
    <div className="flex flex-col gap-5">
      {answerFields.map((field) => (
        <SentenceCompletionInput
          key={field.icon}
          icon={field.icon}
          value={sentenceCompletionAnswer[field.key]}
          onChange={handleSentenceCompletionAnswerChange}
          disabled={inputDisabled}
          isSubmitted={isSubmitted}
        />
      ))}
    </div>
  );
}

interface SentenceCompletionInputProps {
  icon: string;
  value: string;
  onChange?: (icon: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled: boolean;
  isSubmitted: boolean;
}

function SentenceCompletionInput({
  icon,
  value,
  onChange,
  className,
  disabled,
  isSubmitted,
}: SentenceCompletionInputProps) {
  const validationMessage = isSubmitted && value.length < 1 ? "빈칸을 채워 입력하세요." : "";
  return (
    <div className="relative">
      <div className="w-[33px] h-[33px] rounded-full absolute top-[15px] left-5 border-[#B3B3B3] border-[0.5px] flex items-center justify-center">
        {icon}
      </div>
      <Image src="/icons/icon-upload.svg" alt="upload" width={24} height={24} className="absolute top-5 right-5" />

      <Input
        type="text"
        className={cn("w-full h-[63px] pl-[63px] py-[15px] border-[0.5px] border-[#B3B3B3] rounded-[10px]", className)}
        placeholder="빈칸을 채워 입력하세요."
        value={value}
        onChange={(e) => onChange?.(icon, e)}
        disabled={disabled}
      />
      {validationMessage && <ValidationMessage message={icon + validationMessage} />}
    </div>
  );
}

function ValidationMessage({ message }: { message: string }) {
  return <div className="px-1 mt-1 text-red-500 text-sm">{message}</div>;
}
