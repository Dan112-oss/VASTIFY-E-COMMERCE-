"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import {
  Headphones,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  truck: Truck,
  shield: ShieldCheck,
  return: RotateCcw,
  support: Headphones,
} as const;

export type HeroFeatureIcon = keyof typeof ICONS;

export interface HeroSectionProps {
  badgeText?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  features?: { label: string; icon: HeroFeatureIcon }[];
  className?: string;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export function HeroSection({
  badgeText,
  title,
  highlight,
  subtitle,
  primaryCTA,
  secondaryCTA,
  features = [],
  className,
}: HeroSectionProps) {
  return (
    <section className={cn("relative w-full", className)}>
      {/* Soft gold glow behind the text */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl sm:h-96 sm:w-96"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 text-center"
      >
        {badgeText && (
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary"
          >
            <Sparkles className="size-3.5" />
            {badgeText}
          </motion.span>
        )}

        <motion.h1
          variants={item}
          className="font-display text-4xl font-semibold leading-[1.1] sm:text-6xl"
        >
          {title}
          {highlight && (
            <span className="mt-1 block bg-linear-to-r from-primary to-foreground bg-clip-text text-transparent">
              {highlight}
            </span>
          )}
        </motion.h1>

        {subtitle && (
          <motion.p
            variants={item}
            className="max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            {subtitle}
          </motion.p>
        )}

        <motion.div
          variants={item}
          className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
        >
          <Link
            href={primaryCTA.href}
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 sm:w-auto"
          >
            {primaryCTA.label}
          </Link>
          {secondaryCTA && (
            <Link
              href={secondaryCTA.href}
              className="inline-flex w-full items-center justify-center rounded-full border border-border bg-card/60 px-8 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-accent sm:w-auto"
            >
              {secondaryCTA.label}
            </Link>
          )}
        </motion.div>

        {features.length > 0 && (
          <motion.ul
            variants={item}
            className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {features.map((f) => {
              const Icon = ICONS[f.icon];
              return (
                <li
                  key={f.label}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-3 text-left text-sm backdrop-blur"
                >
                  <Icon className="size-4 shrink-0 text-primary" />
                  <span>{f.label}</span>
                </li>
              );
            })}
          </motion.ul>
        )}
      </motion.div>
    </section>
  );
}

export default HeroSection;
