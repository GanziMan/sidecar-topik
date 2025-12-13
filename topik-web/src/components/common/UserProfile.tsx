import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfileProps {
  userEmail: string;
  isAdmin: boolean;
}

export default function UserProfile({ userEmail, isAdmin }: UserProfileProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-gray-300">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userEmail}</p>
            <p className="text-xs leading-none text-muted-foreground">{isAdmin ? "관리자" : "사용자"}</p>
          </div>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
