"use client";

import Header from "@/components/common/Header";
import { RootToaster } from "@/providers/RootToaster";
import type { QuestionOption } from "@/lib/serverActions/questions";
import { useThinkingBudgetStore } from "@/stores/thinking-budget.store";
import { useEffect, useRef } from "react";

export default function LayoutClient({
  children,
  availableQuestions,
  initialBudget,
}: Readonly<{
  children: React.ReactNode;
  availableQuestions: QuestionOption[];
  initialBudget: number;
}>) {
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
      <Header availableQuestions={availableQuestions} />
      {children}
    </>
  );
}
