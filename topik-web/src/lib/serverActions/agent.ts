"use server";
import { ServiceApiClient } from "@/lib/ky";
import { ActionResponse } from "@/types/common.types";
import { StructuredPrompt } from "@/types/prompt.types";
import { createActionError, createActionResponse } from "../api-utils";
import { ErrorCode } from "@/config/error-codes.config";

import { Json } from "@/types/supabase";
import { PromptRepository } from "@/repositories/prompt.repository";
import { UserRepository } from "@/repositories/user.repository";

// AI 생각 비용 가져오기
export async function getThinkingBudget() {
  try {
    const response = await ServiceApiClient.get<number>("get-thinking-budget");

    return createActionResponse(response.success ? response.data : 0);
  } catch (error) {
    console.error("Thinking budget 가져오기 실패", error);
    return createActionError("Thinking budget 가져오기 실패", ErrorCode.INTERNAL_SERVER_ERROR);
  }
}

// AI 생각 비용 업데이트
export async function updateThinkingBudget(newBudget: number) {
  try {
    await ServiceApiClient.post("update-thinking-budget", {
      thinking_budget: newBudget,
    });
    return createActionResponse();
  } catch (error) {
    console.error("Thinking budget 업데이트 실패", error);
    return createActionError("Thinking budget 업데이트 실패", ErrorCode.INTERNAL_SERVER_ERROR);
  }
}

export type PromptContent = string | StructuredPrompt | Json;
// 프롬프트 가져오기
export async function getPrompts(): Promise<ActionResponse<Record<string, PromptContent>>> {
  return await ServiceApiClient.get<Record<string, PromptContent>>("prompts");
}

// 프롬프트 업데이트
export async function updatePrompt(promptKey: string, content: PromptContent): Promise<ActionResponse> {
  try {
    const currentPrompt = await PromptRepository.findByKey(promptKey);
    const user = await UserRepository.getCurrentUserOrThrow();

    if (currentPrompt) {
      const nextVersion = currentPrompt.version + 1;
      await PromptRepository.createHistory({
        promptId: currentPrompt.id,
        content: currentPrompt.content,
        version: nextVersion,
        createdBy: user?.id,
      });

      await PromptRepository.updatePrompt(currentPrompt.id, {
        content,
        version: nextVersion,
        updatedBy: user?.id,
      });
    } else {
      // 최초 생성 시
      const newPrompt = await PromptRepository.createPrompt({
        promptKey,
        content,
        version: 1,
        updatedBy: user?.id,
      });

      // 최초 생성 시에도 히스토리에 기록 (Version 1)
      if (newPrompt) {
        await PromptRepository.createHistory({
          promptId: newPrompt.id,
          content: content,
          version: 1,
          createdBy: user?.id,
        });
      }
    }

    // 4. Update Agent (In-Memory)
    await ServiceApiClient.put(`prompts/${promptKey}`, { content });

    return createActionResponse();
  } catch (error) {
    console.error("Prompt 업데이트 실패:", error);
    return createActionError("Prompt 업데이트 실패", ErrorCode.INTERNAL_SERVER_ERROR);
  }
}

export interface PromptHistoryType {
  id: string;
  prompt_id: string;
  content: PromptContent;
  version: number;
  created_at: string;
  created_by: string | null;
}
// 저장된 프롬프트 이력 가져오기
export async function getPromptHistory(promptKey: string): Promise<ActionResponse<PromptHistoryType[]>> {
  try {
    const history = await PromptRepository.findHistoryByKey(promptKey);

    // Type casting needed because Repository returns DB entity, but we need strict types
    const typedHistory = history.map((h) => ({
      ...h,
      content: h.content as PromptContent,
    }));

    return createActionResponse(typedHistory);
  } catch (error) {
    console.error("Prompt History 가져오기 실패:", error);
    return createActionError("Prompt History 가져오기 실패", ErrorCode.INTERNAL_SERVER_ERROR);
  }
}
