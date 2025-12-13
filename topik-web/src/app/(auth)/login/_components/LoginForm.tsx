"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signInWithCredentials } from "@/lib/serverActions/auth";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { useSession } from "next-auth/react";
import { Role } from "@/types/common.types";
import { cn } from "@/lib/utils";

export function LoginForm({ className }: React.ComponentProps<"div">) {
  const router = useRouter();
  const { update } = useSession();

  const [isPending, startTransition] = useTransition();

  const handleLogin = (type: Role) => {
    const formData = new FormData();
    formData.append("email", LOGIN_INFO[type].email);
    formData.append("password", LOGIN_INFO[type].password);
    handleSubmit(formData);
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await signInWithCredentials(formData);

      if (result.success) {
        await update();
        router.push("/");
        toast.success("로그인에 성공했습니다.");
      } else toast.error(result.error.message ?? "로그인에 실패했습니다.");
    });
  };

  return (
    <LoadingOverlay isLoading={isPending} label="로그인 중...">
      <div className={className}>
        <Card className={cn("max-w-[350px] mx-auto bg-transparent")}>
          <CardHeader>
            <CardTitle className="font-medium">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="login-form" action={handleSubmit} className="flex flex-col gap-6">
              <Field>
                <Input id="email" name="email" type="email" placeholder="이메일" required />
              </Field>
              <Field>
                <Input id="password" name="password" type="password" placeholder="비밀번호" required />
              </Field>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Field>
              <Button type="submit" form="login-form" className="text-sm">
                Login
              </Button>
            </Field>
            <div className="w-full flex gap-2 justify-between">
              {Object.values(LOGIN_INFO).map((info) => (
                <Field key={info.role}>
                  <Button variant="outline" type="submit" onClick={() => handleLogin(info.role)}>
                    <span className="text-sm">{info.name} 바로가기 🔐</span>
                  </Button>
                </Field>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>
    </LoadingOverlay>
  );
}

const LOGIN_INFO = {
  [Role.ADMIN]: {
    email: "user2@test.com",
    password: "kim50089!!",
    role: Role.ADMIN,
    name: "관리자",
  },
  [Role.USER]: {
    email: "user1@test.com",
    password: "123123",
    role: Role.USER,
    name: "사용자",
  },
};
