import { cn } from "@/lib/utils";

interface FooterProps {
  children: React.ReactNode;
  className?: string;
}
export default function Footer({ children, className }: FooterProps) {
  return (
    <footer className={cn("fixed bottom-0 w-full px-7.5 py-3 bg-[#EBEBEB] flex justify-end", className)}>
      {children}
    </footer>
  );
}
