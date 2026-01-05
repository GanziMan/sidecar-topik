import { useState, useCallback } from "react";

import { CorrectionResponse } from "@/types/question.types";
import { QuestionParams } from "@/types/common.types";
import { EvaluationResponseUnion } from "@/types/question.types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { HTTPError } from "ky";
import { fetchCorrection } from "@/lib/clientActions";

interface UseCorrectionProps extends QuestionParams {
  essayAnswer: string;
  evaluationResult: EvaluationResponseUnion;
}

export default function useCorrection({ year, round, type, essayAnswer, evaluationResult }: UseCorrectionProps) {
  const [correctionResult, setCorrectionResult] = useState<CorrectionResponse | null>(null);
  const [isCorrectionLoading, setIsCorrectionLoading] = useState(false);
  const router = useRouter();

  const handleCorrection = useCallback(async () => {
    if (correctionResult) return;
    setIsCorrectionLoading(true);

    try {
      const result = await fetchCorrection({
        year,
        round,
        type,
        essayAnswer,
        evaluationResult,
      });
      if (result.success) setCorrectionResult(result.data);
      else toast.error(result.error.message);
    } catch (error) {
      if (error instanceof HTTPError && error.response.status === 401) router.push("/login");
      else {
        console.error(error);
        toast.error("첨삭 중 오류가 발생했습니다. \n다시 후 다시 시도해주세요.");
      }
    } finally {
      setIsCorrectionLoading(false);
    }
  }, [correctionResult, year, round, type, essayAnswer, evaluationResult, router]);

  const reset = () => {
    setCorrectionResult(null);
    setIsCorrectionLoading(false);
  };

  return { correctionResult, isCorrectionLoading, handleCorrection, reset };
}
