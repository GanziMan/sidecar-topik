"use client";

import { Card } from "@/components/ui/card";
import { QuestionType } from "@/types/topik.types";
import { useState, useEffect } from "react";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EvaluationResponseUnion } from "@/types/topik-write.types";
import AIEvaluationReview from "./AIEvaluationReview";
import { DialogDescription } from "@radix-ui/react-dialog";
import { CorrectionResponse } from "@/types/topik-correct.types";

interface EvaluationResult {
  evaluation: EvaluationResponseUnion;
  correction: CorrectionResponse;
}
interface EvaluationRecord {
  id: string;
  attempt_no: number;
  created_at: string;
  user_answer: string;
  submission_results: EvaluationResult;
}

interface EvaluationHistoryProps {
  questionId: string;
  questionType: QuestionType;
  evaluationResult: EvaluationResponseUnion;
}

export default function EvaluationHistory({ questionId, questionType, evaluationResult }: EvaluationHistoryProps) {
  const [evaluationRecords, setEvaluationRecords] = useState<EvaluationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRecord, setSelectedRecord] = useState<EvaluationRecord | null>(null);

  useEffect(() => {
    const fetchEvaluationHistory = async () => {
      if (!questionId) return;
      try {
        setIsLoading(true);
        const response = await fetch(`/api/submissions/question/${questionId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch evaluation history.");
        }
        const data: EvaluationRecord[] = await response.json();

        setEvaluationRecords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluationHistory();
  }, [questionId, evaluationResult]);

  if (isLoading) {
    return <div>이전 채점 기록을 불러오는 중입니다...</div>;
  }
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Dialog>
      <div className="flex flex-col gap-1">
        <DialogTitle>채점 결과 비교</DialogTitle>
        <DialogDescription className="text-sm text-gray-500"> 비교할 채점 기록을 선택하세요. </DialogDescription>
      </div>
      {evaluationRecords.length > 1 ? (
        <div className="flex flex-col gap-4">
          {evaluationRecords.map((record, index) => {
            if (index === 0) return null;

            return (
              <DialogTrigger asChild key={record.id} onClick={() => setSelectedRecord(record)}>
                <Card className="cursor-pointer p-4 bg-[#F7F7F7] gap-[14px] w-full flex justify-between items-center hover:bg-gray-200 border">
                  <span className="font-medium text-sm whitespace-pre-line text-black">
                    {record.user_answer === ""
                      ? "답안을 입력하지 않았습니다."
                      : `${getModelAnswerContent(questionType, record.user_answer)}`}
                  </span>
                  <span className="text-xs text-gray-500 w-20">{new Date(record.created_at).toLocaleDateString()}</span>
                </Card>
              </DialogTrigger>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400">비교할 다른 채점 기록이 없습니다.</p>
      )}

      <DialogContent className="max-w-7xl w-full overflow-y-auto max-h-[calc(100vh-80px)]">
        <Comparison questionType={questionType} historicalReview={selectedRecord} evaluationResult={evaluationResult} />
      </DialogContent>
    </Dialog>
  );
}

function getModelAnswerContent(
  questionType: QuestionType,
  userAnswer: string | { answer1: string; answer2: string } | { essay_answer: string }
): string {
  let content = "";
  switch (questionType) {
    case QuestionType.Q51:
    case QuestionType.Q52:
      const { answer1, answer2 } = userAnswer as { answer1: string; answer2: string };
      content = `㉠ ${answer1 || ""} \n ㉡ ${answer2 || ""}`;
      break;
    case QuestionType.Q53:
    case QuestionType.Q54:
      content = userAnswer as string;
      break;
    default:
      content = "답안을 표시할 수 없습니다.";
  }
  return content.length > 40 ? content.substring(0, 40) + "..." : content;
}

interface ReviewData {
  attempt_no: number;
  user_answer: Object;
  submission_results: {
    evaluation: EvaluationResponseUnion;
  };
}

interface ComparisonDialogProps {
  questionType: QuestionType;
  historicalReview: ReviewData | null;
  evaluationResult: EvaluationResponseUnion;
}

export function Comparison({ questionType, historicalReview, evaluationResult }: ComparisonDialogProps) {
  if (!historicalReview) {
    return null;
  }

  // TODO: 추후 수정
  // const getCharCount = (answer: any): number => {
  //   if (typeof answer === "string") return answer.length;
  //   if (typeof answer?.essay_answer === "string") return answer.essay_answer.length;
  //   return 0;
  // };

  const historicalEvaluation = historicalReview.submission_results.evaluation;

  return (
    <div className="flex gap-4 mx-auto">
      <div className="p-4  rounded-lg flex flex-col gap-5">
        <h3 className="text-lg font-bold text-blue-400">현재 채점 결과 (시도 #{historicalReview.attempt_no})</h3>
        <AIEvaluationReview questionType={questionType} evaluationResult={evaluationResult} />
      </div>

      <div className="p-4  rounded-lg flex flex-col gap-5">
        <h3 className="text-lg font-bold">이전 채점 결과 (시도 #{historicalReview.attempt_no})</h3>
        {historicalEvaluation ? (
          <AIEvaluationReview questionType={questionType} evaluationResult={historicalEvaluation} />
        ) : (
          <p>채점 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
