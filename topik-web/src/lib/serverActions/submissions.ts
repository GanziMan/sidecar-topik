"use server";

import { ServiceApiClient } from "@/lib/ky";
import { SubmissionRepository } from "@/repositories/submission.repository";
import { getRelevantPromptKeys } from "@/lib/prompt-utils";
import { Json } from "@/types/supabase";
import { QuestionType } from "@/types/common.types";

export async function saveEvaluationResult(params: {
  userId: string;
  questionId: string;
  questionNumber: QuestionType;
  answer: Json;
  evaluation: Json;
}) {
  const { userId, questionId, questionNumber, answer, evaluation } = params;

  try {
    // 1. 프롬프트 스냅샷 생성
    let promptSnapshot: Record<string, unknown> | Json = {};
    try {
      const promptsResponse = await ServiceApiClient.get<Record<string, unknown>>("prompts");
      if (promptsResponse.success && promptsResponse.data) {
        const relevantKeys = getRelevantPromptKeys(questionNumber);
        promptSnapshot = Object.keys(promptsResponse.data)
          .filter((key) => relevantKeys.includes(key))
          .reduce((obj, key) => {
            // @ts-expect-error key access on unknown record
            obj[key] = promptsResponse.data[key];
            return obj;
          }, {} as Record<string, unknown>);
      }
    } catch (e) {
      console.warn("Failed to fetch prompt snapshot:", e);
      // 스냅샷 실패해도 저장은 진행 (빈 객체로)
    }

    // 2. Submission 생성
    const latestAttemptNo = await SubmissionRepository.findLatestAttemptNo(userId, questionId);
    const newSubmission = await SubmissionRepository.createSubmission({
      userId,
      questionId,
      answer,
      attemptNo: latestAttemptNo + 1,
    });

    // 3. Result 저장
    await SubmissionRepository.createSubmissionResult({
      submissionId: newSubmission.id,
      evaluation,
      promptSnapshot: promptSnapshot as Json,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to save evaluation result:", error);
    return { success: false, error };
  }
}
