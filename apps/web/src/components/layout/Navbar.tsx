import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LogOut, Menu, User, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/motion";
import { useGuestLogout, useGuestMe } from "@/lib/guestAuth";
import { useCandidateLogout, useCandidateMe } from "@/lib/candidateAuth";

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
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { data: guestData } = useGuestMe();
  const { data: candidateData } = useCandidateMe();
  const guestLogout = useGuestLogout();
  const candidateLogout = useCandidateLogout();
  const guest = guestData?.user;
  const candidate = candidateData?.user;
  // A visitor is at most one of these at a time; guest takes precedence if somehow both cookies exist.
  const account = guest ? { name: guest.name, profileTo: undefined as string | undefined, logout: guestLogout } : candidate ? { name: candidate.name, profileTo: "/candidate/status", logout: candidateLogout } : null;

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
          <ul className="flex items-center gap-3 xl:gap-5">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "relative inline-flex h-10 items-center rounded-full px-3 text-[1.02rem] font-medium text-white/85 transition-colors duration-300 hover:text-white",
                      "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-mint-500 after:transition-transform after:duration-300 after:ease-[var(--ease-out-quart)] hover:after:scale-x-100",
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
          <div className="hidden items-center gap-3 sm:flex">
            {account ? (
              <div className="flex items-center gap-2">
                {account.profileTo ? (
                  <NavLink to={account.profileTo} className="flex items-center gap-2 rounded-full bg-white/10 py-2 pl-3 pr-4 text-[0.9rem] font-medium text-white ring-1 ring-white/20 hover:bg-white/15">
                    <User aria-hidden="true" className="h-4 w-4" />
                    {account.name.split(" ")[0]}
                  </NavLink>
                ) : (
                  <span className="flex items-center gap-2 rounded-full bg-white/10 py-2 pl-3 pr-4 text-[0.9rem] font-medium text-white ring-1 ring-white/20">
                    <User aria-hidden="true" className="h-4 w-4" />
                    {account.name.split(" ")[0]}
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Log out"
                  onClick={() => account.logout.mutate()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <LogOut aria-hidden="true" className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <Button to="/login" variant="ghost" size="md" className="!text-white hover:!bg-white/10">
                Log In
              </Button>
            )}
            <Button to="/contact" variant="glass" size="md" className="px-8">
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
                    className={({ isActive }) => cn("flex items-center justify-between border-b border-white/10 py-4 text-lg font-semibold text-white/85", isActive && "text-mint-500")}
                  >
                    {item.label}
                  </NavLink>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}>
                {account ? (
                  <button
                    type="button"
                    onClick={() => account.logout.mutate(undefined, { onSuccess: () => navigate("/") })}
                    className="flex w-full items-center justify-between border-b border-white/10 py-4 text-lg font-semibold text-white/85"
                  >
                    Log Out ({account.name.split(" ")[0]})
                  </button>
                ) : (
                  <NavLink to="/login" className={({ isActive }) => cn("flex items-center justify-between border-b border-white/10 py-4 text-lg font-semibold text-white/85", isActive && "text-mint-500")}>
                    Log In
                  </NavLink>
                )}
              </motion.li>
              <motion.li variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="pt-6">
                <Button to="/contact" variant="accent" size="lg" className="w-full" arrow>
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
