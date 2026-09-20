import { Logo } from "@/components/layout/logo";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <Logo />
      <h1 className="font-display text-4xl font-semibold">
        Everything you love. One place.
      </h1>
      <p className="max-w-sm text-muted-foreground">
        Store coming soon.
      </p>
      <span className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
        Theme check
      </span>
    </main>
  );
}
