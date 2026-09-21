"use client";

import * as React from "react";
import Link from "next/link";
import { login, signup, type AuthState } from "@/app/auth/actions";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

export function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  const [state, formAction, pending] = React.useActionState<
    AuthState,
    FormData
  >(mode === "login" ? login : signup, null);

  const isLogin = mode === "login";

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-border bg-card p-6"
    >
      {next && <input type="hidden" name="next" value={next} />}

      {!isLogin && (
        <div className="space-y-1.5">
          <label htmlFor="full_name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            className={inputClass}
            placeholder="Your name"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
          minLength={isLogin ? undefined : 8}
          className={inputClass}
          placeholder={isLogin ? "Your password" : "At least 8 characters"}
        />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      {state?.message && (
        <p
          role="status"
          className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending
          ? isLogin
            ? "Logging in..."
            : "Creating account..."
          : isLogin
            ? "Log in"
            : "Create account"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "New to Vastify? " : "Already have an account? "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="font-medium text-primary hover:underline"
        >
          {isLogin ? "Create an account" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
