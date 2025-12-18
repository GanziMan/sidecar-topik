import { useInfiniteQuery } from "@tanstack/react-query";
import { UserSubmission } from "@/types/question.types";
import { NextApiClient } from "@/lib/ky";

export default function useEvaluationHistory(questionId: string) {
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status, error } =
    useEvaluationHistoryInfiniteQuery(questionId);

  const evaluationHistories = data?.pages?.flat() || [];

  return {
    evaluationHistories,
    isLoading: status === "pending",
    isError: status === "error",
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  };
}

// TODO: react-query hook 공통화 필요
const EVALUATION_HISTORY_KEY = "evaluation-history";

function useEvaluationHistoryInfiniteQuery(questionId: string) {
  return useInfiniteQuery({
    queryKey: [EVALUATION_HISTORY_KEY, questionId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await NextApiClient.get<UserSubmission[]>(
        `api/submissions/question/${questionId}?page=${pageParam}&limit=10`
      );

      if (!response.success) {
        throw new Error(response.error?.message || "Failed to fetch history");
      }

      return response.data || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      // 10개 미만이면 더 이상 페이지가 없다고 판단
      return lastPage?.length === 10 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!questionId, // questionId가 있을 때만 실행
  });
}
