import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { fadeUp, stagger, viewport } from "@/lib/motion";

type Props<T extends ElementType> = {
  as?: T;
  variants?: Variants;
  delay?: number;
  /** Stagger children that are themselves <RevealItem>. */
  staggerChildren?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/** Viewport-triggered reveal. Uses IntersectionObserver via framer-motion; no scroll listeners. */
export function Reveal<T extends ElementType = "div">({ as, variants, delay = 0, staggerChildren, children, ...rest }: Props<T>) {
  const reduce = useReducedMotion();
  const Tag = (motion as unknown as Record<string, typeof motion.div>)[(as as string) ?? "div"] ?? motion.div;
  if (reduce) {
    const Plain = (as ?? "div") as ElementType;
    return <Plain {...rest}>{children}</Plain>;
  }
  const v = staggerChildren !== undefined ? stagger(staggerChildren, delay) : (variants ?? fadeUp);
  return (
    <Tag initial="hidden" whileInView="visible" viewport={viewport} variants={v} transition={{ delay }} {...(rest as object)}>
      {children}
    </Tag>
  );
}

export function RevealItem<T extends ElementType = "div">({ as, variants = fadeUp, children, ...rest }: Props<T>) {
  const reduce = useReducedMotion();
  const Tag = (motion as unknown as Record<string, typeof motion.div>)[(as as string) ?? "div"] ?? motion.div;
  if (reduce) {
    const Plain = (as ?? "div") as ElementType;
    return <Plain {...rest}>{children}</Plain>;
  }
  return (
    <Tag variants={variants} {...(rest as object)}>
      {children}
    </Tag>
  );
}
