import { getSession } from "@/lib/serverActions/auth";
import { Role } from "@/types/common.types";
import Header from "@/components/common/Header";
import { getQuestionOptions } from "@/lib/serverActions/questions";
export default async function QuestionLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const isAdmin = session?.roles?.includes(Role.ADMIN);
  const availableQuestions = await getQuestionOptions();
  if (isAdmin)
    return (
      <>
        <Header availableQuestions={availableQuestions} />
        <section className="w-full">{children}</section>
      </>
    );
}
