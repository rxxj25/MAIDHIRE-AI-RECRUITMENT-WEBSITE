import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/motion";

export const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/candidates", label: "Candidates" },
  { to: "/pricing", label: "Pricing" },
];

/**
 * Transparent over the dark hero/page headers, transitioning to a frosted dark bar on scroll.
 * Every page starts with a dark photographic header, so a light wordmark is always correct.
 */
export function Navbar() {
  const scrolled = useScrolled(32);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const reduce = useReducedMotion();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500", open ? "bg-forest-950" : scrolled ? "glass-dark shadow-[0_1px_0_rgb(255_255_255/0.06)]" : "bg-transparent")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-forest-950">
        Skip to content
      </a>
      <div className={cn("container-x flex items-center justify-between transition-[height] duration-500", scrolled ? "h-[68px]" : "h-[84px] lg:h-[92px]")}>
        <Logo tone="light" />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "relative inline-flex h-10 items-center rounded-full px-4 text-[0.95rem] font-medium text-white/85 transition-colors duration-300 hover:text-white",
                      "after:absolute after:inset-x-4 after:-bottom-0.5 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-mint-400 after:transition-transform after:duration-300 after:ease-[var(--ease-out-quart)] hover:after:scale-x-100",
                      isActive && "text-white after:scale-x-100",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <Button to="/contact" variant="white" size="md">
              Contact Us
            </Button>
          </div>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="absolute inset-x-0 top-full h-[calc(100dvh-68px)] overflow-y-auto border-t border-white/10 bg-forest-950 lg:hidden"
          >
            <motion.ul initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }} className="container-x flex flex-col py-6">
              {[...NAV, { to: "/contact", label: "Contact" }, { to: "/join", label: "Join as a Candidate" }].map((item) => (
                <motion.li key={item.to} variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) => cn("flex items-center justify-between border-b border-white/10 py-4 text-lg font-semibold text-white/85", isActive && "text-mint-400")}
                  >
                    {item.label}
                  </NavLink>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="pt-6">
                <Button to="/contact" variant="mint" size="lg" className="w-full" arrow>
                  Find a Maid
                </Button>
              </motion.li>
            </motion.ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
