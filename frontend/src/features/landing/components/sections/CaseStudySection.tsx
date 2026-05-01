import { useRef, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Zap } from "lucide-react";
import { caseStudy, type CaseStudyPerson } from "../../data/constants";
import { Container } from "../ui";

gsap.registerPlugin(ScrollTrigger);

interface PersonCardProps {
  person: CaseStudyPerson;
  side: "left" | "right";
  cardRef?: RefObject<HTMLDivElement | null>;
}

function PersonCard({ person, side, cardRef }: PersonCardProps) {
  return (
    <div
      ref={cardRef}
      className={[
        "group relative w-full rounded-2xl border border-white/[0.08] p-6 md:p-8",
        "bg-white/[0.03] backdrop-blur-sm shadow-[0_24px_50px_-30px_rgba(0,148,172,0.35)]",
        "transition-colors duration-300 hover:border-brand-teal/35",
        "md:max-w-sm",
        side === "right" ? "md:ml-auto md:text-right" : "",
      ].join(" ")}
      data-person-card
    >
      <div
        className={[
          "mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-brand-teal/20",
          "bg-white/[0.05] text-sm font-semibold text-white shadow-lg shadow-brand-teal/10",
          side === "right" ? "md:ml-auto" : "",
        ].join(" ")}
      >
        {person.locationCode}
      </div>

      <h4 className="mb-1 text-lg font-semibold text-white" data-name>
        {person.name}
      </h4>
      <p
        className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-teal"
        data-location
      >
        {person.location}
      </p>
      <p className="text-sm font-light leading-relaxed text-white/50" data-desc>
        {person.description}
      </p>

      <div
        className={[
          "pointer-events-none absolute top-0 h-16 w-16",
          side === "left" ? "left-0" : "right-0",
        ].join(" ")}
        style={{
          background: `radial-gradient(circle at ${side === "left" ? "0% 0%" : "100% 0%"}, rgba(0,148,172,0.08), transparent 70%)`,
        }}
      />
    </div>
  );
}

function CorridorMap({ mobile = false }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <div className="relative mx-auto w-full max-w-sm py-4" data-corridor>
        <svg viewBox="0 0 80 220" className="mx-auto h-auto w-20" fill="none">
          <line
            x1="40"
            y1="24"
            x2="40"
            y2="196"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
            strokeDasharray="8 6"
          />
          <line
            x1="40"
            y1="24"
            x2="40"
            y2="196"
            stroke="#0094ac"
            strokeWidth="2"
            data-corridor-path
            strokeDasharray="172"
            strokeDashoffset="172"
          />
          <circle
            cx="40"
            cy="24"
            r="6"
            fill="#0a0a0a"
            stroke="#0094ac"
            strokeWidth="1.5"
            data-node-left
          />
          <circle
            cx="40"
            cy="196"
            r="6"
            fill="#0a0a0a"
            stroke="#0094ac"
            strokeWidth="1.5"
            data-node-right
          />
          <circle cx="40" cy="24" r="4" fill="#0094ac" data-traveling-dot />

          <rect
            x="10"
            y="92"
            width="60"
            height="34"
            rx="17"
            fill="#0094ac"
            data-flowx-badge
            opacity="0"
          />
          <text
            x="40"
            y="113"
            textAnchor="middle"
            fill="white"
            fontSize="9"
            fontWeight="700"
            letterSpacing="0.1em"
            data-flowx-text
            opacity="0"
          >
            FLOWX
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-3xl py-8" data-corridor>
      <svg viewBox="0 0 600 60" className="h-auto w-full" fill="none">
        <line
          x1="40"
          y1="30"
          x2="560"
          y2="30"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="2"
          strokeDasharray="8 6"
        />
        <line
          x1="40"
          y1="30"
          x2="560"
          y2="30"
          stroke="#0094ac"
          strokeWidth="2"
          data-corridor-path
          strokeDasharray="520"
          strokeDashoffset="520"
        />
        <circle
          cx="40"
          cy="30"
          r="6"
          fill="#0a0a0a"
          stroke="#0094ac"
          strokeWidth="1.5"
          data-node-left
        />
        <circle
          cx="560"
          cy="30"
          r="6"
          fill="#0a0a0a"
          stroke="#0094ac"
          strokeWidth="1.5"
          data-node-right
        />
        <circle cx="40" cy="30" r="4" fill="#0094ac" data-traveling-dot />

        <rect
          x="260"
          y="12"
          width="80"
          height="36"
          rx="18"
          fill="#0094ac"
          data-flowx-badge
          opacity="0"
        />
        <text
          x="300"
          y="35"
          textAnchor="middle"
          fill="white"
          fontSize="10"
          fontWeight="700"
          letterSpacing="0.1em"
          data-flowx-text
          opacity="0"
        >
          FLOWX
        </text>
      </svg>
    </div>
  );
}

export function CaseStudySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const overlineRef = useRef<HTMLSpanElement>(null);
  const headingWordsRef = useRef<HTMLSpanElement[]>([]);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const corridorDesktopRef = useRef<HTMLDivElement>(null);
  const corridorMobileRef = useRef<HTMLDivElement>(null);
  const matchLineRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  headingWordsRef.current = [];

  const addHeadingWordRef = (el: HTMLSpanElement | null) => {
    if (el && !headingWordsRef.current.includes(el)) {
      headingWordsRef.current.push(el);
    }
  };

  const renderWords = (text: string, className: string) =>
    text.split(" ").map((word, i) => (
      <span key={`${word}-${i}`} className="mr-3 inline-block overflow-hidden">
        <span
          ref={addHeadingWordRef}
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
      const mm = gsap.matchMedia();

      const buildTimeline = (isMobile: boolean) => {
        const corridorRoot = isMobile
          ? corridorMobileRef.current
          : corridorDesktopRef.current;
        const corridorPath =
          corridorRoot?.querySelector<SVGLineElement>("[data-corridor-path]") ??
          null;
        const travelingDot =
          corridorRoot?.querySelector<SVGCircleElement>(
            "[data-traveling-dot]",
          ) ?? null;
        const nodeLeft =
          corridorRoot?.querySelector<SVGCircleElement>("[data-node-left]") ??
          null;
        const nodeRight =
          corridorRoot?.querySelector<SVGCircleElement>("[data-node-right]") ??
          null;
        const badge =
          corridorRoot?.querySelector<SVGRectElement>("[data-flowx-badge]") ??
          null;
        const badgeText =
          corridorRoot?.querySelector<SVGTextElement>("[data-flowx-text]") ??
          null;

        const transformTargets = [
          overlineRef.current,
          ...headingWordsRef.current,
          leftCardRef.current,
          rightCardRef.current,
          corridorRoot,
          matchLineRef.current,
          resultRef.current,
        ].filter(Boolean);

        gsap.set(transformTargets, { willChange: "transform, opacity" });

        if (travelingDot) {
          gsap.set(travelingDot, {
            attr: isMobile ? { cx: 40, cy: 24 } : { cx: 40, cy: 30 },
          });
        }

        if (corridorPath) {
          gsap.set(corridorPath, {
            strokeDashoffset: isMobile ? 172 : 520,
          });
        }

        const tl = gsap.timeline({
          defaults: {
            ease: "power2.out",
          },
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
          onComplete: () => {
            gsap.set(transformTargets, { willChange: "auto" });
          },
        });

        if (reduceMotion) {
          tl.from(overlineRef.current, { opacity: 0, duration: 0.3 })
            .from(
              headingWordsRef.current,
              { opacity: 0, duration: 0.3, stagger: 0.06 },
              "-=0.1",
            )
            .from(
              [leftCardRef.current, rightCardRef.current],
              { opacity: 0, duration: 0.35, stagger: 0.12 },
              "-=0.05",
            )
            .from(corridorRoot, { opacity: 0, duration: 0.3 }, "-=0.1")
            .from(
              matchLineRef.current,
              { opacity: 0, duration: 0.25 },
              "-=0.05",
            )
            .from(resultRef.current, { opacity: 0, duration: 0.3 }, "-=0.05");

          return;
        }

        tl.from(overlineRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.5,
        });

        tl.from(
          headingWordsRef.current,
          {
            y: 50,
            opacity: 0,
            rotateX: 35,
            transformOrigin: "center bottom",
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.07,
          },
          "-=0.2",
        );

        tl.from(
          leftCardRef.current,
          {
            x: isMobile ? 0 : -80,
            y: isMobile ? 40 : 0,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.2",
        );

        tl.from(
          rightCardRef.current,
          {
            x: isMobile ? 0 : 80,
            y: isMobile ? 40 : 0,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.5",
        );

        tl.from(corridorRoot, { opacity: 0, duration: 0.3 }, "-=0.3");

        tl.to(corridorPath, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: "power2.inOut",
        });

        tl.to(
          nodeLeft,
          { attr: { r: 8 }, duration: 0.3, ease: "power2.out" },
          "-=0.8",
        ).to(nodeLeft, {
          attr: { r: 6 },
          duration: 0.2,
        });

        tl.to(
          nodeRight,
          { attr: { r: 8 }, duration: 0.3, ease: "power2.out" },
          "-=0.6",
        ).to(nodeRight, {
          attr: { r: 6 },
          duration: 0.2,
        });

        tl.to(
          travelingDot,
          isMobile
            ? { attr: { cy: 196 }, duration: 1, ease: "power1.inOut" }
            : { attr: { cx: 560 }, duration: 1, ease: "power1.inOut" },
          "-=1",
        );

        tl.to(
          [badge, badgeText],
          { opacity: 1, duration: 0.3, ease: "power2.out" },
          "-=0.4",
        );

        tl.from(
          matchLineRef.current,
          {
            opacity: 0,
            scale: 0.95,
            duration: 0.4,
            ease: "back.out(2)",
          },
          "-=0.1",
        );

        tl.to(
          [leftCardRef.current, rightCardRef.current],
          {
            borderColor: "rgba(0,148,172,0.3)",
            boxShadow: "0 0 30px rgba(0,148,172,0.1)",
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.3",
        ).to([leftCardRef.current, rightCardRef.current], {
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "0 0 0px rgba(0,0,0,0)",
          duration: 0.6,
        });

        tl.from(
          resultRef.current,
          {
            y: 40,
            opacity: 0,
            scale: 0.97,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.4",
        );
      };

      mm.add("(max-width: 767px)", () => {
        buildTimeline(true);
      });

      mm.add("(min-width: 768px)", () => {
        buildTimeline(false);
      });

      const handleResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        mm.revert();
      };
    },
    { scope: sectionRef },
  );

  const [leftPerson, rightPerson] = caseStudy.persons;

  return (
    <section
      ref={sectionRef}
      id="case-study"
      className="case-study-section relative overflow-hidden bg-[#0a0a0a] py-24 text-white md:py-32"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[320px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-teal/10 blur-[120px]" />
        <div className="absolute inset-x-10 top-20 h-px bg-white/[0.04]" />
        <div className="absolute inset-x-10 bottom-20 h-px bg-white/[0.04]" />
      </div>

      <Container className="relative z-10">
        <div className="mx-auto max-w-5xl text-center">
          <span
            ref={overlineRef}
            className="mb-5 block text-xs font-bold uppercase tracking-[0.25em] text-brand-teal"
          >
            {caseStudy.overline}
          </span>

          <h2 className="mb-4 text-4xl font-light tracking-tighter text-white md:text-5xl lg:text-6xl">
            {renderWords(caseStudy.headingMain, "text-white")}
          </h2>

          <p
            className="mb-14 text-3xl italic tracking-tight text-white/30 md:mb-16 md:text-4xl"
            data-heading-accent
          >
            {renderWords(caseStudy.headingAccent, "text-white/30 italic")}
          </p>
        </div>

        <div className="mb-5 flex flex-col gap-8 md:mb-4 md:flex-row md:justify-between md:gap-10">
          <PersonCard person={leftPerson} side="left" cardRef={leftCardRef} />

          <div ref={corridorMobileRef} className="md:hidden">
            <CorridorMap mobile />
          </div>

          <PersonCard
            person={rightPerson}
            side="right"
            cardRef={rightCardRef}
          />
        </div>

        <div ref={corridorDesktopRef} className="hidden md:block">
          <CorridorMap />
        </div>

        <div
          ref={matchLineRef}
          className="mx-auto mt-4 flex w-fit items-center gap-3 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-5 py-3"
        >
          <Zap className="h-4 w-4 text-brand-teal" />
          <span className="text-sm font-medium text-brand-teal">
            {caseStudy.matchLine}
          </span>
        </div>

        <div
          ref={resultRef}
          className="mx-auto mt-8 max-w-xl rounded-2xl border border-brand-teal/20 bg-brand-teal/10 p-5 text-center md:p-6"
        >
          <div className="mb-2 flex items-center justify-center gap-2 text-brand-teal">
            <Check className="h-4 w-4" />
            <p className="text-sm font-bold uppercase tracking-[0.2em]">
              {caseStudy.resultTitle}
            </p>
          </div>
          <p className="text-xs italic text-white/45">
            {caseStudy.resultSubtitle}
          </p>
        </div>
      </Container>
    </section>
  );
}
