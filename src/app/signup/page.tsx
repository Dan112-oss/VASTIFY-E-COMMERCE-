import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create account | Vastify",
};

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pb-16 pt-32">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-semibold">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Shop, track orders, and become a seller.
        </p>
      </div>

      <AuthForm mode="signup" />
    </main>
  );
}
