import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ThinkingBudgetMode = "disabled" | "dynamic";

const THINKING_MODES = [
  {
    label: "추론 미사용",
    value: "disabled",
  },
  {
    label: "추론 사용",
    value: "dynamic",
  },
] as const;

interface ThinkingBudgetState {
  mode: ThinkingBudgetMode;
  setMode: (mode: ThinkingBudgetMode) => void;
  setBudgetFromValue: (budget: number) => void;
  getBudget: () => { budget: number; mode: string };
}

export const useThinkingBudgetStore = create<ThinkingBudgetState>()(
  persist(
    (set, get) => ({
      mode: "disabled",
      setMode: (mode) => set({ mode }),
      setBudgetFromValue: (budget) => {
        const mode = budget === -1 ? "dynamic" : "disabled";
        set({ mode });
      },
      getBudget: () => {
        const { mode } = get();
        const modeLabel = THINKING_MODES.find((m) => m.value === mode)?.label;
        if (mode === "disabled") {
          return {
            budget: 0,
            mode: modeLabel || "추론 미사용",
          };
        }
        // mode === "dynamic"
        return {
          budget: -1,
          mode: modeLabel || "추론 사용",
        };
      },
    }),
    {
      name: "thinking-budget-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
