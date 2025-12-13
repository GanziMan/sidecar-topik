import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { QuestionType } from "@/types/common.types";
import { PromptContent, updatePrompt } from "@/lib/serverActions/agent";
import { PROMPT_KEYS } from "@/config/prompt-keys.config";
import { getAgentTypeForQuestion, isStructuredPrompt } from "@/lib/prompt-utils";

interface UsePromptEditorProps {
  initialPrompts: Record<string, PromptContent>;
  questionType: QuestionType;
}

export default function usePromptEditor({ initialPrompts, questionType }: UsePromptEditorProps) {
  const [activePrompts, setActivePrompts] = useState<Record<string, PromptContent>>({});
  const [editablePrompts, setEditablePrompts] = useState<Record<string, PromptContent>>({});
  const [activeTab, setActiveTab] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<number>(Date.now());

  // Initialize and filter prompts based on question type
  useEffect(() => {
    if (Object.keys(initialPrompts).length === 0) return;

    const agentType = getAgentTypeForQuestion(questionType);
    const allPromptKeys = Object.values(PROMPT_KEYS);

    // Filter keys related to the agent type
    const relevantKeys = allPromptKeys.filter((key) => key.includes(agentType));

    const filtered = relevantKeys.reduce((acc, key) => {
      if (initialPrompts[key]) {
        acc[key] = initialPrompts[key];
      }
      return acc;
    }, {} as Record<string, PromptContent>);

    setActivePrompts(filtered);
    setEditablePrompts(filtered);

    // Set initial active tab
    const keys = Object.keys(filtered);
    if (keys.length > 0) {
      setActiveTab((prev) => (keys.includes(prev) ? prev : keys[0]));
    }
  }, [initialPrompts, questionType]);

  const handlePromptChange = useCallback((key: string, content: PromptContent) => {
    setEditablePrompts((prev) => ({ ...prev, [key]: content }));
  }, []);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const changedPrompts = Object.entries(editablePrompts).filter(([key, value]) => {
        const originalValue = activePrompts[key];

        // 문자열 타입인 경우 공백 제거 후 비교
        if (typeof value === "string" && typeof originalValue === "string") {
          return value.trim() !== originalValue.trim();
        }
        // 구조화된 프롬프트 타입인 경우 JSON 문자열로 변환 후 비교
        if (isStructuredPrompt(value) && isStructuredPrompt(originalValue)) {
          return JSON.stringify(value) !== JSON.stringify(originalValue);
        }
        return true;
      });

      if (changedPrompts.length === 0) {
        toast("변경사항이 없습니다.");
        return;
      }

      const updatePromises = changedPrompts.map(([key, content]) => updatePrompt(key, content));

      await Promise.all(updatePromises);

      toast.success(`저장되었습니다`);

      const newActivePrompts = {
        ...activePrompts,
        ...Object.fromEntries(changedPrompts),
      };

      setActivePrompts(newActivePrompts);
      setEditablePrompts(newActivePrompts);
      setLastSaved(Date.now());
    } catch (error) {
      console.error(error);
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = useCallback((key: string, content: PromptContent) => {
    setEditablePrompts((prev) => ({ ...prev, [key]: content }));
    toast.success("프롬프트가 복구되었습니다.");
  }, []);

  const handleCancel = useCallback(() => {
    setEditablePrompts(activePrompts);
  }, [activePrompts]);

  return {
    activePrompts,
    editablePrompts,
    activeTab,
    isLoading,
    lastSaved,
    setActiveTab,
    handlePromptChange,
    handleSave,
    handleRestore,
    handleCancel,
  };
}
