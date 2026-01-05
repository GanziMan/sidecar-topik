"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOutWithCredentials } from "@/lib/serverActions/auth";

import { QuestionType, Role } from "@/types/common.types";
import type { QuestionOption } from "@/lib/serverActions/questions";

import { Button } from "../ui/button";

import { questionParamsSchema } from "@/app/schemas/topik-write.schema";
import SelectFilter from "../admin/SelectFilter";
import ThinkingBudget from "../admin/ThinkingBudget";
import UserProfile from "./UserProfile";
import tw from "tailwind-styled-components";

interface HeaderProps {
  availableQuestions?: QuestionOption[];
}

export default function Header({ availableQuestions = [] }: HeaderProps) {
  const { data: session } = useSession();
  const params = useParams<{ year: string; round: string; type: QuestionType }>();
  const router = useRouter();

  if (!session) return null;

  const { roles, user } = session;
  const isAdmin = roles?.includes(Role.ADMIN);
  const userEmail = user?.email;

  const basePath = isAdmin ? "/admin/question" : "/question";

  const result = questionParamsSchema.safeParse(params);

  const { year, round, type } = result.success ? result.data : questionParamsSchema.parse({});

  const uniqueYears = Array.from(new Set(availableQuestions.map((q) => q.year))).sort((a, b) => b - a);
  const uniqueRounds = Array.from(new Set(availableQuestions.map((q) => q.round))).sort((a, b) => b - a);

  const handleYearChange = (newYear: string) => router.push(`${basePath}/${newYear}/${round}/${type}`);
  const handleRoundChange = (newRound: string) => router.push(`${basePath}/${year}/${newRound}/${type}`);

  return (
    <Hedaer>
      <HeaderContent>
        <SelectFilter placeholder="연도" value={year} handleChange={handleYearChange} uniqueValues={uniqueYears} />
        <SelectFilter
          label="회"
          placeholder="회차"
          value={round}
          handleChange={handleRoundChange}
          uniqueValues={uniqueRounds}
        />
      </HeaderContent>

      {/* User Actions */}
      <UserActions isAdmin={isAdmin!} userEmail={userEmail!} />
    </Hedaer>
  );
}

interface UserActionsProps {
  isAdmin: boolean;
  userEmail: string;
}

function UserActions({ isAdmin, userEmail }: UserActionsProps) {
  return (
    <div className="flex gap-2.5 items-center">
      {isAdmin && <ThinkingBudget />}

      <form action={signOutWithCredentials}>
        <Button size="sm" variant="outline">
          로그아웃
        </Button>
      </form>

      <UserProfile userEmail={userEmail} isAdmin={isAdmin} />
    </div>
  );
}

const Hedaer = tw.header`fixed bg-inherit top-0 left-0 right-0 z-50 flex justify-between items-center w-full h-[60px] border-[#DDDDDD] px-5`;
const HeaderContent = tw.div`flex gap-1.5 items-center`;
