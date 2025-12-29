import { Card } from "@/components/ui/card";
import Image from "next/image";
import { QuestionType } from "@/types/common.types";
import { CorrectionChangeSentence, CorrectionResponse } from "@/types/question.types";
import React from "react";
import { cn } from "@/lib/utils";

interface CorrectionReviewProps {
  questionType: QuestionType;
  correctionResult?: CorrectionResponse;
  isLoading: boolean;
  error?: string;
  initialScore: number;
  answer: string;
}
// AI 첨삭
export default function CorrectionReview({
  questionType,
  correctionResult,
  isLoading,
  error,
  initialScore,
  answer,
}: CorrectionReviewProps) {
  const isEssayQuestion = questionType === QuestionType.Q53 || questionType === QuestionType.Q54;

  if (!isEssayQuestion) {
    return (
      <Card className="p-5 bg-[#F7F7F7] flex flex-col gap-[14px] w-[513px]">
        <p className="font-semibold">AI 첨삭</p>
        <p>53번, 54번 문제만 AI 첨삭 기능을 제공합니다.</p>
      </Card>
    );
  }
  if (!correctionResult)
    return <CorrectionCard contentClassName="text-base font-normal" title="AI 첨삭" content="첨삭을 진행해주세요." />;

  if (isLoading)
    return (
      <CorrectionCard
        contentClassName="text-base font-normal"
        title="AI 첨삭"
        content="AI가 글을 첨삭하고 있습니다. 잠시만 기다려주세요..."
      />
    );

  if (error)
    return <CorrectionCard contentClassName="text-base text-red-500 font-normal" title="오류" content={error} />;

  const { improvement_effects, sentence_corrections } = correctionResult;

  return (
    <>
      <div className="flex flex-col justify-between gap-4">
        <CorrectionCard
          title="교정 후 예측 점수"
          content={
            <ScoreChangeIndicator
              initialScore={initialScore}
              scoreGain={Number(improvement_effects?.expected_score_gain) || 0}
            />
          }
        />
        <CorrectionCard title="문장 교정" content={`${sentence_corrections?.length || 0}`} />
        <CorrectionCard
          title="AI 첨삭"
          contentClassName="text-base font-normal"
          content={<CorrectedEssayView correctionResult={correctionResult} answer={answer} />}
        />
        <CorrectionCard
          title="주요 개선 사항"
          contentClassName="text-base font-normal"
          content={
            <ul className="list-none list-inside ps-2">
              {improvement_effects?.key_improvements?.map((improvement: string, index: number) => (
                <li key={`improvement-${index}`}>
                  {"•"} {improvement}
                </li>
              ))}
            </ul>
          }
        />
      </div>
    </>
  );
}

interface CorrectionCardProps {
  title: string;
  content: React.ReactNode;
  contentClassName?: string;
}
function CorrectionCard({ title, content, contentClassName }: CorrectionCardProps) {
  return (
    <Card className="px-6 flex flex-col gap-[14px] w-full py-6">
      <p className="font-semibold text-[#637381] text-sm">{title}</p>
      <div className={cn("flex gap-[10px] text-2xl leading-7 font-bold break-keep", contentClassName)}>{content}</div>
    </Card>
  );
}

interface ScoreChangeIndicatorProps {
  initialScore: number;
  scoreGain: number;
}

function ScoreChangeIndicator({ initialScore, scoreGain }: ScoreChangeIndicatorProps) {
  const finalScore = initialScore + scoreGain;
  const isScoreGained = scoreGain > 0;

  return (
    <div className="flex items-center gap-2.5">
      <p className="text-lg font-bold">
        <span className="text-gray-400">{initialScore}점</span>
        <span className="mx-2">&rarr;</span>
        <span>{finalScore}점</span>
      </p>
      {isScoreGained && (
        <div className="flex items-center gap-0.5">
          <Image
            className="mt-0.5"
            src="/icons/icon-triangle-up-red.svg"
            alt="triangle-up-red icon"
            width={16}
            height={16}
          />
          <p className="text-[#FF645F] text-xs">
            {scoreGain} <span className="text-[#979AA0] text-[9px]">점</span>
          </p>
        </div>
      )}
    </div>
  );
}

interface CorrectedEssayViewProps {
  correctionResult: CorrectionResponse;
  answer: string;
}

function CorrectedEssayView({ correctionResult, answer }: CorrectedEssayViewProps) {
  const { sentence_corrections } = correctionResult;

  if (!answer) {
    return null;
  }

  const paragraphs = answer
    .split("\n")
    .filter((p) => p.trim() !== "")
    .map((p) => p.match(/[^.!?]+[.!?\s]*/g) || [p]);

  if (!sentence_corrections || sentence_corrections.length === 0) {
    return <div className="whitespace-pre-line"> 첨삭 결과가 없습니다. </div>;
  }

  const invalidCorrections: CorrectionChangeSentence[] = [];
  sentence_corrections.forEach((correction) => {
    const { position, original, revised, reason } = correction;
    const pIndex = position.paragraph - 1;
    const sIndex = position.sentence - 1;

    if (paragraphs[pIndex] && paragraphs[pIndex][sIndex]) {
      const originalSentence = paragraphs[pIndex][sIndex];
      paragraphs[pIndex][sIndex] = originalSentence.replace(
        original.trim(),
        `<span class='text-red-500 line-through' title="원본: ${original.trim()}">${original.trim()}</span> <span class='text-blue-500 font-bold' title="첨삭: ${revised} (이유: ${reason})">${revised}</span>`
      );
    } else {
      invalidCorrections.push(correction);
    }
  });

  return (
    <div>
      {paragraphs.map((paragraph, pIndex) => (
        <p key={pIndex} className="mb-4 last:mb-0">
          {paragraph.map((sentence, sIndex) => (
            <span key={sIndex} dangerouslySetInnerHTML={{ __html: sentence }} />
          ))}
        </p>
      ))}
      {invalidCorrections.length > 0 && (
        <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-md">
          <h4 className="font-bold text-red-700">오류: 일부 첨삭을 적용할 수 없습니다.</h4>
          <p className="text-sm text-red-600">
            AI가 생성한 문장 위치 정보가 잘못되어 다음 첨삭들이 반영되지 않았습니다.
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-red-600">
            {invalidCorrections.map((c, i) => (
              <li key={i}>
                문단 {c.position.paragraph}, 문장 {c.position.sentence}: &quot;{c.original}&quot; &rarr; &quot;
                {c.revised}
                &quot;
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
