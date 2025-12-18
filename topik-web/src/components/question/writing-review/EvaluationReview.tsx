import { EvaluationResponseUnion, SentenceCompletionResponse, WritingResponse } from "@/types/question.types";
import { QuestionType } from "@/types/common.types";
import FeedbackCard from "./FeedbackCard";
import ReviewScoreCard from "./ReviewScoreCard";
import { QUESTION_CONFIG } from "@/config/question.config";
import { Json } from "@/types/supabase";

interface EvaluationReviewProps {
  questionType: QuestionType;
  evaluationResult: Json | EvaluationResponseUnion;
  charCount?: number;
}

export default function EvaluationReview({ questionType, evaluationResult, charCount }: EvaluationReviewProps) {
  if (!evaluationResult) {
    return null;
  }
  switch (questionType) {
    // Q51, Q52: 문제 유형 채점
    case QuestionType.Q51:
    case QuestionType.Q52:
      return (
        <SentenceCompletionView
          questionType={questionType}
          evaluationResult={evaluationResult as SentenceCompletionResponse}
        />
      );
    // Q53, Q54: 글쓰기 채점
    case QuestionType.Q53:
    case QuestionType.Q54:
      return (
        <EssayView
          questionType={questionType}
          evaluationResult={evaluationResult as WritingResponse}
          charCount={charCount || 0}
        />
      );
    default:
      throw new Error(`Invalid questionType: ${questionType}`);
  }
}

const getCharCountEvaluation = (questionType: QuestionType, charCount: number) => {
  if (questionType === QuestionType.Q53 || questionType === QuestionType.Q54) {
    const { charLimits } = QUESTION_CONFIG[questionType];
    if (charLimits && charCount < charLimits.min) return "분량 미달";
    if (charLimits && charCount > charLimits.max) return "분량 초과";
    return "적정 범위";
  }
  return "";
};

interface SentenceCompletionViewProps {
  questionType: QuestionType;
  evaluationResult: SentenceCompletionResponse;
}

function SentenceCompletionView({ questionType, evaluationResult }: SentenceCompletionViewProps) {
  const { total_score, scores, strengths, weaknesses, improvement_suggestions } = evaluationResult;
  const { totalScore, scoreInfo } = QUESTION_CONFIG[questionType];
  const feedbacks = [
    { title: "강점", content: strengths },
    { title: "약점", content: weaknesses },
    { title: "개선 사항", content: improvement_suggestions },
  ];
  if (!evaluationResult) {
    return null;
  }
  return (
    <>
      <ReviewScoreCard title="총점" score={total_score} totalScore={totalScore} />
      <div className="flex gap-5">
        <ReviewScoreCard title="ㄱ 빈칸" score={scores.answer1} totalScore={scoreInfo.answer1} />
        <ReviewScoreCard title="ㄴ 빈칸" score={scores.answer2} totalScore={scoreInfo.answer2} />
      </div>
      {feedbacks.map(({ title, content }) => (
        <FeedbackCard key={title} title={title} contents={content.length > 0 ? content : `${title}이 없습니다.`} />
      ))}
    </>
  );
}

interface EssayViewProps {
  questionType: QuestionType;
  evaluationResult: WritingResponse;
  charCount: number;
}

function EssayView({ questionType, evaluationResult, charCount }: EssayViewProps) {
  const { total_score, scores, strengths, weaknesses, improvement_suggestions } = evaluationResult;
  const { totalScore, scoreInfo, charLimits } = QUESTION_CONFIG[questionType];
  const scoreInfos = [
    {
      title: "내용 및 과제수행",
      score: scores?.task_performance || 0,
      total: scoreInfo.task_performance,
    },
    { title: "글의 전개 구조", score: scores?.structure || 0, total: scoreInfo.structure },
    { title: "언어 사용", score: scores?.language_use || 0, total: scoreInfo.language_use },
  ];
  const feedbacks = [
    { title: "강점", content: strengths },
    { title: "약점", content: weaknesses },
    { title: "개선 사항", content: improvement_suggestions },
  ];

  const charCountEvaluation = getCharCountEvaluation(questionType, charCount);

  return (
    <>
      <ReviewScoreCard title="총점" score={total_score} totalScore={totalScore} />
      <ReviewScoreCard
        title="글자수"
        score={charCount}
        totalScore={`${charLimits?.min}~${charLimits?.max}`}
        evaluation={charCountEvaluation}
      />
      <div className="flex gap-5">
        {scoreInfos.map(({ title, score, total }) => (
          <ReviewScoreCard key={title} className="h-full p-5" title={title} score={score} totalScore={total} />
        ))}
      </div>
      {feedbacks.map(({ title, content }) => (
        <FeedbackCard key={title} title={title} contents={content?.length > 0 ? content : `${title}이 없습니다.`} />
      ))}
    </>
  );
}
