import { useState, useEffect } from "react";
import { UserSubmission, EvaluationResponseUnion } from "@/types/question.types";
import { NextApiClient } from "@/lib/ky";

export default function useEvaluationHistory(questionId: string, evaluationResult: EvaluationResponseUnion) {
  const [evaluationHistories, setEvaluationHistories] = useState<UserSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvaluationHistory = async () => {
      if (!questionId) return;
      setIsLoading(true);
      setError(null);

      const response = await NextApiClient.get<UserSubmission[]>(`api/submissions/question/${questionId}`);

      if (response.success) {
        setEvaluationHistories(response.data ?? []);
      } else {
        const errorMessage = response.error.message || "Failed to fetch history";
        setError(new Error(errorMessage));
        console.error(errorMessage);
      }

      setIsLoading(false);
    };

    fetchEvaluationHistory();
  }, [questionId, evaluationResult]);

  return { evaluationHistories, isLoading, error };
}
