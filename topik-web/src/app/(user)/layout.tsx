import { getSession } from "@/lib/serverActions/auth";
import { Role } from "@/types/common.types";
import Header from "@/components/common/Header";
import { getQuestionOptions } from "@/lib/serverActions/questions";

interface UserLayoutProps {
  children: React.ReactNode;
}

export default async function UserLayout({ children }: UserLayoutProps) {
  const session = await getSession();
  const isUser = session?.roles?.includes(Role.USER);
  const availableQuestions = await getQuestionOptions();
  if (isUser)
    return (
      <>
        <Header availableQuestions={availableQuestions} />
        <section className="w-full">{children}</section>
      </>
    );
}
