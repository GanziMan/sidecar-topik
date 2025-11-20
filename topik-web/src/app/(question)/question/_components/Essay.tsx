"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
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

      <div className="flex items-center justify-between">
        <div className="flex gap-2.5">
          <Button type="upload" text="답안지 업로드" />
          <Button type="eye" text="원고지 보기" />
        </div>
        <span className={cn("float-right text-[#9D9D9D]", isOverMaxLength && "text-[#FF645F]")}>
          {essayAnswerLength} / {maxLength}
        </span>
      </div>
    </div>
  );
}

interface ButtonProps {
  type: "upload" | "eye";
  text: string;
}
function Button({ type, text }: ButtonProps) {
  return (
    <button className="cursor-pointer flex items-center gap-2.5 p-2.5 border-[0.5px] border-[#C8C8C8] rounded-[10px]">
      <Image src={`/icons/icon-${type}.svg`} alt={type} width={24} height={24} />
      <span>{text}</span>
    </button>
  );
}
