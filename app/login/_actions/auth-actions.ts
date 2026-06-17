"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const DEV_EMAIL = "admin@admin.com";
const DEV_PASSWORD = "admin123";

function isDevBypass() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.AUTH_BYPASS === "true"
  );
}

export async function login(email: string, password: string) {
  if (isDevBypass()) {
    if (email === DEV_EMAIL && password === DEV_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set("dev-auth", "true", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      });
      redirect("/admin");
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

  redirect("/admin");
}

export async function logout() {
  if (isDevBypass()) {
    const cookieStore = await cookies();
    cookieStore.delete("dev-auth");
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
