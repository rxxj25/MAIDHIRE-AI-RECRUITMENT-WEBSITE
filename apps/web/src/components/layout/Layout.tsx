import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { useLenis } from "@/hooks/useLenis";
import { pageTransition } from "@/lib/motion";
import { Spinner } from "@/components/ui/Spinner";

export function Layout() {
  useLenis();
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main"
          key={pathname}
          className="flex-1"
          {...(reduce ? {} : pageTransition)}
        >
          <Suspense fallback={<div className="pt-40"><Spinner /></div>}>
            <Outlet />
          </Suspense>
        </motion.main>
      </AnimatePresence>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
