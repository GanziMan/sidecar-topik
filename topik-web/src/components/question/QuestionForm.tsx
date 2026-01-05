import { QuestionType } from "@/types/common.types";
import { SentenceCompletionAnswer } from "@/types/question.types";
import { QUESTION_CONFIG } from "@/config/question.config";
import SentenceCompletion from "./SentenceCompletion";
import Essay from "./Essay";
import { Button } from "../ui/button";
import tw from "tailwind-styled-components";

interface QuestionFormProps {
  questionType: QuestionType;
  inputDisabled: boolean;
  answerType: "sentence" | "essay";
  answer: string | SentenceCompletionAnswer;
  handleAnswerChange:
    | ((e: React.ChangeEvent<HTMLInputElement>, symbol: string) => void)
    | ((e: React.ChangeEvent<HTMLTextAreaElement>) => void);
  onSubmit: () => void;
  onCorrection?: () => void;
}

export default function QuestionForm({
  answerType,
  answer,
  questionType,
  handleAnswerChange,
  inputDisabled,
  onSubmit,
  onCorrection,
}: QuestionFormProps) {
  const { maxLength } = QUESTION_CONFIG[questionType];
  const isEssay = answerType === "essay";
  const isSentence = answerType === "sentence";
  const inputLabel = inputDisabled ? "다시 풀이하기" : "채점하기";

  const renderInput = () => {
    if (isSentence) {
      return (
        <SentenceCompletion
          handleSentenceCompletionAnswerChange={
            handleAnswerChange as (e: React.ChangeEvent<HTMLInputElement>, symbol: string) => void
          }
          sentenceCompletionAnswer={answer as SentenceCompletionAnswer}
          inputDisabled={inputDisabled}
        />
      );
    }

    if (isEssay) {
      return (
        <Essay
          maxLength={maxLength}
          handleEssayChange={handleAnswerChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
          essayAnswer={answer as string}
          inputDisabled={inputDisabled}
        />
      );
    }
    return null;
  };

  return (
    <QuestionFormContainer>
      {renderInput()}
      <QuestionFormButtonsContainer>
        <Button size={"lg"} onClick={onSubmit} variant="default" className="text-lg h-10 flex-1">
          {inputLabel}
        </Button>
        {inputDisabled && isEssay && (
          <Button size={"lg"} onClick={onCorrection} variant="outline" className="text-lg h-10 flex-1">
            AI 첨삭하기
          </Button>
        )}
      </QuestionFormButtonsContainer>
    </QuestionFormContainer>
  );
}

const QuestionFormContainer = tw.div`flex flex-col gap-4`;
const QuestionFormButtonsContainer = tw.div`flex gap-2 w-full`;
