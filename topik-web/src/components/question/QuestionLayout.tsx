"use client";

import { GetQuestionContentResponse } from "@/types/question.types";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { QuestionType } from "@/types/common.types";
import { useParams } from "next/navigation";
import { PromptContent } from "@/lib/serverActions/agent";
import tw from "tailwind-styled-components";
import QuestionContext from "./QuestionContext";
import QuestionForm from "./QuestionForm";
import { cn } from "@/lib/utils";
// hooks
import useSolver from "@/hooks/useSolver";
import useAnswerForm from "@/hooks/useAnswerForm";
import useCorrection from "@/hooks/useCorrection";
import WritingReview from "../admin/WritingReview";
import { PromptEditor } from "../admin/PromptEditor";
import SampleSelector from "@/components/common/SampleSelector";
import { ModalDialog } from "../common/Dialog";
import { Button } from "../ui/button";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { PROMPT_KEYS } from "@/config/prompt-keys.config";
import { useState } from "react";

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
    setValue: handleSetAnswer,
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

  const evaluatorRulesPrompt = prompts![PROMPT_KEYS.EVALUATOR_RULES_PROMPT] as string;
  const correctorRulesPrompt = prompts![PROMPT_KEYS.CORRECTOR_RULES_PROMPT] as string;

  const [selectedRule, setSelectedRule] = useState<"evaluator" | "corrector">("evaluator");

  return (
    <div className="flex gap-7.5 justify-center items-start">
      {prompts && (
        <ModalDialog
          title="채점 규칙"
          description="채점 규칙 및 첨삭 규칙을 수정할 수 있습니다."
          trigger={
            <Button variant={"default"} className="fixed bottom-15 left-4.5 z-50 rounded-full w-9.5 h-9.5 text-[10px]">
              RULE
            </Button>
          }
        >
          <div className="flex gap-2">
            <Button
              size={"sm"}
              variant={selectedRule === "evaluator" ? "default" : "outline"}
              onClick={() => setSelectedRule("evaluator")}
            >
              채점 규칙
            </Button>
            <Button
              size={"sm"}
              variant={selectedRule === "corrector" ? "default" : "outline"}
              onClick={() => setSelectedRule("corrector")}
            >
              첨삭 규칙
            </Button>
          </div>
          <MarkdownPreview source={selectedRule === "evaluator" ? evaluatorRulesPrompt : correctorRulesPrompt} />
        </ModalDialog>
      )}
      <div className={cn("flex gap-7.5", prompts && "flex-col")}>
        <QuestionFormContainer>
          <QuestionTitle>{`${number}. ${instruction} (${score}점)`}</QuestionTitle>

          {/* 문제 내용 */}
          <QuestionContext content={context} year={Number(year)} round={Number(round)} questionNumber={number} />

          <LoadingOverlay
            isLoading={isLoading || isCorrectionLoading}
            label={isCorrectionLoading ? "첨삭 중..." : "채점 중..."}
          >
            {/* 샘플 선택기 */}

            {!evaluationResult && (
              <SampleSelector
                year={Number(year)}
                round={Number(round)}
                questionType={type}
                onSelect={(sample) => {
                  if (answerType === "sentence" && typeof sample.content !== "string") {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (handleSetAnswer as any)(sample.content);
                  } else if (answerType === "essay" && typeof sample.content === "string") {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (handleSetAnswer as any)(sample.content);
                  }
                }}
              />
            )}

            {/* 답안 입력 */}
            <QuestionForm
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
          </LoadingOverlay>
        </QuestionFormContainer>

        {/* 채점 결과 */}
        {evaluationResult &&
          ("error" in evaluationResult ? (
            <div className="text-red-500">{evaluationResult.error as string}</div>
          ) : (
            <WritingReview
              questionType={type}
              evaluationResult={evaluationResult!}
              correctionResult={correctionResult}
              isCorrectionLoading={isCorrectionLoading}
              charCount={Array.from(answerType === "essay" ? answer : "").length}
              answer={answerType === "essay" ? answer : ""}
            />
          ))}
      </div>

      {prompts && (
        <div className="sticky top-[80px] h-fit w-full max-w-[553px]">
          <PromptEditor prompts={prompts} questionType={type} />
        </div>
      )}
    </div>
  );
}

const QuestionFormContainer = tw.div`
  p-5 flex flex-col gap-7.5 bg-white w-[553px]
`;

const QuestionTitle = tw.p`
  font-semibold
`;
