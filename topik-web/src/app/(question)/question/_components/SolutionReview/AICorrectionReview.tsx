import { Card } from "@/components/ui/card";
import Image from "next/image";
import { QuestionType } from "@/types/topik.types";
import { CorrectionChangeSentence, CorrectionResponse } from "@/types/topik-correct.types";

import React from "react";

interface AICorrectionReviewProps {
  questionType: QuestionType;
  correctionResult?: CorrectionResponse;
  isLoading: boolean;
  error?: string;
  initialScore: number;
}
// AI 첨삭
export default function AICorrectionReview({
  questionType,
  correctionResult,
  isLoading,
  error,
  initialScore,
}: AICorrectionReviewProps) {
  const isEssayQuestion = questionType === QuestionType.Q53 || questionType === QuestionType.Q54;

  if (!isEssayQuestion) {
    return (
      <Card className="p-5 bg-[#F7F7F7] flex flex-col gap-[14px] w-[513px]">
        <p className="font-semibold">AI 첨삭</p>
        <p>53번, 54번 문제만 AI 첨삭 기능을 제공합니다.</p>
      </Card>
    );
  }

  if (isLoading) {
    return <MessageCard title="AI 첨삭" message="AI가 글을 첨삭하고 있습니다. 잠시만 기다려주세요..." />;
  }

  if (error) {
    return <MessageCard title="오류" message={error} />;
  }

  if (!correctionResult) {
    return null;
  }

  const { improvement_effects, sentence_corrections } = correctionResult;
  const { expected_score_gain, key_improvements } = improvement_effects;

  return (
    <>
      <div className="flex flex-col justify-between gap-[19px]">
        <CorrectionCard
          title="교정 후 예측 점수"
          content={<ScoreChangeIndicator initialScore={initialScore} scoreGain={Number(expected_score_gain) || 0} />}
        />
        <div className="flex gap-5">
          <CorrectionCard title="문장 교정" content={`${sentence_corrections?.length || 0}`} />
        </div>

        <Card className="p-5 bg-[#F7F7F7] flex flex-col gap-[14px] w-full">
          <p className="font-semibold">AI 첨삭</p>
          <CorrectedEssayView correctionResult={correctionResult} />
        </Card>
        <Card className="p-5 bg-[#F7F7F7] flex flex-col gap-[14px] w-full">
          <p className="font-semibold">주요 개선 사항</p>
          <ul className="list-none list-inside ps-2">
            {key_improvements?.map((item, index) => (
              <li key={`improvement-${index}`}>
                {"•"} {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

interface CorrectionCardProps {
  title: string;
  content: React.ReactNode;
}
function CorrectionCard({ title, content }: CorrectionCardProps) {
  return (
    <Card className="px-6 py-4 flex flex-col gap-[14px] w-full h-[110px]">
      <p className="font-semibold text-[#637381] text-sm">{title}</p>
      <div className="flex gap-[10px] text-2xl leading-7 font-bold">{content}</div>
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
        <p className="flex items-center gap-0.5">
          <Image
            className="mt-0.5"
            src="/icons/icon-triangle-up-red.svg"
            alt="triangle-up-red icon"
            width={16}
            height={16}
          />
          <span className="text-[#FF645F] text-xs">
            {scoreGain} <span className="text-[#979AA0] text-[9px]">점</span>
          </span>
        </p>
      )}
    </div>
  );
}

function MessageCard({ title, message }: { title: string; message: string }) {
  return (
    <Card className="p-5 bg-[#F7F7F7] flex flex-col gap-[14px] w-full">
      <p className="font-semibold">{title}</p>
      <p>{message}</p>
    </Card>
  );
}

interface CorrectedEssayViewProps {
  correctionResult: CorrectionResponse;
}

function CorrectedEssayView({ correctionResult }: CorrectedEssayViewProps) {
  const { sentence_corrections, original_answer } = correctionResult;

  if (!original_answer) {
    return null;
  }

  const paragraphs = original_answer
    .split("\n")
    .filter((p) => p.trim() !== "")
    .map((p) => p.match(/[^.!?]+[.!?\s]*/g) || [p]);

  if (!sentence_corrections || sentence_corrections.length === 0) {
    return <div className="whitespace-pre-line"> 첨삭 결과가 없습니다. </div>;
  }

  const invalidCorrections: CorrectionChangeSentence[] = [];
  sentence_corrections.forEach((correction, index) => {
    const { position, original, revised, reason } = correction;
    const pIndex = position.paragraph - 1;
    const sIndex = position.sentence - 1;

    if (paragraphs[pIndex] && paragraphs[pIndex][sIndex]) {
      const originalSentence = paragraphs[pIndex][sIndex];
      paragraphs[pIndex][sIndex] = originalSentence.replace(
        original.trim(),
        `<span class='text-blue-500 font-bold' title="${reason}"><span class='text-xs text-red-300'>${
          index + 1
        }</span>${revised}</span>`
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
