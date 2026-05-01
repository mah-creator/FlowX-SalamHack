import { useRef, type MouseEvent, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const PARTICLES = [
  { top: "8%", left: "14%", size: 2 },
  { top: "14%", left: "74%", size: 3 },
  { top: "20%", left: "29%", size: 2 },
  { top: "23%", left: "88%", size: 4 },
  { top: "32%", left: "9%", size: 2 },
  { top: "36%", left: "57%", size: 3 },
  { top: "40%", left: "82%", size: 2 },
  { top: "47%", left: "19%", size: 4 },
  { top: "52%", left: "69%", size: 3 },
  { top: "58%", left: "37%", size: 2 },
  { top: "61%", left: "91%", size: 3 },
  { top: "66%", left: "13%", size: 2 },
  { top: "71%", left: "52%", size: 4 },
  { top: "76%", left: "80%", size: 2 },
  { top: "82%", left: "24%", size: 3 },
  { top: "86%", left: "64%", size: 2 },
  { top: "12%", left: "48%", size: 3 },
  { top: "28%", left: "42%", size: 2 },
  { top: "63%", left: "44%", size: 3 },
  { top: "90%", left: "90%", size: 2 },
];

function particleVisibility(index: number) {
  if (index < 10) return "";
  if (index < 15) return "hidden md:block";
  return "hidden lg:block";
}

function FloatingParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const particles = Array.from(
        container.querySelectorAll<HTMLElement>("[data-particle]"),
      );

      if (reduceMotion) {
        gsap.set(particles, { opacity: 0.24 });
        return;
      }

      gsap.fromTo(
        particles,
        { opacity: 0 },
        { opacity: 0.6, duration: 0.8, stagger: 0.03, ease: "power1.out" },
      );

      particles.forEach((particle, i) => {
        gsap.to(particle, {
          x:
            i % 2 === 0
              ? gsap.utils.random(10, 28)
              : gsap.utils.random(-28, -10),
          y:
            i % 3 === 0
              ? gsap.utils.random(-36, -12)
              : gsap.utils.random(12, 36),
          duration: gsap.utils.random(8, 16),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: gsap.utils.random(0, 4),
        });
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {PARTICLES.map((particle, i) => (
        <span
          key={`cta-particle-${particle.top}-${particle.left}-${i}`}
          data-particle
          className={`absolute rounded-full bg-white/[0.06] ${particleVisibility(i)}`}
          style={{
            width: `${particle.size * 2}px`,
            height: `${particle.size * 2}px`,
            top: particle.top,
            left: particle.left,
          }}
        />
      ))}
    </div>
  );
}

function MagneticButton({ children }: { children: ReactNode }) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = buttonRef.current;
    if (!btn) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (reduceMotion || !canHover) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.2,
      y: y * 0.2,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="Create your first transfer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={[
        "group relative rounded-full bg-white px-9 py-5 text-[11px] font-bold uppercase tracking-[0.28em] text-brand-blue",
        "shadow-[0_0_40px_rgba(255,255,255,0.16)] transition-transform transition-shadow duration-300",
        "hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/85 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]",
      ].join(" ")}
      style={{ willChange: "transform" }}
    >
      <span className="relative z-10 flex items-center gap-3">
        {children}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
      <span className="pointer-events-none absolute inset-0 scale-150 rounded-full bg-white/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
    </button>
  );
}

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundSweepRef = useRef<HTMLDivElement>(null);
  const headingLine1Ref = useRef<HTMLSpanElement[]>([]);
  const headingLine2Ref = useRef<HTMLSpanElement[]>([]);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonWrapRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  headingLine1Ref.current = [];
  headingLine2Ref.current = [];

  const addLine1Ref = (el: HTMLSpanElement | null) => {
    if (el && !headingLine1Ref.current.includes(el)) {
      headingLine1Ref.current.push(el);
    }
  };

  const addLine2Ref = (el: HTMLSpanElement | null) => {
    if (el && !headingLine2Ref.current.includes(el)) {
      headingLine2Ref.current.push(el);
    }
  };

  const renderWords = (
    text: string,
    className: string,
    addRef: (el: HTMLSpanElement | null) => void,
  ) =>
    text.split(" ").map((word, i) => (
      <span key={`${word}-${i}`} className="mr-3 inline-block overflow-hidden">
        <span
          ref={addRef}
          className={`inline-block ${className}`}
          style={{ willChange: "transform, opacity" }}
        >
          {word}
        </span>
      </span>
    ));

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const trustItems = Array.from(
        section.querySelectorAll("[data-trust] > span"),
      );
      const transformTargets = [
        backgroundSweepRef.current,
        ...headingLine1Ref.current,
        ...headingLine2Ref.current,
        subtitleRef.current,
        buttonWrapRef.current,
        ...trustItems,
      ].filter(Boolean);

      gsap.set(transformTargets, { willChange: "transform, opacity" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        onComplete: () => {
          gsap.set(transformTargets, { willChange: "auto" });
        },
      });

      if (reduceMotion) {
        tl.from(backgroundSweepRef.current, { opacity: 0.4, duration: 0.35 })
          .from(
            headingLine1Ref.current,
            { opacity: 0, duration: 0.3, stagger: 0.06 },
            "-=0.15",
          )
          .from(
            headingLine2Ref.current,
            { opacity: 0, duration: 0.3, stagger: 0.06 },
            "-=0.1",
          )
          .from(subtitleRef.current, { opacity: 0, duration: 0.25 }, "-=0.1")
          .from(buttonWrapRef.current, { opacity: 0, duration: 0.3 }, "-=0.1")
          .from(
            trustItems,
            { opacity: 0, duration: 0.25, stagger: 0.06 },
            "-=0.1",
          );

        return;
      }

      tl.from(backgroundSweepRef.current, {
        opacity: 0.45,
        scale: 1.08,
        duration: 0.9,
        ease: "power2.out",
      });

      tl.from(
        headingLine1Ref.current,
        {
          y: 80,
          opacity: 0,
          rotateX: 40,
          transformOrigin: "center bottom",
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
        },
        "-=0.4",
      );

      tl.from(
        headingLine2Ref.current,
        {
          y: 60,
          opacity: 0,
          rotateX: 30,
          transformOrigin: "center bottom",
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
        },
        "-=0.3",
      );

      tl.from(
        subtitleRef.current,
        {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.2",
      );

      tl.from(
        buttonWrapRef.current,
        {
          y: 30,
          opacity: 0,
          scale: 0.9,
          duration: 0.7,
          ease: "back.out(1.5)",
        },
        "-=0.2",
      );

      tl.from(
        trustItems,
        {
          y: 15,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.08,
        },
        "-=0.3",
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-6 py-20 text-white md:min-h-[70vh] lg:min-h-[80vh]"
      style={{
        background:
          "linear-gradient(180deg, #0a0a0a 0%, #062e35 30%, #0094ac 100%)",
      }}
    >
      <div
        ref={backgroundSweepRef}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,148,172,0.15), transparent 60%)",
        }}
      />

      <FloatingParticles />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <h2 className=" text-5xl font-bold tracking-tighter text-white md:text-7xl lg:text-8xl leading-tight">
          {renderWords("Start Sending", "text-white", addLine1Ref)}
        </h2>

        <p className="mb-8 text-5xl font-light  tracking-tighter text-white/80 md:mb-10 md:text-6xl lg:text-7xl">
          {renderWords("Smarter", "text-white/80 ", addLine2Ref)}
        </p>

        <p
          ref={subtitleRef}
          className="mx-auto mb-10 max-w-2xl text-lg font-light leading-relaxed text-white/60 md:text-xl"
        >
          Join thousands using FlowX to bypass traditional banking barriers.
        </p>

        <div ref={buttonWrapRef} className="mb-10 flex justify-center">
          <MagneticButton>Create Your First Transfer</MagneticButton>
        </div>

        <div
          ref={trustRef}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          data-trust
        >
          {["No hidden fees", "Instant matching", "Bank-grade security"].map(
            (text) => (
              <span
                key={text}
                className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/40"
                data-trust-item
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-teal/60" />
                {text}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
