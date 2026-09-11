/**
 * Layered scroll parallax — adapted from Osmo's "Parallax" resource (21st.dev).
 * Changes from the original: uses the site-wide Lenis instance instead of creating a second one,
 * scopes ScrollTrigger cleanup to this component (the original killed every trigger on the page),
 * honours prefers-reduced-motion, and takes MaidHire layers as props instead of hard-coded images.
 */
import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { getLenis } from "@/hooks/useLenis";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export interface ParallaxLayer {
  /** How far the layer travels while the scene scrolls out (percentage of its own height). Far = bigger. */
  yPercent: number;
  className?: string;
  children: ReactNode;
}

interface Props {
  layers: ParallaxLayer[];
  /** Colour the scene fades into at the bottom (usually the next section's background). */
  fadeTo?: string;
  className?: string;
}

export function ParallaxScene({ layers, fadeTo = "var(--color-cream-100)", className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || reduce) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0 },
      });
      root.querySelectorAll<HTMLElement>("[data-parallax-layer]").forEach((el, i) => {
        tl.to(el, { yPercent: Number(el.dataset.parallaxLayer), ease: "none" }, i === 0 ? undefined : "<");
      });
    }, root);

    // Keep ScrollTrigger in step with Lenis' smoothed scroll position.
    const lenis = getLenis();
    const sync = () => ScrollTrigger.update();
    lenis?.on("scroll", sync);
    ScrollTrigger.refresh();

    return () => {
      lenis?.off("scroll", sync);
      ctx.revert();
    };
  }, [reduce]);

  return (
    <div ref={ref} className={cn("relative h-[88svh] min-h-[560px] max-h-[900px] overflow-hidden", className)}>
      {layers.map((l, i) => (
        <div key={i} data-parallax-layer={reduce ? 0 : l.yPercent} className={cn("absolute inset-0 will-change-transform", l.className)}>
          {l.children}
        </div>
      ))}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%]" style={{ background: `linear-gradient(to bottom, transparent, ${fadeTo})` }} />
    </div>
  );
}
