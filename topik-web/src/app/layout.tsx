import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutClient from "./layoutClient";
import AuthProvider from "@/providers/AuthProvider";
import { getQuestionOptions } from "@/lib/serverActions/questions";
import { getThinkingBudget } from "@/lib/serverActions/agent";
import QueryProvider from "@/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TOPIK | 주관식 문항 평가",
  description: "TOPIK 주관식 문항 평가 서비스",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const availableQuestions = await getQuestionOptions();
  const budgetRes = await getThinkingBudget();

  const initialBudget = budgetRes.success ? budgetRes?.data : 0;

  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <LayoutClient availableQuestions={availableQuestions} initialBudget={initialBudget!}>
              {children}
            </LayoutClient>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
