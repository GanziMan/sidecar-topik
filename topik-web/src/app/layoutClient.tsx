"use client";

import { RootToaster } from "@/providers/RootToaster";
import { useThinkingBudgetStore } from "@/stores/thinking-budget.store";
import { useEffect, useRef } from "react";

interface LayoutClientProps {
  children: React.ReactNode;
  initialBudget: number;
}

export default function LayoutClient({ children, initialBudget }: LayoutClientProps) {
  const { setBudgetFromValue } = useThinkingBudgetStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setBudgetFromValue(initialBudget);
      initialized.current = true;
    }
  }, [initialBudget, setBudgetFromValue]);

  return (
    <>
      <RootToaster />
      {children}
    </>
  );
}
