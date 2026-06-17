import {
  BYPASS_EMAIL,
  BYPASS_PASSWORD,
  isAuthBypass,
} from "@/lib/auth/bypass";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  const showCredentialsHint = isAuthBypass();

  return (
    <LoginForm
      showCredentialsHint={showCredentialsHint}
      hintEmail={BYPASS_EMAIL}
      hintPassword={BYPASS_PASSWORD}
    />
  );
}
