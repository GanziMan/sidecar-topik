import { getSession } from "@/lib/serverActions/auth";
import { Role } from "@/types/common.types";

export default async function QuestionLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const isAdmin = session?.roles?.includes(Role.ADMIN);
  if (isAdmin) return <section className="w-full py-7.5  pt-[60px] mx-5">{children}</section>;
}
