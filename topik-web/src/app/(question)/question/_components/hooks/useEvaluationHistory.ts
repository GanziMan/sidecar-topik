import { useState, useEffect } from "react";
import { EvaluationRecord, EvaluationResponseUnion } from "@/types/topik-write.types";

export function useEvaluationHistory(questionId: string, evaluationResult: EvaluationResponseUnion) {
  const [evaluationRecords, setEvaluationRecords] = useState<EvaluationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvaluationHistory = async () => {
      if (!questionId) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/submissions/question/${questionId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch evaluation history.");
        }
        const data: EvaluationRecord[] = await response.json();

        setEvaluationRecords(data);
      } catch (err) {
        setError(err as Error);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluationHistory();
  }, [questionId, evaluationResult]);

  return { evaluationRecords, isLoading, error };
}
