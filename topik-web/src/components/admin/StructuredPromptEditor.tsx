"use client";

import { ChangeEvent } from "react";
import { produce } from "immer";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import { StructuredPrompt } from "@/types/prompt.types";

interface StructuredPromptEditorProps {
  prompt: StructuredPrompt;
  onChange?: (newPrompt: StructuredPrompt) => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function StructuredPromptEditor({
  prompt,
  onChange = () => {},
  isLoading = false,
  readOnly = false,
}: StructuredPromptEditorProps) {
  const handleDescriptionChange = (sIndex: number, cIndex: number, value: string) => {
    if (readOnly) return;
    const nextState = produce(prompt, (draft) => {
      draft.sections[sIndex].criteria[cIndex].description = value;
    });
    onChange(nextState);
  };

  const handleFooterChange = (gIndex: number, value: string) => {
    if (readOnly) return;
    const nextState = produce(prompt, (draft) => {
      draft.guidelines[gIndex] = value;
    });
    onChange(nextState);
  };

  const addGuideline = () => {
    if (readOnly) return;
    const nextState = produce(prompt, (draft) => {
      draft.guidelines.push("새로운 가이드라인");
    });
    onChange(nextState);
  };

  const removeGuideline = (gIndex: number) => {
    if (readOnly) return;
    const nextState = produce(prompt, (draft) => {
      draft.guidelines.splice(gIndex, 1);
    });
    onChange(nextState);
  };

  if (!prompt) {
    return <div>Invalid prompt structure</div>;
  }

  return (
    <div>
      <Sections
        sections={prompt.sections}
        onChange={handleDescriptionChange}
        isLoading={isLoading}
        readOnly={readOnly}
      />

      <Guidelines
        guidelines={prompt.guidelines}
        onChange={handleFooterChange}
        onAdd={addGuideline}
        onRemove={removeGuideline}
        isLoading={isLoading}
        readOnly={readOnly}
      />
    </div>
  );
}

function Sections({
  sections,
  onChange,
  isLoading,
  readOnly,
}: {
  sections: StructuredPrompt["sections"];
  onChange: (sIndex: number, cIndex: number, value: string) => void;
  isLoading: boolean;
  readOnly: boolean;
}) {
  if (!sections) return null;

  return (
    <>
      {sections.map((section, sIndex) => (
        <div key={`${section.title}-${sIndex}`} className="mb-6 break-keep">
          <h5 className="font-semibold">{section.title}</h5>
          {section.criteria.map((criterion, cIndex) => (
            <div key={`${criterion.score}-${cIndex}`} className="ml-4 mt-2 break-keep">
              <label className="text-[13px] font-medium">{criterion.score}</label>
              <Textarea
                value={criterion.description}
                onChange={(value) => onChange(sIndex, cIndex, value)}
                disabled={isLoading || readOnly}
              />
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function Guidelines({
  guidelines,
  onChange,
  onAdd,
  onRemove,
  isLoading,
  readOnly,
}: {
  guidelines: StructuredPrompt["guidelines"];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  isLoading: boolean;
  readOnly: boolean;
}) {
  if (!guidelines || guidelines.length === 0) return null;

  return (
    <div>
      <h4 className="font-semibold">작성 규칙</h4>
      {guidelines.map((guideline, gIndex) => (
        <div key={gIndex} className="mt-2 ml-4 flex items-center">
          <Textarea value={guideline} onChange={(value) => onChange(gIndex, value)} disabled={isLoading || readOnly} />
          {!readOnly && (
            <Button
              size="icon"
              className="h-6 w-6 ml-1 rounded-full "
              onClick={() => onRemove(gIndex)}
              disabled={isLoading}
            >
              <MinusIcon />
            </Button>
          )}
        </div>
      ))}
      {!readOnly && (
        <Button variant="outline" onClick={onAdd} disabled={isLoading} className="mt-2 ml-4">
          <PlusIcon />
        </Button>
      )}
    </div>
  );
}

function Textarea({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      className="w-full rounded border bg-background p-1 font-mono text-xs resize-none"
      disabled={disabled}
    />
  );
}
