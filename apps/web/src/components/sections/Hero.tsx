import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { TRUST_PILLARS } from "@/lib/content";
import { easeOut } from "@/lib/motion";

const item = { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: easeOut } } };

/**
 * Home hero — matches the approved design: dark interior on the left, sharp subject on the right,
 * serif display headline with a bright-green last line, serif pill CTAs, and a translucent crystal-glass
 * trust bar sitting inside the hero over the table.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 900], [0, reduce ? 0 : 70]);

  return (
    <section className="relative isolate flex min-h-[640px] flex-col overflow-hidden bg-[#161512] text-white lg:min-h-[min(100svh,980px)]">
      <motion.div style={{ y: bgY }} className="absolute -inset-y-[5%] inset-x-0 -z-10">
        <motion.picture initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, ease: easeOut }} className="block h-full w-full">
          {/* Below lg the subject moves into its own card, so only the blurred interior is used behind the copy. */}
          <source media="(min-width: 1024px)" srcSet="/images/hero.webp" />
          <img
            src="/images/hero-bg.webp"
            alt="A professional MaidHire housekeeper polishing a dining table in a bright family home"
            {...{ fetchpriority: "high" }}
            className={`h-full w-full object-cover object-[72%_50%] ${reduce ? "" : "animate-kenburns"}`}
          />
        </motion.picture>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f0c]/85 via-[#0d0f0c]/45 via-40% to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0d0f0c]/70 to-transparent" />
      </motion.div>

      {/* Copy — vertically centred in the remaining space above the trust bar */}
      <div className="container-x relative flex flex-1 flex-col justify-center pb-10 pt-32 lg:pb-14 lg:pt-36">
        <motion.div initial={reduce ? false : "hidden"} animate="visible" variants={{ visible: { transition: { staggerChildren: 0.13, delayChildren: 0.25 } } }} className="max-w-[760px]">
          <motion.h1 variants={item} className="h-serif text-[3rem] font-semibold sm:text-[3.8rem] lg:text-[4.2rem] xl:text-[4.6rem]">
            Find the
            <br />
            Right Help
            <br />
            <span className="text-mint-500">for a Happier Home</span>
          </motion.h1>
          <motion.p variants={item} className="mt-7 max-w-[560px] text-pretty font-serif text-[1.15rem] leading-relaxed text-white/90 sm:text-[1.35rem]">
            Verified and reliable maids, nannies, cooks and caregivers for your home — quick, safe, and hassle-free.
          </motion.p>
          <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
            <Button to="/candidates" variant="accent" size="lg" className="px-10 font-serif text-[1.15rem] font-semibold">
              Find a Maid
            </Button>
            <Button to="/how-it-works" variant="outline-light" size="lg" className="px-10 font-serif text-[1.15rem] font-semibold">
              Learn More
            </Button>
          </motion.div>
        </motion.div>

        {/* Mobile subject card */}
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

      {/* Crystal-glass trust bar */}
      <div className="container-x relative pb-8 lg:pb-9">
        <motion.ul
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easeOut, delay: 0.9 }}
          className="glass-tint mx-auto grid max-w-[1100px] grid-cols-2 gap-y-7 rounded-2xl px-6 py-7 text-white lg:grid-cols-4 lg:px-10 lg:py-8"
        >
          {TRUST_PILLARS.map(({ Icon, title, text }) => (
            <li key={title} className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3)]">
                <Icon aria-hidden="true" className="h-5.5 w-5.5" strokeWidth={1.7} />
              </span>
              <h2 className="mt-3.5 text-[0.98rem] font-bold leading-snug">{title}</h2>
              <p className="mt-1 hidden text-[0.8rem] text-white/65 sm:block">{text}</p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
