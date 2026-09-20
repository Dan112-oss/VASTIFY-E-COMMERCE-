"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Play, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavLinkItem = { label: string; href: string };

export type NavbarMedia = {
  type: "video" | "image";
  src: string;
  poster?: string;
  autoplay?: boolean;
};

export interface FlexNavbarProps {
  brandName: string;
  tagline?: string;
  launchText?: string;
  navLinks: NavLinkItem[];
  media?: NavbarMedia;
  mediaButtonText?: string;
  cartCount?: number;
  cartHref?: string;
  className?: string;
}

function NavAnchor({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const external = /^https?:\/\//.test(href);
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export function FlexNavbar({
  brandName,
  tagline,
  launchText,
  navLinks,
  media,
  mediaButtonText = "Watch intro",
  cartCount = 0,
  cartHref = "/cart",
  className,
}: FlexNavbarProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mediaOpen, setMediaOpen] = React.useState(false);

  React.useEffect(() => {
    if (!mediaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMediaOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mediaOpen]);

  const linkClass =
    "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

  return (
    <>
      <header className={cn("w-full px-3 pt-3 sm:px-6", className)}>
        <nav className="mx-auto max-w-6xl rounded-2xl border border-border bg-card/70 shadow-lg shadow-black/30 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-5">
            {/* Brand */}
            <Link
              href="/"
              aria-label={`${brandName} home`}
              className="flex min-w-0 items-center gap-2.5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/60 bg-primary/10 font-display text-xl font-semibold text-primary">
                {brandName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 leading-tight">
                <div className="flex items-center gap-2">
                  <span className="truncate font-display text-lg font-semibold uppercase tracking-[0.2em]">
                    {brandName}
                  </span>
                  {launchText && (
                    <span className="hidden rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary sm:inline-flex">
                      {launchText}
                    </span>
                  )}
                </div>
                {tagline && (
                  <div className="hidden truncate text-xs text-muted-foreground lg:block">
                    {tagline}
                  </div>
                )}
              </div>
            </Link>

            {/* Desktop links */}
            <ul className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <NavAnchor href={link.href} className={linkClass}>
                    {link.label}
                  </NavAnchor>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {media && (
                <button
                  type="button"
                  onClick={() => setMediaOpen(true)}
                  className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent md:inline-flex"
                >
                  <Play className="size-4 text-primary" />
                  {mediaButtonText}
                </button>
              )}

              <Link
                href={cartHref}
                aria-label={`Cart, ${cartCount} items`}
                className="relative inline-flex size-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent"
              >
                <ShoppingBag className="size-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex size-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent md:hidden"
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="border-t border-border p-3 md:hidden">
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <NavAnchor
                      href={link.href}
                      className={cn(linkClass, "block text-base")}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </NavAnchor>
                  </li>
                ))}
              </ul>
              {media && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setMediaOpen(true);
                  }}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Play className="size-4 text-primary" />
                  {mediaButtonText}
                </button>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Media modal */}
      {media && mediaOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={mediaButtonText}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setMediaOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setMediaOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            >
              <X className="size-5" />
            </button>
            {media.type === "video" ? (
              <video
                src={media.src}
                poster={media.poster}
                controls
                autoPlay={media.autoplay}
                muted={media.autoplay}
                playsInline
                className="aspect-video w-full"
              />
            ) : (
              <img src={media.src} alt="" className="w-full" />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FlexNavbar;
