"use client";

import { GetQuestionContentResponse, SentenceCompletionAnswer } from "@/types/topik-write.types";
import { QuestionType } from "@/types/topik.types";
import Essay from "./Essay";
import SentenceCompletion from "./SentenceCompletion";
import { QUESTION_CONFIG } from "@/config/topik-write.config";

interface QuestionFormProps {
  questionType: QuestionType;
  questionContent: GetQuestionContentResponse;
  isLoading: boolean;
  handleSentenceCompletionAnswerChange: (icon: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEssayChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  sentenceCompletionAnswer: SentenceCompletionAnswer;
  essayAnswer: string;
  inputDisabled: boolean;
  isSubmitted: boolean;
}

export default function QuestionForm(props: QuestionFormProps) {
  const { questionType, questionContent, isLoading, inputDisabled } = props;
  const { title, question_text, image_url } = questionContent;
  const { type, maxLength } = QUESTION_CONFIG[questionType];

  return (
    <div className="p-7.5 flex flex-col gap-7.5 bg-white w-[553px]">
      <p className="font-semibold">
        {questionType}. {title}
      </p>

      {questionType === QuestionType.Q53 && image_url ? (
        <img
          src={image_url}
          className="w-full h-auto"
          alt={`${questionType}번 문제 이미지`}
          loading="lazy"
          width={553}
          height={300}
        />
      ) : (
        <div
          className="flex flex-col border border-[#B4B4B4]"
          dangerouslySetInnerHTML={{ __html: question_text?.replace(/className=/g, "class=") ?? "" }}
        />
      )}

      {type === "sentenceCompletion" && (
        <SentenceCompletion
          handleSentenceCompletionAnswerChange={props.handleSentenceCompletionAnswerChange}
          sentenceCompletionAnswer={props.sentenceCompletionAnswer}
          inputDisabled={inputDisabled || isLoading}
          isSubmitted={props.isSubmitted}
        />
      )}

      {type === "essay" && (
        <Essay
          maxLength={maxLength}
          handleEssayChange={props.handleEssayChange}
          essayAnswer={props.essayAnswer}
          inputDisabled={inputDisabled || isLoading}
        />
      )}
    </div>
  );
}
