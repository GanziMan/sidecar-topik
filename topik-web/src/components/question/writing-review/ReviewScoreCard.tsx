import { Card } from "@/components/ui/card";
import clsx from "clsx";

interface ReviewScoreCardProps {
  className?: string;
  title: string;
  score: number;
  totalScore: number | string;
  evaluation?: string;
}

export default function ReviewScoreCard({ className, title, score, totalScore, evaluation }: ReviewScoreCardProps) {
  return (
    <Card className={clsx("px-6 py-4 flex flex-col gap-[14px] w-full h-[110px]", className)}>
      <p className="font-semibold text-[#637381] text-sm">{title}</p>
      <div className="flex items-center gap-[10px]">
        <p className="flex gap-[10px] text-2xl leading-7 text-[#999] font-bold">
          <span className="text-[#030712]">{score}</span>
          <span>/</span>
          <span>{totalScore}</span>
        </p>
        {evaluation && <p className="text-sm text-gray-500">{evaluation}</p>}
      </div>
    </Card>
  );
}
