import { QuestionType } from "@/types/common.types";
import { StructuredPrompt } from "@/types/prompt.types";
import { PromptContent } from "./serverActions/agent";
import { PROMPT_KEYS } from "@/config/prompt-keys.config";

export const getAgentTypeForQuestion = (questionType: QuestionType): string => {
  switch (questionType) {
    case QuestionType.Q51:
    case QuestionType.Q52:
      return "sentence_completion";
    case QuestionType.Q53:
      return "info_description";
    case QuestionType.Q54:
      return "opinion_essay";
    default:
      return "sentence_completion";
  }
};

export const isStructuredPrompt = (prompt: PromptContent): prompt is StructuredPrompt => {
  return (
    typeof prompt === "object" &&
    prompt !== null &&
    "sections" in prompt &&
    "guidelines" in prompt &&
    Array.isArray((prompt as any).sections) &&
    Array.isArray((prompt as any).guidelines)
  );
};

export function getRelevantPromptKeys(questionType: QuestionType): string[] {
  const keys: string[] = [];

  switch (questionType) {
    case QuestionType.Q51:
    case QuestionType.Q52:
      keys.push(PROMPT_KEYS.EVALUATOR_SUB_AGENTS_SENTENCE_COMPLETION_CONTEXT_PROMPT);
      break;
    case QuestionType.Q53:
      keys.push(PROMPT_KEYS.EVALUATOR_SUB_AGENTS_INFO_DESCRIPTION_CONTEXT_PROMPT);
      keys.push(PROMPT_KEYS.CORRECTOR_SUB_AGENTS_INFO_DESCRIPTION_CONTEXT_PROMPT);
      break;
    case QuestionType.Q54:
      keys.push(PROMPT_KEYS.EVALUATOR_SUB_AGENTS_OPINION_ESSAY_CONTEXT_PROMPT);
      keys.push(PROMPT_KEYS.CORRECTOR_SUB_AGENTS_OPINION_ESSAY_CONTEXT_PROMPT);
      break;
  }

  return keys;
}
