import { getSession } from "@/lib/serverActions/auth";
import { Role } from "@/types/common.types";
import Header from "@/components/common/Header";
import { getQuestionOptions } from "@/lib/serverActions/questions";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const isUser = session?.roles?.includes(Role.USER);
  const availableQuestions = await getQuestionOptions();
  if (isUser)
    return (
      <>
        <Header availableQuestions={availableQuestions} />
        <section className="w-full py-7.5  pt-[60px]">{children}</section>
      </>
    );
}
