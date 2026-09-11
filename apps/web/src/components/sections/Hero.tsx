import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { TRUST_PILLARS } from "@/lib/content";
import { easeOut } from "@/lib/motion";

const item = { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: easeOut } } };

/**
 * Home hero — mirrors the mockup: dark blurred interior, white display headline with a mint last line,
 * two pill CTAs, subject photo on the right, and the floating cream trust bar overlapping the bottom edge.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, reduce ? 0 : 120]);

  return (
    <section className="relative isolate overflow-hidden bg-forest-950 text-white">
      {/* Single composed backdrop: blurred interior on the left, subject on the right (matches the mockup at any width). */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10">
        <motion.picture initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, ease: easeOut }} className="block h-full w-full">
          {/* Below lg the subject moves into its own card, so only the blurred interior is used behind the copy. */}
          <source media="(min-width: 1024px)" srcSet="/images/hero.webp" />
          <img
            src="/images/hero-bg.webp"
            alt="A professional MaidHire housekeeper polishing a dining table in a bright family home"
            {...{ fetchpriority: "high" }}
            className={`h-[112%] w-full object-cover object-[78%_top] ${reduce ? "" : "animate-kenburns"}`}
          />
        </motion.picture>
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/90 via-forest-950/55 via-45% to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-forest-950/75 to-transparent" />
      </motion.div>

      <div className="container-x relative pb-10 pt-36 lg:pb-56 lg:pt-52">
        <motion.div initial={reduce ? false : "hidden"} animate="visible" variants={{ visible: { transition: { staggerChildren: 0.13, delayChildren: 0.25 } } }} className="max-w-[760px]">
          <motion.h1 variants={item} className="h-display text-[2.9rem] sm:text-[3.9rem] lg:text-[4.6rem] xl:text-[5rem]">
            Find the
            <br />
            Right Help
            <br />
            <span className="text-mint-400">for a Happier Home</span>
          </motion.h1>
          <motion.p variants={item} className="mt-6 max-w-[460px] text-pretty text-lg font-medium leading-relaxed text-white/85 sm:text-xl">
            Verified and reliable maids, nannies, cooks and caregivers for homes across the UAE and Saudi Arabia — quick, safe, and hassle-free.
          </motion.p>
          <motion.div variants={item} className="mt-9 flex flex-wrap gap-4">
            <Button to="/candidates" variant="mint" size="lg">
              Find a Maid
            </Button>
            <Button to="/how-it-works" variant="outline-light" size="lg">
              Learn More
            </Button>
          </motion.div>
        </motion.div>

        {/* Mobile subject: shown below copy on small screens so the layout is intentional, not a squeezed desktop */}
        <motion.img
          src="/images/hero-mobile.webp"
          alt=""
          aria-hidden="true"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easeOut, delay: 0.6 }}
          className="mt-12 aspect-[4/3] w-full rounded-2xl object-cover shadow-lift lg:hidden"
        />
      </div>

      {/* Floating trust bar */}
      <div className="container-x relative">
        <motion.ul
          initial={reduce ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easeOut, delay: 0.9 }}
          className="relative z-10 -mb-24 grid grid-cols-2 gap-y-8 rounded-2xl bg-cream-200 px-6 py-8 text-forest-950 shadow-lift lg:absolute lg:inset-x-12 lg:-bottom-16 lg:mb-0 lg:grid-cols-4 lg:px-10"
        >
          {TRUST_PILLARS.map(({ Icon, title, text }) => (
            <li key={title} className="flex flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-forest-900/60 text-forest-900">
                <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <h2 className="mt-3 text-[0.95rem] font-bold leading-snug">{title}</h2>
              <p className="mt-1 hidden text-[0.8rem] text-ink-500 sm:block">{text}</p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
