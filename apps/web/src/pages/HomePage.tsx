import { Seo } from "@/components/ui/Seo";
import { Hero } from "@/components/sections/Hero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { Steps } from "@/components/sections/Steps";
import { ParallaxShowcase } from "@/components/sections/ParallaxShowcase";
import { FeaturedCandidates } from "@/components/sections/FeaturedCandidates";
import { Testimonials } from "@/components/sections/Testimonials";
import { StatsBand } from "@/components/sections/StatsBand";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export default function HomePage() {
  return (
    <>
      <Seo title="MaidHire — Verified Domestic Staff in the UAE & Saudi Arabia" description="Find verified maids, nannies, cooks and caregivers in Dubai, Abu Dhabi, Riyadh and Jeddah. Personal matching, full documentation support, replacement guarantee." path="/" />
      <Hero />

      <section className="pb-20 pt-20 lg:pb-28 lg:pt-28">
        <div className="container-x">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader eyebrow="Our Services" title={<>Tailored Support<br />for Every Home</>} description="From daily housekeeping to specialised care, we help you find the right professional for your needs." />
            <Reveal className="shrink-0">
              <Button to="/services" variant="outline" arrow>
                All services
              </Button>
            </Reveal>
          </div>
          <div className="mt-12">
            <ServicesGrid />
          </div>
        </div>
      </section>

      <section className="bg-cream-200/70 py-20 lg:py-28">
        <div className="container-x">
          <SectionHeader eyebrow="How It Works" align="center" title={<>Get the Right Help<br />in 4 Easy Steps</>} description="We make domestic staff recruitment simple, transparent, and stress-free." />
          <div className="mt-14">
            <Steps />
          </div>
        </div>
      </section>

      <ParallaxShowcase />

      <FeaturedCandidates />

      <section className="py-16 lg:py-20">
        <div className="container-x">
          <StatsBand />
        </div>
      </section>

      <Testimonials />
    </>
  );
}
