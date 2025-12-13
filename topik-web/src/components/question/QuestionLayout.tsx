"use client";

import { GetQuestionContentResponse } from "@/types/question.types";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { QuestionType } from "@/types/common.types";
import { useParams } from "next/navigation";
import { PromptContent } from "@/lib/serverActions/agent";
import tw from "tailwind-styled-components";
import QuestionContext from "./QuestionContext";
import AnswerInput from "./AnswerInput";
import { cn } from "@/lib/utils";
// hooks
import useSolver from "@/hooks/useSolver";
import useAnswerForm from "@/hooks/useAnswerForm";
import useCorrection from "@/hooks/useCorrection";
import WritingReview from "../admin/WritingReview";
import { PromptEditor } from "../admin/PromptEditor";

interface QuestionLayoutProps {
  questionContent: GetQuestionContentResponse;
  prompts?: Record<string, PromptContent>;
}

export default function QuestionLayout({ questionContent, prompts }: QuestionLayoutProps) {
  const { year, round, type } = useParams<{ year: string; round: string; type: QuestionType }>();
  const {
    type: answerType,
    onChange: handleAnswerChange,
    data: answer,
    reset: handleResetAnswer,
  } = useAnswerForm(type);

  const {
    evaluationResult,
    isLoading,
    handleEvaluation,
    reset: handleResetSolver,
  } = useSolver({ year, round, type, questionId: questionContent.id, answer });

  const {
    correctionResult,
    isCorrectionLoading,
    handleCorrection,
    reset: handleResetCorrection,
  } = useCorrection({
    year,
    round,
    type,
    essayAnswer: answerType === "essay" ? answer : "",
    evaluationResult: evaluationResult!,
  });
  const { meta, instruction, context } = questionContent.content;
  const { number, score } = meta;

  return (
    <div className="flex gap-7.5 justify-center">
      <LoadingOverlay
        isLoading={isLoading || isCorrectionLoading}
        label={isCorrectionLoading ? "첨삭 중..." : "채점 중..."}
      >
        <div className={cn("flex gap-7.5", prompts && "flex-col")}>
          <QuestionFormContainer>
            <QuestionTitle>{`${number}. ${instruction} (${score}점)`}</QuestionTitle>

            {/* 문제 내용 */}
            <QuestionContext content={context} year={Number(year)} round={Number(round)} questionNumber={number} />

            {/* 답안 입력 */}
            <AnswerInput
              answerType={answerType}
              answer={answer}
              questionType={type}
              handleAnswerChange={handleAnswerChange}
              inputDisabled={!!evaluationResult}
              onCorrection={handleCorrection}
              onSubmit={() => {
                if (evaluationResult) {
                  handleResetCorrection();
                  handleResetAnswer();
                  handleResetSolver();
                  return;
                }
                handleEvaluation();
              }}
            />
          </QuestionFormContainer>

          {/* 채점 결과 */}
          {evaluationResult &&
            ("error" in evaluationResult ? (
              <div className="text-red-500">{evaluationResult.error as string}</div>
            ) : (
              <WritingReview
                questionId={questionContent.id as string}
                questionType={type}
                evaluationResult={evaluationResult!}
                correctionResult={correctionResult}
                isCorrectionLoading={isCorrectionLoading}
                charCount={Array.from(answerType === "essay" ? answer : "").length}
              />
            ))}
        </div>
      </LoadingOverlay>

      {prompts && <PromptEditor prompts={prompts} questionType={type} />}
    </div>
  );
}

const QuestionFormContainer = tw.div`
  p-5 flex flex-col gap-7.5 bg-white w-[553px]
`;

const QuestionTitle = tw.p`
  font-semibold
`;
