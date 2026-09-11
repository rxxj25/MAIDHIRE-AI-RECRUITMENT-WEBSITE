import { ParallaxScene } from "@/components/ui/parallax-scrolling";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

/**
 * Home-page signature moment: the brand line slides behind the housekeeper as you scroll,
 * then the "Smoother Way" copy follows. Replaces the flat CTA banner.
 */
export function ParallaxShowcase() {
  return (
    <section className="bg-[#0b3a2c] text-white">
      <ParallaxScene
        fadeTo="#0b3a2c"
        layers={[
          {
            // Far: the room, tinted to the brand green
            yPercent: 70,
            children: (
              <>
                <img src="/images/parallax/room.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="h-full w-full object-cover object-[50%_60%]" />
                <div className="absolute inset-0 bg-[#0b3a2c]/70 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#062b21]/60 via-transparent to-[#062b21]/40" />
              </>
            ),
          },
          {
            // Mid: soft glow behind the figure
            yPercent: 45,
            children: <div aria-hidden="true" className="absolute left-1/2 top-[55%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint-400/12 blur-3xl" />,
          },
          {
            // Title layer
            yPercent: 30,
            className: "flex flex-col items-center justify-start pt-[7vh] text-center",
            children: (
              <>
                <p className="eyebrow text-mint-500">Our Promise</p>
                <h2 className="h-serif mt-4 text-[clamp(2.6rem,8vw,7.4rem)] leading-[0.95] tracking-[-0.02em]">
                  Better Homes,
                  <br />
                  Happier Lives
                </h2>
              </>
            ),
          },
          {
            // Near: the housekeeper — barely moves, so the headline slides behind her
            yPercent: 8,
            className: "flex items-end justify-center",
            children: <img src="/images/parallax/maid-cutout.webp" alt="A smiling MaidHire housekeeper holding folded towels" loading="lazy" decoding="async" className="h-[58%] w-auto max-w-none object-contain drop-shadow-[0_40px_60px_rgb(0_0_0/0.45)] sm:h-[64%]" />,
          },
        ]}
      />
      <div className="container-x pb-24 pt-6 text-center lg:pb-32">
        <Reveal staggerChildren={0.12} className="mx-auto max-w-2xl">
          <RevealItem as="h3" className="h-serif text-[2rem] sm:text-[2.6rem]">
            A Smoother Way to a Happier Home
          </RevealItem>
          <RevealItem as="p" className="mt-4 text-pretty text-lg leading-relaxed text-white/80">
            Let us handle the search, screening and paperwork, so you can focus on what truly matters.
          </RevealItem>
          <RevealItem className="mt-8">
            <Button to="/contact" variant="accent" size="lg" className="px-10 font-serif text-[1.1rem] font-semibold">
              Find Your Maid
            </Button>
          </RevealItem>
        </Reveal>
      </div>
    </section>
  );
}
