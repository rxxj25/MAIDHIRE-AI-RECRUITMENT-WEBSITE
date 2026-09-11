import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal, RevealItem } from "./Reveal";

interface Props {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  serif?: boolean;
  className?: string;
}

export function SectionHeader({ eyebrow, title, description, align = "left", tone = "dark", serif = true, className }: Props) {
  const light = tone === "light";
  return (
    <Reveal staggerChildren={0.1} className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <RevealItem as="p" className={cn("eyebrow mb-4", light ? "text-mint-500" : "text-forest-700")}>
          {eyebrow}
        </RevealItem>
      )}
      <RevealItem
        as="h2"
        className={cn(
          "text-balance",
          serif ? "h-serif text-[2.4rem] sm:text-[3.1rem] lg:text-[3.6rem]" : "h-display text-[2.3rem] sm:text-[2.9rem] lg:text-[3.4rem]",
          light ? "text-white" : "text-ink-950",
        )}
      >
        {title}
      </RevealItem>
      {description && (
        <RevealItem as="p" className={cn("mt-5 text-pretty text-[1.05rem] leading-relaxed sm:text-lg", light ? "text-white/80" : "text-ink-500")}>
          {description}
        </RevealItem>
      )}
    </Reveal>
  );
}
