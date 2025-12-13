"use client";

import Header from "@/components/common/Header";
import { RootToaster } from "@/providers/RootToaster";
import type { QuestionOption } from "@/lib/serverActions/questions";

export default function LayoutClient({
  children,
  availableQuestions,
}: Readonly<{
  children: React.ReactNode;
  availableQuestions: QuestionOption[];
}>) {
  return (
    <>
      <RootToaster />
      <Header availableQuestions={availableQuestions} />
      {children}
    </>
  );
}
