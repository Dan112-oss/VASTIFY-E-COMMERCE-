import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Log in | Vastify",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pb-16 pt-32">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Log in to your Vastify account.
        </p>
      </div>

      {error === "callback" && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          That confirmation link didn&apos;t work or has expired. Try logging
          in, or sign up again.
        </p>
      )}

      <AuthForm mode="login" next={next} />
    </main>
  );
}
