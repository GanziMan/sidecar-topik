"use client";

import { cn } from "@/lib/utils";
import { QuestionType } from "@/types/common.types";
import { PromptContent } from "@/lib/serverActions/agent";
import { StructuredPrompt } from "@/types/prompt.types";
import { PROMPT_KEY_LABELS } from "@/config/prompt-keys.config";
import { isStructuredPrompt } from "@/lib/prompt-utils";

import { StructuredPromptEditor } from "./StructuredPromptEditor";
import { PromptHistory } from "./PromptHistory";
import usePromptEditor from "@/hooks/usePromptEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Json } from "@/types/supabase";

interface PromptEditorProps {
  questionType: QuestionType;
  prompts: Record<string, PromptContent>;
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export function PromptEditor({ prompts, questionType }: PromptEditorProps) {
  const {
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
  } = usePromptEditor({ initialPrompts: prompts, questionType });

  const renderEditorContent = () => (
    <div className="overflow-auto h-full">
      <div className={"bg-white h-full p-4"}>
        <PromptTabs prompts={activePrompts} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className={"space-y-4"}>
          {Object.keys(activePrompts).map((promptKey) => {
            const content = editablePrompts[promptKey];
            if (!content) return null;
            if (promptKey !== activeTab) return null;
            return (
              <PromptEditorContent
                key={promptKey}
                promptKey={promptKey}
                content={content}
                lastSaved={lastSaved}
                isLoading={isLoading}
                onPromptChange={(newContent) => handlePromptChange(promptKey, newContent)}
                onRestore={(restoredContent) => handleRestore(promptKey, restoredContent)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderActionButtons = () => <ActionButtons isLoading={isLoading} onSave={handleSave} onCancel={handleCancel} />;

  return (
    <div className="bg-white flex flex-col h-[calc(100vh-100px)] relative">
      {renderEditorContent()}
      {renderActionButtons()}
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub Components
// ----------------------------------------------------------------------

interface PromptTabsProps {
  prompts: Record<string, PromptContent>;
  activeTab: string;
  onTabChange: (key: string) => void;
}
function PromptTabs({ prompts, activeTab, onTabChange }: PromptTabsProps) {
  return (
    <div className="flex flex-wrap gap-0.5">
      {Object.keys(prompts).map((key) => (
        <Label
          key={key}
          onClick={() => onTabChange(key)}
          className={cn(
            "cursor-pointer hover:bg-white px-1 text-lg",
            activeTab === key ? "font-bold bg-white text-black" : "bg-white text-gray-400"
          )}
        >
          {PROMPT_KEY_LABELS[key as keyof typeof PROMPT_KEY_LABELS] || key}
        </Label>
      ))}
    </div>
  );
}

interface PromptEditorContentProps {
  promptKey: string;
  content: StructuredPrompt | Json;
  lastSaved: number;
  isLoading: boolean;
  onPromptChange: (content: StructuredPrompt | Json) => void;
  onRestore: (content: StructuredPrompt | Json) => void;
}

function PromptEditorContent({
  promptKey,
  content,
  lastSaved,
  isLoading,
  onPromptChange,
  onRestore,
}: PromptEditorContentProps) {
  const promptLabel = PROMPT_KEY_LABELS[promptKey as keyof typeof PROMPT_KEY_LABELS] || promptKey;
  const promptType = promptKey.toLowerCase().includes("corrector") ? "corrector" : "evaluator";

  return (
    <div className={"space-y-4"}>
      <PromptHistory
        placeholder={`이전 ${promptLabel}`}
        key={`${promptKey}-${lastSaved}`}
        promptKey={promptKey}
        onRestore={onRestore}
      />

      {isStructuredPrompt(content) && (
        <StructuredPromptEditor
          prompt={content as StructuredPrompt}
          onChange={onPromptChange}
          isLoading={isLoading}
          promptType={promptType}
        />
      )}
    </div>
  );
}

function ActionButtons({
  isLoading,
  onSave,
  onCancel,
}: {
  isLoading: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className={cn("flex p-4 bg-white sticky bottom-0 z-10 justify-end")}>
      <div className="flex gap-2 items-center">
        <Button variant="outline" disabled={isLoading} onClick={onCancel}>
          취소
        </Button>
        <Button disabled={isLoading} onClick={onSave} className="w-20">
          {isLoading ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}
