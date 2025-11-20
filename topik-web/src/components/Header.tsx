"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { QUESTION_TYPES } from "@/config/topik-write.config";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function Header() {
  const { year, round, type } = useParams<{ year: string; round: string; type: string }>();
  const currentQuestionType = type;

  return (
    <header className="flex justify-between items-center w-full h-[60px] border-b-[0.5px] border-[#DDDDDD] px-5">
      <div className="flex gap-2.5">
        {QUESTION_TYPES.map((type) => (
          <Link href={`/question/${year}/${round}/${type}`} key={type}>
            <Button
              variant={type === currentQuestionType ? "default" : "outline"}
              className={cn(type === currentQuestionType && "font-semibold", "text-sm w-[90px]")}
            >
              {type}번 문제
            </Button>
          </Link>
        ))}
      </div>
    </header>
  );
}
