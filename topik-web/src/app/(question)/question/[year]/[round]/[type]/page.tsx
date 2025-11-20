import { QuestionType } from "@/types/topik.types";
import QuestionLayout from "../../../_components/QuestionLayout";
import { API_BASE_URL } from "@/config/shared";

interface QuestionPageParams {
  year: string;
  round: string;
  type: QuestionType;
}

export default async function QuestionPage({ params }: { params: Promise<QuestionPageParams> }) {
  const { year, round, type } = await params;

  const getQuestionContentResponse = await fetch(`${API_BASE_URL}/api/questions/${year}/${round}/${type}`);
  const questionContent = await getQuestionContentResponse.json();

  return (
    <>
      <div className="font-semibold text-[20px] w-full px-7.5 pb-7.5 ">TOPIK II | 쓰기 | {type}번 유형</div>
      <QuestionLayout year={Number(year)} round={Number(round)} questionType={type} questionContent={questionContent} />
    </>
  );
}
