import { AnimatePresence, motion } from "motion/react";
import Marquee from "react-fast-marquee";
import { heroCards, logos } from "../../data/constants";
import { useCyclingIndex } from "../../hooks/useCyclingIndex";
import { Container } from "../ui";

export function MarqueeStrip() {
  const currentCardIndex = useCyclingIndex(heroCards.length, 4000);

  return (
    <Container className="shrink-0">
      <div
        className="gsap-hidden flex flex-col items-center justify-between gap-12 pt-16 lg:flex-row lg:pt-0"
        data-marquee
      >
        <div className="mask-marquee relative flex w-full max-w-4xl flex-col gap-8 overflow-hidden md:gap-12">
          <Marquee speed={40} gradient={false}>
            <div className="flex gap-16 pr-16 md:gap-24 md:pr-24">
              {logos.map((logo) => (
                <span
                  key={logo}
                  className="cursor-default text-xl font-bold uppercase tracking-tighter text-brand-blue/65 transition-colors hover:text-black md:text-2xl"
                >
                  {logo}
                </span>
              ))}
            </div>
          </Marquee>
          <Marquee speed={30} gradient={false} direction="right">
            <div className="flex gap-16 pr-16 md:gap-24 md:pr-24">
              {[...logos].reverse().map((logo) => (
                <span
                  key={`rev-${logo}`}
                  className="cursor-default text-xl font-bold uppercase tracking-tighter text-brand-blue/65 transition-colors hover:text-black md:text-2xl"
                >
                  {logo}
                </span>
              ))}
            </div>
          </Marquee>
        </div>

        <div
          className="gsap-hidden relative mb-12 hidden h-32 w-full max-w-sm items-center xl:flex"
          data-hero-card
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCardIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 flex w-full items-center gap-4 rounded-full border border-brand-blue/30 bg-white/35 px-5 py-3 shadow-2xl backdrop-blur-xl"
            >
              <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-full border border-brand-blue/20 bg-white/60">
                <img
                  src={heroCards[currentCardIndex].img}
                  alt={heroCards[currentCardIndex].title}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-70"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-blue">
                  {heroCards[currentCardIndex].title}
                </p>
                <p className="text-[9px] leading-tight text-black/70">
                  {heroCards[currentCardIndex].desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Container>
  );
}
