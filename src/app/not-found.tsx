import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-5 px-6 pt-24 text-center">
      <p className="font-display text-7xl font-semibold text-primary/60">404</p>
      <h1 className="font-display text-3xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Back home
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-border px-8 py-3 text-sm font-semibold transition-colors hover:bg-accent"
        >
          Browse the shop
        </Link>
      </div>
    </main>
  );
}
