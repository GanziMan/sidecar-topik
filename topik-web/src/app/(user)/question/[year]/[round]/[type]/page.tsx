import { QuestionParams } from "@/types/common.types";
import { NextApiClient } from "@/lib/ky";
import { GetQuestionContentResponse } from "@/types/question.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import QuestionLayout from "@/components/question/QuestionLayout";
import { QUESTION_TYPES } from "@/config/question.config";

interface QuestionPageProps {
  params: Promise<QuestionParams>;
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { year, round, type } = await params;

  const getQuestionContentResponse = await NextApiClient.get<GetQuestionContentResponse>(
    `api/questions/${year}/${round}/${type}`
  );

  return (
    <Tabs defaultValue={type} className="w-full">
      <TabsList>
        {QUESTION_TYPES.map((t) => (
          <TabsTrigger key={t} value={t} asChild>
            <Link href={`/question/${year}/${round}/${t}`}>{t}번</Link>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={type}>
        {getQuestionContentResponse.success ? (
          <QuestionLayout questionContent={getQuestionContentResponse.data} />
        ) : (
          <div>Question content not found</div>
        )}
      </TabsContent>
    </Tabs>
  );
}
