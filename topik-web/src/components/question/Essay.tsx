"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface EssayInputProps {
  maxLength: number;
  essayAnswer?: string;
  handleEssayChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  inputDisabled: boolean;
}
export default function EssayInput(props: EssayInputProps) {
  const { maxLength, essayAnswer, handleEssayChange, inputDisabled } = props;
  const essayAnswerLength = Array.from(essayAnswer || "").length;
  const isOverMaxLength = essayAnswerLength >= maxLength;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [essayAnswer]);

  return (
    <div className="flex flex-col gap-2.5">
      <textarea
        className="w-full h-auto box-border overflow-hidden scroll-auto px-5 py-3.75 border-[0.5px] border-[#B3B3B3] rounded-[10px] resize-none"
        placeholder="내용을 입력하세요."
        value={essayAnswer}
        onChange={handleEssayChange}
        disabled={inputDisabled}
        ref={textareaRef}
      />

      <span className={cn("text-right text-[#9D9D9D]", isOverMaxLength && "text-[#FF645F]")}>
        {essayAnswerLength} / {maxLength}
      </span>
    </div>
  );
}
