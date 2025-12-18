import { getSession } from "@/lib/serverActions/auth";
import { Role } from "@/types/common.types";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const isUser = session?.roles?.includes(Role.USER);

  if (isUser) return <section className="w-full py-7.5  pt-[60px]">{children}</section>;
}
