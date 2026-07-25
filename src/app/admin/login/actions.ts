"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";

export type LoginState = { error?: string } | undefined;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");

  if (typeof password !== "string" || password !== process.env.ADMIN_PASSWORD) {
    return { error: "Incorrect password." };
  }

  await createSession();
  redirect("/admin/products");
}
