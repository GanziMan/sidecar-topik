import { getSubmissionHistory } from "./actions";
import { SubmissionHistoryTable } from "@/components/admin/SubmissionHistoryTable";

export const dynamic = "force-dynamic";

interface HistoryPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const LIMIT = 10;

  let historyData;
  let error;

  try {
    historyData = await getSubmissionHistory(page, LIMIT);
  } catch (e) {
    error = e;
  }

  if (error) {
    return <div className="p-8 text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">전체 채점 이력</h1>
      {historyData && (
        <SubmissionHistoryTable
          data={historyData.data}
          totalPages={Math.ceil(historyData.count / LIMIT)}
          currentPage={page}
        />
      )}
    </div>
  );
}
