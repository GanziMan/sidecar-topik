"use client";

import { useThinkingBudgetStore } from "@/stores/thinking-budget.store";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateThinkingBudget } from "@/lib/serverActions/agent";
import toast from "react-hot-toast";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/common/tooltip";

export default function ThinkingBudget() {
  const { mode, setMode } = useThinkingBudgetStore();

  const handleCheckedChange = async (isChecked: boolean) => {
    const newMode = isChecked ? "dynamic" : "disabled";
    const budget = isChecked ? -1 : 0;
    const previousMode = mode;

    setMode(newMode);

    const res = await updateThinkingBudget(budget);

    if (!res.success) {
      setMode(previousMode);
      toast.error(res.error.message);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Label htmlFor="thinking-budget-switch" className="cursor-pointer font-medium">
          AI 추론
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-normal">
                AI가 답변을 생성하기 전에 심층적으로 사고하여
                <br />더 정확한 평가 결과를 제공합니다.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Switch id="thinking-budget-switch" checked={mode === "dynamic"} onCheckedChange={handleCheckedChange} />
    </div>
  );
}
