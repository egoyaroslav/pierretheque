"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper text-ink px-4">
      <form action={formAction} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="font-display text-3xl mb-2">Admin Login</h1>
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="border border-line bg-transparent px-3 py-2 text-sm"
        />
        {state?.error && (
          <p className="text-sm text-ink border-l-2 border-ink pl-3">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="border border-line px-3 py-2 text-[11px] tracked uppercase hover:bg-ink hover:text-paper transition-colors"
        >
          Sign In
        </button>
      </form>
    </main>
  );
}
