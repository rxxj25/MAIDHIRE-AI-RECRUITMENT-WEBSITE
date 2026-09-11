import type { ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/motion";

interface Props {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  /** Blurred background image (public path). */
  background: string;
  /** Optional subject image positioned on the right (public path). */
  subject?: string;
  subjectAlt?: string;
  align?: "left" | "center";
  serif?: boolean;
  children?: ReactNode;
  compact?: boolean;
  className?: string;
  /** Extra bottom space so an overlapping card can float over the photo. */
  overlap?: boolean;
}

/**
 * Dark photographic page header used by every inner page (matches the mockups' consistent top band).
 * Background gets a very subtle parallax via transform only; text staggers in on mount.
 */
export function PageHeader({ eyebrow, title, description, background, subject, subjectAlt = "", align = "left", serif = true, children, compact, className, overlap }: Props) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, reduce ? 0 : 90]);
  const item = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: easeOut } } };

  return (
    <section className={cn("relative isolate overflow-hidden bg-[#161512] text-white", className)}>
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        <img src={background} alt="" aria-hidden="true" className="h-[120%] w-full object-cover object-[65%_30%]" {...{ fetchpriority: "high" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f0c]/82 via-[#0d0f0c]/45 via-45% to-[#0d0f0c]/10" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0d0f0c]/60 to-transparent" />
      </motion.div>

      {subject && (
        <motion.img
          src={subject}
          alt={subjectAlt}
          initial={reduce ? false : { opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: easeOut, delay: 0.2 }}
          className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-auto max-w-[52%] object-contain object-right-bottom mask-fade-l lg:block"
        />
      )}

      <div className={cn("container-x relative", compact ? "pb-16 pt-32 lg:pb-20 lg:pt-40" : "pb-20 pt-36 lg:pb-28 lg:pt-48", overlap && "pb-40 lg:pb-52", subject && "lg:pr-[46%]")}>
        <motion.div initial={reduce ? false : "hidden"} animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }} className={cn("max-w-3xl", align === "center" && "mx-auto max-w-4xl text-center")}>
          <motion.p variants={item} className="eyebrow mb-5 text-mint-500">
            {eyebrow}
          </motion.p>
          <motion.h1 variants={item} className={cn("text-balance", serif ? "h-serif text-[2.5rem] sm:text-[3.2rem] lg:text-[3.9rem]" : "h-display text-[2.6rem] sm:text-[3.4rem] lg:text-[4.2rem]")}>
            {title}
          </motion.h1>
          {description && (
            <motion.p variants={item} className={cn("mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/80 sm:text-xl", align === "center" && "mx-auto")}>
              {description}
            </motion.p>
          )}
          {children && (
            <motion.div variants={item} className="mt-9">
              {children}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
