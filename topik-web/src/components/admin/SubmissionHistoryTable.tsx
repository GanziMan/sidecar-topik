"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { SubmissionHistoryItem } from "@/app/(admin)/admin/history/actions";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";

import { StructuredPrompt } from "@/types/prompt.types";
import { getAgentTypeForQuestion } from "@/lib/prompt-utils";
import { QuestionType } from "@/types/common.types";
import { StructuredPromptEditor } from "./StructuredPromptEditor";

interface SubmissionHistoryTableProps {
  data: SubmissionHistoryItem[];
  totalPages: number;
  currentPage: number;
  className?: string;
}

export function SubmissionHistoryTable({ data, totalPages, currentPage, className }: SubmissionHistoryTableProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionHistoryItem | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className={className}>
      <div className="rounded-md border bg-white mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">일시</TableHead>
              <TableHead>사용자</TableHead>
              <TableHead>문제 유형</TableHead>
              <TableHead>점수</TableHead>
              <TableHead className="text-right">프롬프트</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  제출 기록이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {format(new Date(item.created_at), "yyyy. MM. dd. HH:mm", { locale: ko })}
                  </TableCell>
                  <TableCell>{item.user_email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.question_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={item.score >= 60 ? "text-blue-600 font-bold" : "text-red-500 font-bold"}>
                      {item.score}점
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setSelectedSubmission(item)}
                      disabled={!item.prompt_snapshot}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      {item.prompt_snapshot ? "보기" : "정보 없음"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                size={"sm"}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  size={"sm"}
                  href="#"
                  isActive={currentPage === page}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                size={"sm"}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>채점 기준</DialogTitle>
            <DialogDescription>
              {selectedSubmission &&
                `${format(new Date(selectedSubmission.created_at), "yyyy. MM. dd. HH:mm")}에 사용된 채점 기준입니다.`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-4 rounded-md mt-2">
            {selectedSubmission?.prompt_snapshot ? (
              <StructuredPromptEditor
                prompt={
                  (selectedSubmission.prompt_snapshot as Record<string, unknown>)[
                    `evaluator.sub_agents.${getAgentTypeForQuestion(
                      selectedSubmission.question_type as QuestionType
                    )}.CONTEXT_PROMPT`
                  ] as StructuredPrompt
                }
                readOnly={true}
              />
            ) : (
              <p className="text-sm text-gray-500">프롬프트 정보가 없습니다.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
