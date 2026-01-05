import { ErrorCode } from "@/config/error-codes.config";
import { fetchEvaluation } from "@/lib/clientActions";
import { EvaluationResponseUnion, SentenceCompletionAnswer } from "@/types/question.types";
import { QuestionParams } from "@/types/common.types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface UseSolverProps extends QuestionParams {
  questionId: string;
  answer: string | SentenceCompletionAnswer;
}
export default function useSolver(params: UseSolverProps) {
  const { answer } = params;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResponseUnion | null>(null);

  const isAnswerEmpty =
    answer === "" || answer === null || answer === undefined || Object.values(answer).some((value) => value === "");

  const reset = () => setEvaluationResult(null);

  const handleEvaluation = async () => {
    if (isAnswerEmpty) {
      toast.error("답변을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    const response = await fetchEvaluation(params);

    if (!response.success) {
      const errorMessage = response.error?.message;
      if (response.error?.code === ErrorCode.SESSION_NOT_FOUND) router.push("/login");
      toast.error(errorMessage);
    } else setEvaluationResult(response.data);

    setIsLoading(false);
  };

  return {
    reset,
    evaluationResult,
    isLoading,
    handleEvaluation,
  };
}
