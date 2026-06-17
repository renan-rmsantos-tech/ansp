"use server";

import { cookies } from "next/headers";
import {
  BYPASS_EMAIL,
  BYPASS_PASSWORD,
  isAuthBypass,
} from "@/lib/auth/bypass";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type LoginState = { error: string | null };

async function authenticate(
  email: string,
  password: string
): Promise<LoginState> {
  if (isAuthBypass()) {
    if (email === BYPASS_EMAIL && password === BYPASS_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set("dev-auth", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      return { error: null };
    }
    return { error: "Credenciais inválidas. Verifique seu email e senha." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Credenciais inválidas. Verifique seu email e senha." };
  }

  return { error: null };
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const result = await authenticate(email, password);

  if (!result.error) {
    redirect("/admin");
  }

  return result;
}

export async function login(email: string, password: string) {
  const result = await authenticate(email, password);

  if (!result.error) {
    redirect("/admin");
  }

  return result;
}

export async function logout() {
  if (isAuthBypass()) {
    const cookieStore = await cookies();
    cookieStore.delete("dev-auth");
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
