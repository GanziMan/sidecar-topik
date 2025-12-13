import { Card } from "@/components/ui/card";
import { EvaluationResponseUnion, SentenceCompletionResponse, WritingResponse } from "@/types/question.types";
import { QuestionType } from "@/types/common.types";

interface ModelReviewProps {
  questionType: QuestionType;
  evaluationResult: EvaluationResponseUnion;
}

export default function ModelReview({ questionType, evaluationResult }: ModelReviewProps) {
  const modelAnswerContent = getModelAnswerContent(questionType, evaluationResult);
  return (
    <Card className="p-5 bg-[#F7F7F7] flex flex-col gap-[14px] w-[513px]">
      <p className="font-semibold">모범 답안</p>
      <p className="whitespace-pre-line">{modelAnswerContent}</p>
    </Card>
  );
}

function getModelAnswerContent(questionType: QuestionType, evaluationResult: EvaluationResponseUnion): string {
  // Q51, Q52: 문제 유형 모범 답안
  switch (questionType) {
    case QuestionType.Q51:
    case QuestionType.Q52: {
      const { model_answer } = evaluationResult as SentenceCompletionResponse;
      return `㉠ ${model_answer.answer1} \n ㉡ ${model_answer.answer2}`;
    }
    // Q53, Q54: 글쓰기 모범 답안
    case QuestionType.Q53:
    case QuestionType.Q54: {
      const { model_answer } = evaluationResult as WritingResponse;
      return model_answer;
    }
    default:
      throw new Error(`Invalid questionType: ${questionType}`);
  }
}
