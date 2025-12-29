import { QuestionParams } from "@/types/common.types";
import { NextApiClient } from "@/lib/ky";
import { GetQuestionContentResponse } from "@/types/question.types";
import { getPrompts } from "@/lib/serverActions/agent";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionLayout from "@/components/question/QuestionLayout";

interface QuestionPageProps {
  params: Promise<QuestionParams>;
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { year, round, type } = await params;

  const getQuestionContentResponse = await NextApiClient.get<GetQuestionContentResponse>(
    `api/questions/${year}/${round}/${type}`
  );
  const getPromptsResponse = await getPrompts();

  return (
    <Tabs defaultValue={type} className="w-full">
      <TabsList className="mt-[60px] border-b border-b-gray-200">
        {["51", "52", "53", "54"].map((t) => (
          <TabsTrigger key={t} value={t} asChild>
            <Link href={`/admin/question/${year}/${round}/${t}`}>{t}번</Link>
          </TabsTrigger>
        ))}
      </TabsList>
      {getPromptsResponse.success && getQuestionContentResponse.success && (
        <TabsContent className="mt-0" value={type}>
          <QuestionLayout questionContent={getQuestionContentResponse.data!} prompts={getPromptsResponse.data} />
        </TabsContent>
      )}
    </Tabs>
  );
}
