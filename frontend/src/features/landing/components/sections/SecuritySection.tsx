import { useRef, type MouseEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { securityPillars, type SecurityPillar } from "../../data/constants";
import { Container } from "../ui";

gsap.registerPlugin(ScrollTrigger);

function SecurityIcon({ type }: { type: SecurityPillar["icon"] }) {
  const paths: Record<SecurityPillar["icon"], string> = {
    identity:
      "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m10-10a4 4 0 1 0-8 0 4 4 0 0 0 8 0m2 6 2 2 4-4",
    escrow: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10",
    admin:
      "M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12m10.5-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
    fraud: "M13 16h-1v-4h-1m1-4h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20",
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5 text-brand-teal"
      data-icon-svg
    >
      <path d={paths[type]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldCore() {
  return (
    <div
      className="relative mx-auto h-48 w-48 md:h-64 md:w-64 lg:h-80 lg:w-80"
      data-shield-core
    >
      <svg viewBox="0 0 320 320" className="h-full w-full" fill="none">
        <circle
          cx="160"
          cy="160"
          r="150"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
          data-ring-3
        />
        <circle
          cx="160"
          cy="160"
          r="110"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          data-ring-2
        />
        <circle
          cx="160"
          cy="160"
          r="70"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          data-ring-1
        />

        <path
          d="M160 50 L220 85 L220 160 C220 210 160 260 160 260 C160 260 100 210 100 160 L100 85 Z"
          stroke="#0094ac"
          strokeWidth="2"
          fill="rgba(0,148,172,0.05)"
          strokeLinecap="round"
          strokeLinejoin="round"
          data-shield-outline
          strokeDasharray="500"
          strokeDashoffset="500"
        />

        <path
          d="M140 160 L155 175 L185 140"
          stroke="#0094ac"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          data-shield-check
          strokeDasharray="80"
          strokeDashoffset="80"
        />

        <circle
          cx="160"
          cy="160"
          r="40"
          fill="rgba(0,148,172,0.08)"
          data-shield-glow
          opacity="0"
        />
      </svg>
    </div>
  );
}

type PillarCardProps = {
  pillar: SecurityPillar;
  enableTilt: boolean;
};

function PillarCard({ pillar, enableTilt }: PillarCardProps) {
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (
      !enableTilt ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(card, {
      rotateX: y * -6,
      rotateY: x * 6,
      transformPerspective: 800,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    if (
      !enableTilt ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <div
      className={[
        "group relative cursor-default rounded-2xl border border-white/[0.08] p-5 md:p-6",
        "bg-white/[0.03] backdrop-blur-sm transition-colors duration-500",
        "hover:border-brand-teal/30 hover:bg-white/[0.06]",
      ].join(" ")}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-pillar-card
      style={{ willChange: "transform, opacity" }}
    >
      <div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10"
        data-pillar-icon
      >
        <SecurityIcon type={pillar.icon} />
      </div>

      <h4
        className="mb-2 text-sm font-semibold tracking-tight text-white"
        data-pillar-title
      >
        {pillar.t}
      </h4>

      <p
        className="text-xs font-light leading-relaxed text-white/50"
        data-pillar-desc
      >
        {pillar.longDesc}
      </p>

      <div
        className="pointer-events-none absolute right-0 top-0 h-20 w-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(0,148,172,0.1), transparent 70%)",
        }}
      />
    </div>
  );
}

const particlePositions = [
  { top: "14%", left: "11%" },
  { top: "18%", left: "81%" },
  { top: "27%", left: "23%" },
  { top: "31%", left: "74%" },
  { top: "41%", left: "9%" },
  { top: "45%", left: "90%" },
  { top: "56%", left: "19%" },
  { top: "59%", left: "78%" },
  { top: "67%", left: "31%" },
  { top: "71%", left: "63%" },
  { top: "81%", left: "14%" },
  { top: "84%", left: "86%" },
];

export function SecuritySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const overlineRef = useRef<HTMLSpanElement>(null);
  const headingWordsRef = useRef<HTMLSpanElement[]>([]);
  const desktopShieldRef = useRef<HTMLDivElement>(null);
  const mobileShieldRef = useRef<HTMLDivElement>(null);
  const desktopPillarRefs = useRef<HTMLDivElement[]>([]);
  const mobilePillarRefs = useRef<HTMLDivElement[]>([]);
  const particleRefs = useRef<HTMLSpanElement[]>([]);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const taglineLineRef = useRef<HTMLDivElement>(null);

  headingWordsRef.current = [];
  desktopPillarRefs.current = [];
  mobilePillarRefs.current = [];
  particleRefs.current = [];

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

  const setDesktopPillarRef = (el: HTMLDivElement | null, index: number) => {
    if (el) desktopPillarRefs.current[index] = el;
  };

  const setMobilePillarRef = (el: HTMLDivElement | null, index: number) => {
    if (el) mobilePillarRefs.current[index] = el;
  };

  const setParticleRef = (el: HTMLSpanElement | null, index: number) => {
    if (el) particleRefs.current[index] = el;
  };

  const canHoverTilt =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const pillarsByPosition = securityPillars.reduce<
    Record<SecurityPillar["position"], SecurityPillar | null>
  >(
    (acc, pillar) => {
      acc[pillar.position] = pillar;
      return acc;
    },
    { top: null, right: null, bottom: null, left: null },
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const mm = gsap.matchMedia();
      const longTweens: gsap.core.Tween[] = [];

      const buildTimeline = (isDesktop: boolean) => {
        const shieldRoot = isDesktop
          ? desktopShieldRef.current
          : mobileShieldRef.current;
        const pillarRoots = (
          isDesktop ? desktopPillarRefs.current : mobilePillarRefs.current
        ).filter(Boolean);

        if (!shieldRoot || pillarRoots.length === 0) return;

        const rings = shieldRoot.querySelectorAll<SVGCircleElement>(
          "[data-ring-1], [data-ring-2], [data-ring-3]",
        );
        const ringTwo =
          shieldRoot.querySelector<SVGCircleElement>("[data-ring-2]");
        const ringThree =
          shieldRoot.querySelector<SVGCircleElement>("[data-ring-3]");
        const shieldOutline = shieldRoot.querySelector<SVGPathElement>(
          "[data-shield-outline]",
        );
        const shieldCheck = shieldRoot.querySelector<SVGPathElement>(
          "[data-shield-check]",
        );
        const shieldGlow =
          shieldRoot.querySelector<SVGCircleElement>("[data-shield-glow]");
        const connectionLines = isDesktop
          ? section.querySelectorAll<SVGLineElement>("[data-conn-active]")
          : ([] as unknown as NodeListOf<SVGLineElement>);
        const connectionPulse = isDesktop
          ? section.querySelectorAll<SVGCircleElement>("[data-conn-pulse]")
          : ([] as unknown as NodeListOf<SVGCircleElement>);

        gsap.set(shieldOutline, { strokeDashoffset: 500 });
        gsap.set(shieldCheck, { strokeDashoffset: 80 });
        gsap.set(shieldGlow, { opacity: 0 });
        gsap.set(connectionLines, { strokeDashoffset: 160 });

        const transformTargets = [
          overlineRef.current,
          ...headingWordsRef.current,
          ...pillarRoots,
          shieldRoot,
          taglineRef.current,
          taglineLineRef.current,
        ].filter(Boolean);

        gsap.set(transformTargets, { willChange: "transform, opacity" });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
          onComplete: () => {
            gsap.set(transformTargets, { willChange: "auto" });
          },
        });

        if (reduceMotion) {
          tl.from(overlineRef.current, { opacity: 0, duration: 0.25 })
            .from(
              headingWordsRef.current,
              { opacity: 0, duration: 0.25, stagger: 0.05 },
              "-=0.08",
            )
            .from(shieldRoot, { opacity: 0, duration: 0.3 }, "-=0.08")
            .from(
              pillarRoots,
              { opacity: 0, duration: 0.25, stagger: 0.08 },
              "-=0.08",
            )
            .from(taglineRef.current, { opacity: 0, duration: 0.25 }, "-=0.08");

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
          rings,
          {
            scale: 0,
            opacity: 0,
            transformOrigin: "center center",
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.15,
          },
          "-=0.3",
        );

        tl.to(
          shieldOutline,
          {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: "power2.inOut",
          },
          "-=0.5",
        );

        tl.to(
          shieldGlow,
          {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.6",
        );

        tl.to(
          shieldCheck,
          {
            strokeDashoffset: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.2",
        );

        if (isDesktop) {
          tl.to(
            connectionLines,
            {
              strokeDashoffset: 0,
              duration: 0.8,
              ease: "power2.out",
              stagger: 0.08,
            },
            "-=0.2",
          ).from(
            connectionPulse,
            {
              scale: 0,
              opacity: 0,
              duration: 0.3,
              ease: "back.out(2)",
              stagger: 0.06,
            },
            "-=0.5",
          );
        }

        tl.from(
          pillarRoots,
          {
            scale: 0.9,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.1,
          },
          "-=0.25",
        );

        pillarRoots.forEach((card) => {
          const icon = card.querySelector("[data-pillar-icon]");
          const title = card.querySelector("[data-pillar-title]");
          const desc = card.querySelector("[data-pillar-desc]");

          tl.from(
            icon,
            { scale: 0, opacity: 0, duration: 0.3, ease: "back.out(2)" },
            "-=0.35",
          )
            .from(
              title,
              { y: 10, opacity: 0, duration: 0.3, ease: "power2.out" },
              "-=0.2",
            )
            .from(
              desc,
              { y: 8, opacity: 0, duration: 0.3, ease: "power2.out" },
              "-=0.2",
            );
        });

        tl.fromTo(
          taglineLineRef.current,
          { width: 0, opacity: 0 },
          { width: 110, opacity: 1, duration: 0.4, ease: "power2.out" },
          "-=0.2",
        );

        tl.from(
          taglineRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.2",
        );

        if (ringThree) {
          longTweens.push(
            gsap.to(ringThree, {
              rotation: 360,
              duration: 120,
              ease: "none",
              repeat: -1,
              svgOrigin: "160 160",
            }),
          );
        }

        if (ringTwo) {
          longTweens.push(
            gsap.to(ringTwo, {
              rotation: -360,
              duration: 90,
              ease: "none",
              repeat: -1,
              svgOrigin: "160 160",
            }),
          );
        }
      };

      mm.add("(min-width: 1024px)", () => {
        buildTimeline(true);
      });

      mm.add("(max-width: 1023px)", () => {
        buildTimeline(false);
      });

      const particles = particleRefs.current.filter(Boolean);

      if (reduceMotion) {
        gsap.set(particles, { opacity: 0.25 });
      } else {
        gsap.fromTo(
          particles,
          { opacity: 0 },
          { opacity: 0.5, duration: 0.8, stagger: 0.04, ease: "power1.out" },
        );

        particles.forEach((dot, i) => {
          longTweens.push(
            gsap.to(dot, {
              x: i % 2 === 0 ? 8 : -8,
              y: i % 3 === 0 ? -10 : 10,
              duration: 6 + (i % 5),
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            }),
          );
        });
      }

      const onResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        longTweens.forEach((tween) => tween.kill());
        mm.revert();
      };
    },
    { scope: sectionRef },
  );

  const topPillar = pillarsByPosition.top;
  const rightPillar = pillarsByPosition.right;
  const leftPillar = pillarsByPosition.left;
  const bottomPillar = pillarsByPosition.bottom;

  return (
    <section
      ref={sectionRef}
      id="security"
      className="security-section relative overflow-hidden bg-[#0a0a0a] py-24 text-white md:py-32"
    >
      <div className="pointer-events-none absolute inset-0">
        {particlePositions.map((pos, i) => (
          <span
            key={`particle-${pos.top}-${pos.left}`}
            ref={(el) => setParticleRef(el, i)}
            className="absolute h-1 w-1 rounded-full bg-white/45"
            style={{ top: pos.top, left: pos.left, opacity: 0 }}
          />
        ))}

        <div
          className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(circle, rgba(0,148,172,0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      <Container className="relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <span
            ref={overlineRef}
            className="mb-5 block text-xs font-bold uppercase tracking-[0.25em] text-brand-teal"
          >
            Security
          </span>

          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            {renderWords("Built on Trust", "text-white")}
          </h2>

          <p
            className="mt-2 text-3xl font-light tracking-tight text-white/30 md:text-4xl"
            data-heading-accent
          >
            {renderWords("& Verification", "text-white/30")}
          </p>
        </div>

        <div
          className="relative mt-14 hidden h-[42rem] max-w-5xl mx-auto lg:block"
          data-diamond
        >
          <svg
            viewBox="0 0 100 100"
            className="pointer-events-none absolute inset-0 h-full w-full"
            fill="none"
            aria-hidden="true"
          >
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="18"
              stroke="rgba(0,148,172,0.18)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
            <line
              x1="50"
              y1="50"
              x2="82"
              y2="50"
              stroke="rgba(0,148,172,0.18)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
            <line
              x1="50"
              y1="50"
              x2="18"
              y2="50"
              stroke="rgba(0,148,172,0.18)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="82"
              stroke="rgba(0,148,172,0.18)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />

            <line
              x1="50"
              y1="50"
              x2="50"
              y2="18"
              stroke="rgba(0,148,172,0.42)"
              strokeWidth="0.7"
              data-conn-active
              strokeDasharray="160"
              strokeDashoffset="160"
            />
            <line
              x1="50"
              y1="50"
              x2="82"
              y2="50"
              stroke="rgba(0,148,172,0.42)"
              strokeWidth="0.7"
              data-conn-active
              strokeDasharray="160"
              strokeDashoffset="160"
            />
            <line
              x1="50"
              y1="50"
              x2="18"
              y2="50"
              stroke="rgba(0,148,172,0.42)"
              strokeWidth="0.7"
              data-conn-active
              strokeDasharray="160"
              strokeDashoffset="160"
            />
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="82"
              stroke="rgba(0,148,172,0.42)"
              strokeWidth="0.7"
              data-conn-active
              strokeDasharray="160"
              strokeDashoffset="160"
            />

            <circle cx="50" cy="18" r="1.15" fill="#0094ac" data-conn-pulse />
            <circle cx="82" cy="50" r="1.15" fill="#0094ac" data-conn-pulse />
            <circle cx="18" cy="50" r="1.15" fill="#0094ac" data-conn-pulse />
            <circle cx="50" cy="82" r="1.15" fill="#0094ac" data-conn-pulse />
          </svg>

          <div
            ref={desktopShieldRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <ShieldCore />
          </div>

          {topPillar && (
            <div
              className="absolute left-1/2 top-0 w-64 -translate-x-1/2"
              ref={(el) => setDesktopPillarRef(el, 0)}
            >
              <PillarCard pillar={topPillar} enableTilt={canHoverTilt} />
            </div>
          )}

          {rightPillar && (
            <div
              className="absolute right-0 top-1/2 w-64 -translate-y-1/2"
              ref={(el) => setDesktopPillarRef(el, 1)}
            >
              <PillarCard pillar={rightPillar} enableTilt={canHoverTilt} />
            </div>
          )}

          {leftPillar && (
            <div
              className="absolute left-0 top-1/2 w-64 -translate-y-1/2"
              ref={(el) => setDesktopPillarRef(el, 2)}
            >
              <PillarCard pillar={leftPillar} enableTilt={canHoverTilt} />
            </div>
          )}

          {bottomPillar && (
            <div
              className="absolute bottom-0 left-1/2 w-64 -translate-x-1/2"
              ref={(el) => setDesktopPillarRef(el, 3)}
            >
              <PillarCard pillar={bottomPillar} enableTilt={canHoverTilt} />
            </div>
          )}
        </div>

        <div className="mt-12 space-y-4 lg:hidden">
          <div ref={mobileShieldRef} className="mb-6 flex justify-center">
            <ShieldCore />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {securityPillars.map((pillar, i) => (
              <div
                key={`mobile-pillar-${pillar.t}`}
                ref={(el) => setMobilePillarRef(el, i)}
              >
                <PillarCard pillar={pillar} enableTilt={false} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center">
          <div
            ref={taglineLineRef}
            className="mb-5 h-px w-[110px] bg-brand-teal/70"
          />
          <p
            ref={taglineRef}
            className="text-center text-sm font-light italic text-white/35"
          >
            Every layer designed to protect your transaction.
          </p>
        </div>
      </Container>
    </section>
  );
}
