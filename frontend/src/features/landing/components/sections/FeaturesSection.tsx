import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { features, type Feature } from "../../data/constants";
import { Container } from "../ui";

gsap.registerPlugin(ScrollTrigger);

type FeatureIconType = Feature["icon"];

type FeatureIconProps = {
  type: FeatureIconType;
  size?: number;
  className?: string;
};

function FeatureIcon({ type, size = 24, className = "" }: FeatureIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (type) {
    case "matching":
      return (
        <svg {...common}>
          <path d="M8 8h3a2 2 0 0 1 2 2v3" />
          <path d="M16 16h-3a2 2 0 0 1-2-2v-3" />
          <path d="M6.5 11.5 4 14l2.5 2.5L9 14" />
          <path d="M17.5 12.5 20 10l-2.5-2.5L15 10" />
        </svg>
      );
    case "escrow":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6.2V11c0 5 3.2 8.1 7.5 10 4.3-1.9 7.5-5 7.5-10V6.2L12 3Z" />
          <rect x="9" y="11" width="6" height="5" rx="1" />
          <path d="M10.5 11V9.8a1.5 1.5 0 1 1 3 0V11" />
        </svg>
      );
    case "tracking":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "currency":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="7" rx="6" ry="2.5" />
          <path d="M6 7v6c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V7" />
          <path d="M6 10c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5" />
        </svg>
      );
    case "dispute":
      return (
        <svg {...common}>
          <path d="M12 5v12" />
          <path d="M7.5 8.5h9" />
          <path d="m7.5 8.5-2.5 4h5l-2.5-4Z" />
          <path d="m16.5 8.5-2.5 4h5l-2.5-4Z" />
          <path d="M8.5 19h7" />
        </svg>
      );
    case "scores":
      return (
        <svg {...common}>
          <path d="m12 3 2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 3Z" />
          <path d="m9.2 12.3 1.8 1.8 3.8-3.8" />
        </svg>
      );
  }
}

type FeatureVisualProps = {
  type: FeatureIconType;
};

function FeatureVisual({ type }: FeatureVisualProps) {
  const placeholders: Record<FeatureIconType, string> = {
    matching:
      "https://placehold.co/1200x520/eaf7fb/1a2e4c?text=Smart+Matching+Preview",
    escrow:
      "https://placehold.co/1200x520/eaf7fb/1a2e4c?text=Escrow+Security+Preview",
    tracking:
      "https://placehold.co/1200x520/eaf7fb/1a2e4c?text=Real-Time+Tracking+Preview",
    currency:
      "https://placehold.co/1200x520/eaf7fb/1a2e4c?text=Multi-Currency+Preview",
    dispute:
      "https://placehold.co/1200x520/eaf7fb/1a2e4c?text=Dispute+Resolution+Preview",
    scores:
      "https://placehold.co/1200x520/eaf7fb/1a2e4c?text=Verification+Scores+Preview",
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl bg-zinc-100">
      <img
        src={placeholders[type]}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<HTMLButtonElement[]>([]);
  const timerRef = useRef<gsap.core.Tween | null>(null);
  const switchTimelineRef = useRef<gsap.core.Timeline | null>(null);

  thumbnailRefs.current = [];

  const setThumbnailRef = (el: HTMLButtonElement | null, index: number) => {
    if (el) thumbnailRefs.current[index] = el;
  };

  const restartTimer = () => {
    timerRef.current?.kill();
    if (!progressBarRef.current) return;

    gsap.set(progressBarRef.current, { width: "0%" });
    timerRef.current = gsap.to(progressBarRef.current, {
      width: "100%",
      duration: 3,
      ease: "none",
      onComplete: () => {
        setActiveIndex((prev) => (prev + 1) % features.length);
      },
    });
  };

  const pauseTimer = () => timerRef.current?.pause();
  const resumeTimer = () => timerRef.current?.resume();

  const switchFeature = (newIndex: number) => {
    if (newIndex === activeIndex || !spotlightRef.current) return;

    const content = spotlightRef.current;
    const icon = content.querySelector("[data-icon]");
    const title = content.querySelector("[data-title]");
    const desc = content.querySelector("[data-desc]");
    const visual = content.querySelector("[data-visual]");

    switchTimelineRef.current?.kill();
    gsap.killTweensOf([icon, title, desc, visual]);
    gsap.set([icon, title, desc, visual], { opacity: 1, y: 0, scale: 1 });

    switchTimelineRef.current = gsap
      .timeline({
        onComplete: () => {
          setActiveIndex(newIndex);
        },
      })
      .to(visual, { opacity: 0, scale: 0.95, duration: 0.2, ease: "power2.in" })
      .to(desc, { opacity: 0, y: -10, duration: 0.15 }, "-=0.1")
      .to(title, { opacity: 0, y: -10, duration: 0.12 }, "-=0.08")
      .to(icon, { opacity: 0, scale: 0.8, duration: 0.1 }, "-=0.06");
  };

  useEffect(() => {
    restartTimer();

    if (!spotlightRef.current) return;

    const content = spotlightRef.current;
    const icon = content.querySelector("[data-icon]");
    const title = content.querySelector("[data-title]");
    const desc = content.querySelector("[data-desc]");
    const visual = content.querySelector("[data-visual]");

    gsap.killTweensOf([icon, title, desc, visual]);
    gsap.set([icon, title, desc, visual], { clearProps: "opacity,transform" });

    gsap
      .timeline()
      .fromTo(
        icon,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.15, ease: "back.out(2)" },
      )
      .fromTo(
        title,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" },
        "-=0.05",
      )
      .fromTo(
        desc,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" },
        "-=0.1",
      )
      .fromTo(
        visual,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
        "-=0.15",
      );

    return () => {
      timerRef.current?.kill();
      switchTimelineRef.current?.kill();
    };
  }, [activeIndex]);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            toggleActions: "play none none none",
          },
        })
        .from(headingRef.current, {
          y: 50,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
        })
        .from(
          spotlightRef.current,
          {
            y: 60,
            opacity: 0,
            scale: 0.97,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.4",
        )
        .from(
          thumbnailRefs.current.filter(Boolean),
          {
            y: 18,
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.08,
            immediateRender: false,
            clearProps: "transform,opacity",
          },
          "-=0.5",
        );
    },
    { scope: sectionRef },
  );

  const activeFeature = features[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative overflow-hidden bg-[#F5F5F7] py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-24 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-teal/10 blur-[120px]" />
      </div>

      <Container className="relative">
        <div ref={headingRef} className="mb-12 text-center lg:mb-16">
          <h2 className="text-4xl font-light tracking-tight text-brand-blue lg:text-5xl">
            Everything You Need for Safe Transfers
          </h2>
        </div>

        <div className="mb-6 flex flex-wrap gap-3 pb-2 md:hidden">
          {features.map((feature, i) => (
            <button
              key={`mobile-pill-${feature.title}`}
              type="button"
              onClick={() => switchFeature(i)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                i === activeIndex
                  ? "border-brand-teal bg-white text-brand-blue ring-2 ring-brand-teal/20"
                  : "border-black/[0.08] bg-white/60 text-brand-blue/60"
              }`}
            >
              {feature.title}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-6 md:grid md:grid-cols-12 md:items-stretch md:gap-8">
          <div
            ref={spotlightRef}
            onMouseEnter={pauseTimer}
            onMouseLeave={resumeTimer}
            className="relative min-w-0 w-full rounded-3xl border border-black/[0.06] bg-white p-7 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] md:col-span-6 md:h-full md:p-9 lg:col-span-7 lg:p-12"
          >
            <div
              data-icon
              className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal"
            >
              <FeatureIcon type={activeFeature.icon} />
            </div>

            <h3
              data-title
              className="mb-4 text-2xl font-bold tracking-tight text-brand-blue lg:text-3xl"
            >
              {activeFeature.title}
            </h3>

            <p
              data-desc
              className="mb-8 max-w-[50ch] text-base font-light leading-relaxed text-brand-blue/60 lg:text-lg"
            >
              {activeFeature.longDesc}
            </p>

            <div data-visual className="h-44 w-full rounded-2xl md:h-52">
              <FeatureVisual type={activeFeature.icon} />
            </div>

            <div className="absolute bottom-0 left-6 right-6 h-[2px] overflow-hidden rounded-full bg-zinc-100 md:left-8 md:right-8">
              <div
                ref={progressBarRef}
                className="h-full rounded-full bg-brand-teal"
                style={{ width: 0 }}
              />
            </div>
          </div>

          <div className="flex min-w-0 w-full flex-col gap-3 max-md:hidden md:col-span-6 md:h-full lg:col-span-5">
            {features.map((feature, i) => (
              <button
                key={`thumb-${feature.title}`}
                ref={(el) => setThumbnailRef(el, i)}
                type="button"
                onClick={() => switchFeature(i)}
                className={`flex min-h-0 w-full flex-1 flex-col rounded-xl border p-4 text-left transition-all duration-300 ${
                  i === activeIndex
                    ? "border-brand-teal bg-white ring-2 ring-brand-teal/20 shadow-sm"
                    : "border-black/[0.04] bg-white/60 backdrop-blur-sm hover:border-black/[0.08] hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      i === activeIndex
                        ? "bg-brand-teal text-white"
                        : "bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    <FeatureIcon type={feature.icon} size={16} />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      i === activeIndex
                        ? "text-brand-blue"
                        : "text-brand-blue/70"
                    }`}
                  >
                    {feature.title}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-brand-blue/65">
                  {feature.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
