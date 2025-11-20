import { LoginForm } from "./_components/LoginForm";
import { login } from "./actions";

export default function LoginPage() {
  return <LoginForm className="max-w-md mx-auto mt-10" action={login} />;
}
