import { QuestionType } from "@/types/common.types";
import { StructuredPrompt } from "@/types/prompt.types";
import { PromptContent } from "./serverActions/agent";
import { PROMPT_KEYS } from "@/config/prompt-keys.config";

export const getAgentTypeForQuestion = (questionType: QuestionType): string => {
  switch (questionType) {
    case QuestionType.Q51:
    case QuestionType.Q52:
      return "evaluator.sc";
    case QuestionType.Q53:
      return "id"; // evaluator.id, corrector.id
    case QuestionType.Q54:
      return "oe"; // evaluator.oe, corrector.oe
    default:
      return "evaluator.sc";
  }
};

export const isStructuredPrompt = (prompt: PromptContent): prompt is StructuredPrompt => {
  return (
    typeof prompt === "object" &&
    prompt !== null &&
    "sections" in prompt &&
    "guidelines" in prompt &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Array.isArray((prompt as any).sections) &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Array.isArray((prompt as any).guidelines)
  );
};

export function getRelevantPromptKeys(questionType: QuestionType): string[] {
  const keys: string[] = [];

  switch (questionType) {
    case QuestionType.Q51:
    case QuestionType.Q52:
      keys.push(PROMPT_KEYS.EVALUATOR_SC_CONTEXT_RUBRIC_PROMPT);
      break;
    case QuestionType.Q53:
      keys.push(PROMPT_KEYS.EVALUATOR_ID_CONTEXT_RUBRIC_PROMPT);
      keys.push(PROMPT_KEYS.CORRECTOR_ID_CONTEXT_RUBRIC_PROMPT);
      break;
    case QuestionType.Q54:
      keys.push(PROMPT_KEYS.EVALUATOR_OE_CONTEXT_RUBRIC_PROMPT);
      keys.push(PROMPT_KEYS.CORRECTOR_OE_CONTEXT_RUBRIC_PROMPT);
      break;
  }

  return keys;
}
