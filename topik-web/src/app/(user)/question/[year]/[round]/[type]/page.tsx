import { QuestionParams } from "@/types/common.types";
import { NextApiClient } from "@/lib/ky";
import { GetQuestionContentResponse } from "@/types/question.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import QuestionLayout from "@/components/question/QuestionLayout";

const QUESTION_TYPES = ["51", "52", "53", "54"];
interface QuestionPageProps {
  params: Promise<QuestionParams>;
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { year, round, type } = await params;

  const getQuestionContentResponse = await NextApiClient.get<GetQuestionContentResponse>(
    `api/questions/${year}/${round}/${type}`
  );
  if (getQuestionContentResponse.success) {
    return (
      <Tabs defaultValue={type} className="w-full">
        <TabsList className="mt-[60px] border-b border-b-gray-200">
          {QUESTION_TYPES.map((t) => (
            <TabsTrigger key={t} value={t} asChild>
              <Link href={`/question/${year}/${round}/${t}`}>{t}번</Link>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={type}>
          <QuestionLayout questionContent={getQuestionContentResponse.data!} />
        </TabsContent>
      </Tabs>
    );
  } else {
    return <div>Error: {getQuestionContentResponse.error.message}</div>;
  }
}
