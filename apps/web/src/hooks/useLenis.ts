import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import type Lenis from "lenis";

let lenis: Lenis | null = null;

/** The active Lenis instance (null on touch devices / reduced motion). */
export const getLenis = () => lenis;

/** Programmatic scroll that cooperates with Lenis when it is active (native fallback otherwise). */
export function scrollToTarget(target: number | HTMLElement | string, opts: { offset?: number; immediate?: boolean } = {}) {
  const { offset = -96, immediate = false } = opts;
  if (lenis) {
    lenis.scrollTo(target, { offset: typeof target === "number" ? 0 : offset, immediate, duration: 1.1 });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
  else {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: immediate ? "auto" : "smooth" });
  }
}

/**
 * Smooth scrolling on pointer-fine (desktop) devices only. Skipped entirely for touch devices and
 * when the user prefers reduced motion. Lenis is loaded lazily so it never blocks first paint.
 */
export function useLenis() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !fine) return;
    let raf = 0;
    let cancelled = false;
    import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;
      lenis = new LenisCtor({ lerp: 0.11, wheelMultiplier: 0.95, anchors: { offset: -96 } });
      const loop = (t: number) => {
        lenis?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // On route change: jump to top, or to the hash target once the new page has painted.
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => scrollToTarget(hash), 300);
      return () => clearTimeout(t);
    }
    scrollToTarget(0, { immediate: true });
  }, [pathname, hash]);
}
