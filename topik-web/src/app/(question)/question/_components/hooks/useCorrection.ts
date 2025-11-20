import { useState, useEffect } from "react";
import { fetchCorrection } from "../../actions";
import { CorrectionResponse } from "@/types/topik-correct.types";
import { QuestionType } from "@/types/topik.types";
import { EvaluationResponseUnion } from "@/types/topik-write.types";
import toast from "react-hot-toast";

interface UseCorrectionProps {
  reviewType: string;
  questionYear: number;
  questionRound: number;
  questionType: QuestionType;
  essayAnswer: string;
  evaluationResult: EvaluationResponseUnion;
}

export function useCorrection({
  reviewType,
  questionYear,
  questionRound,
  questionType,
  essayAnswer,
  evaluationResult,
}: UseCorrectionProps) {
  const [correctionResult, setCorrectionResult] = useState<CorrectionResponse | null>(null);
  const [isCorrectionLoading, setIsCorrectionLoading] = useState(false);

  useEffect(() => {
    if (reviewType !== "ai_correction" || correctionResult) {
      return;
    }

    const getCorrection = async () => {
      if (questionType !== QuestionType.Q53 && questionType !== QuestionType.Q54) {
        return;
      }
      setIsCorrectionLoading(true);

      try {
        const result = await fetchCorrection(questionYear, questionRound, questionType, essayAnswer, evaluationResult);
        setCorrectionResult(result);
      } catch (e) {
        console.error(e);
        toast.error("첨삭 중 오류가 발생했습니다. \n다시 후 다시 시도해주세요.");
      } finally {
        setIsCorrectionLoading(false);
      }
    };

    getCorrection();
  }, [reviewType, correctionResult, questionType, essayAnswer, evaluationResult, questionYear, questionRound]);

  return { correctionResult, isCorrectionLoading };
}
