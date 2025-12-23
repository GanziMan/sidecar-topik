"use client";

import { useEffect, useState } from "react";
import { getPromptHistory, PromptContent, PromptHistoryType } from "@/lib/serverActions/agent";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import SelectHistory from "./SelectHistory";

interface PromptHistoryProps {
  placeholder: string;
  promptKey: string;
  onRestore: (content: PromptContent) => void;
  className?: string;
}

export function PromptHistory({ placeholder, promptKey, onRestore, className }: PromptHistoryProps) {
  const [history, setHistory] = useState<PromptHistoryType[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await getPromptHistory(promptKey);
      if (res.success && res.data) {
        setHistory(res.data);
      } else {
        toast.error("히스토리를 불러오는데 실패했습니다.");
      }
    };

    fetchHistory();
  }, [promptKey]);

  const handleValueChange = (versionId: string) => {
    const selectedVersion = history.find((item) => item.id === versionId);
    if (selectedVersion) onRestore(selectedVersion.content);
  };

  return (
    <div className="flex justify-end mb-4">
      <SelectHistory
        items={history}
        placeholder={placeholder}
        triggerClassName={`w-[150px] text-sm focus:ring-0 ${className}`}
        contentClassName="border p-0.5 hover:bg-white w-[150px] max-h-[300px] overflow-y-auto"
        onValueChange={handleValueChange}
        getItemValue={(item) => item.id}
        renderItem={(item) => (
          <div className="flex items-end gap-2">
            <span className="font-medium text-xs">v{item.version}</span>
            <span className="text-xs text-gray-400">
              {format(new Date(item.created_at), "yyyy.MM.dd", { locale: ko })}
            </span>
          </div>
        )}
      />
    </div>
  );
}
