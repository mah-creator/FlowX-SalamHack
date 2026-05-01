import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { solutionSteps, type SolutionStep } from "../../data/constants";
import { Container } from "../ui";

gsap.registerPlugin(ScrollTrigger);

type StepVisualProps = {
  step: string;
  type: SolutionStep["visual"];
};

function StepVisual({ step, type }: StepVisualProps) {
  const labelMap: Record<SolutionStep["visual"], string> = {
    request: "Request",
    matching: "Matching",
    payments: "Payments",
    completion: "Completion",
  };

  return (
    <div className="relative w-full h-full min-h-[260px] md:min-h-[360px] flex items-center justify-center">
      <div
        className="absolute inset-x-8 inset-y-6 rounded-[2rem]"
        style={{
          background:
            "radial-gradient(80% 80% at 30% 20%, rgba(0,148,172,0.15) 0%, rgba(0,148,172,0.02) 65%, rgba(255,255,255,0.7) 100%)",
        }}
      />
      <span
        className="relative z-10 font-black leading-none text-brand-blue/[0.08] select-none"
        style={{ fontSize: "clamp(8rem, 18vw, 14rem)" }}
      >
        {step}
      </span>
      <span className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-[0.25em] uppercase text-brand-teal/80 font-semibold">
        {labelMap[type]}
      </span>
    </div>
  );
}

export function SolutionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const stepPanelsRef = useRef<HTMLDivElement[]>([]);
  const dotRefs = useRef<HTMLDivElement[]>([]);
  const labelRefs = useRef<HTMLSpanElement[]>([]);
  const mobileCardRefs = useRef<HTMLDivElement[]>([]);

  stepPanelsRef.current = [];
  dotRefs.current = [];
  labelRefs.current = [];
  mobileCardRefs.current = [];

  const setStepPanelRef = (el: HTMLDivElement | null, index: number) => {
    if (el) stepPanelsRef.current[index] = el;
  };

  const setDotRef = (el: HTMLDivElement | null, index: number) => {
    if (el) dotRefs.current[index] = el;
  };

  const setLabelRef = (el: HTMLSpanElement | null, index: number) => {
    if (el) labelRefs.current[index] = el;
  };

  const setMobileCardRef = (el: HTMLDivElement | null, index: number) => {
    if (el) mobileCardRefs.current[index] = el;
  };

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const steps = stepPanelsRef.current.filter(Boolean);
        const dots = dotRefs.current.filter(Boolean);
        const labels = labelRefs.current.filter(Boolean);
        const progressFill = progressFillRef.current;
        const heading = headingRef.current;

        if (
          steps.length !== solutionSteps.length ||
          dots.length !== solutionSteps.length ||
          !progressFill
        ) {
          return;
        }

        gsap.set(steps, { autoAlpha: 0, y: 32, visibility: "hidden" });
        gsap.set(steps[0], { autoAlpha: 1, y: 0, visibility: "visible" });
        gsap.set(dots, {
          width: 8,
          height: 8,
          backgroundColor: "#d4d4d8",
          scale: 1,
          boxShadow: "0 0 0 0 rgba(0,148,172,0)",
        });
        gsap.set(dots[0], {
          width: 12,
          height: 12,
          backgroundColor: "#0094ac",
          boxShadow: "0 0 0 8px rgba(0,148,172,0.2)",
        });
        gsap.set(labels, { color: "rgba(24, 54, 90, 0.35)", fontWeight: 500 });
        gsap.set(labels[0], { color: "#0094ac", fontWeight: 700 });
        gsap.set(progressFill, { height: "0%" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * solutionSteps.length}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            pinSpacing: true,
            invalidateOnRefresh: true,
          },
        });

        if (heading) {
          tl.fromTo(
            heading,
            { y: 0 },
            { y: 40, duration: 0.4, ease: "power2.out" },
            0,
          );
        }

        for (let i = 0; i < steps.length - 1; i += 1) {
          const currentStep = steps[i];
          const nextStep = steps[i + 1];
          const fillPercent = ((i + 1) / (steps.length - 1)) * 100;

          const currentOverline = currentStep.querySelector("[data-overline]");
          const currentTitle = currentStep.querySelector("[data-title]");
          const currentDesc = currentStep.querySelector("[data-desc]");
          const currentVisual = currentStep.querySelector("[data-visual]");

          tl.to(currentDesc, {
            opacity: 0,
            y: -18,
            duration: 0.15,
            ease: "power2.in",
          })
            .to(
              currentTitle,
              { opacity: 0, y: -14, duration: 0.12, ease: "power2.in" },
              "-=0.08",
            )
            .to(
              currentOverline,
              { opacity: 0, duration: 0.1, ease: "power2.in" },
              "-=0.06",
            )
            .to(
              currentVisual,
              { opacity: 0, scale: 0.96, duration: 0.2, ease: "power2.in" },
              "-=0.1",
            )
            .set(currentStep, { autoAlpha: 0, y: -24, visibility: "hidden" })
            .set(nextStep, { autoAlpha: 1, y: 0, visibility: "visible" }, "<")
            .from(
              nextStep.querySelector("[data-overline]"),
              { opacity: 0, y: 10, duration: 0.12, ease: "power2.out" },
              "<",
            )
            .from(
              nextStep.querySelector("[data-title]"),
              { opacity: 0, y: 20, duration: 0.15, ease: "power2.out" },
              "-=0.06",
            )
            .from(
              nextStep.querySelector("[data-desc]"),
              { opacity: 0, y: 14, duration: 0.15, ease: "power2.out" },
              "-=0.08",
            )
            .from(
              nextStep.querySelector("[data-visual]"),
              { opacity: 0, scale: 0.96, duration: 0.2, ease: "power2.out" },
              "-=0.12",
            )
            .from(
              nextStep.querySelector("[data-accent]"),
              { width: 0, duration: 0.2, ease: "power2.out" },
              "-=0.16",
            )
            .to(
              dots[i],
              {
                width: 8,
                height: 8,
                scale: 1,
                backgroundColor: "#d4d4d8",
                boxShadow: "0 0 0 0 rgba(0,148,172,0)",
                duration: 0.16,
              },
              "<",
            )
            .to(
              dots[i + 1],
              {
                width: 12,
                height: 12,
                scale: 1.1,
                backgroundColor: "#0094ac",
                boxShadow: "0 0 0 8px rgba(0,148,172,0.2)",
                duration: 0.16,
              },
              "<",
            )
            .to(
              progressFill,
              { height: `${fillPercent}%`, duration: 0.2, ease: "power2.out" },
              "<",
            )
            .to(
              labels[i],
              {
                color: "rgba(24, 54, 90, 0.35)",
                fontWeight: 500,
                duration: 0.16,
              },
              "<",
            )
            .to(
              labels[i + 1],
              { color: "#0094ac", fontWeight: 700, duration: 0.16 },
              "<",
            );
        }
      });

      mm.add("(max-width: 767px)", () => {
        mobileCardRefs.current.forEach((card) => {
          gsap.from(card, {
            opacity: 0,
            y: 40,
            duration: 0.65,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          });
        });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="solution"
      className="relative bg-[#FAFAFA] overflow-hidden py-20 md:py-0"
    >
      <Container className="md:hidden">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-teal font-semibold mb-3">
            The Solution
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-brand-blue">
            A Smarter Way to Move Money
          </h2>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          {solutionSteps.map((step) => (
            <span
              key={`mobile-dot-${step.step}`}
              className="w-2 h-2 rounded-full bg-zinc-300"
            />
          ))}
        </div>

        <div className="space-y-6">
          {solutionSteps.map((step, i) => (
            <div
              key={`mobile-step-${step.step}`}
              ref={(el) => setMobileCardRef(el, i)}
              className="rounded-[1.5rem] border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <div className="mb-4" data-visual>
                <StepVisual step={step.step} type={step.visual} />
              </div>
              <span className="text-brand-teal text-xs font-semibold tracking-[0.2em] uppercase">
                Step {step.step}
              </span>
              <h3 className="text-2xl font-bold text-brand-blue tracking-tight mt-2 mb-4">
                {step.title}
              </h3>
              <p className="text-brand-blue/65 text-base leading-relaxed font-light">
                {step.longDesc}
              </p>
            </div>
          ))}
        </div>
      </Container>

      <div className="relative hidden md:block h-screen">
        <div className="absolute inset-0">
          <div
            className="absolute top-10 left-1/2 -translate-x-1/2 text-center"
            ref={headingRef}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-brand-teal font-semibold mb-3">
              The Solution
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-brand-blue">
              A Smarter Way to Move Money
            </h2>
            <div className="mt-5 mx-auto h-[2px] w-20 bg-brand-teal" />
          </div>

          <div className="absolute left-8 lg:left-12 top-1/2 -translate-y-1/2 h-[240px] flex items-stretch">
            <div className="relative h-full w-8 flex flex-col justify-between items-center">
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-zinc-200" />
              <div
                ref={progressFillRef}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] bg-brand-teal origin-top"
              />
              {solutionSteps.map((step, i) => (
                <div
                  key={`desktop-dot-${step.step}`}
                  ref={(el) => setDotRef(el, i)}
                  className="relative z-10 rounded-full bg-zinc-200"
                />
              ))}
            </div>
          </div>

          {solutionSteps.map((step, i) => (
            <div
              key={`desktop-step-${step.step}`}
              ref={(el) => setStepPanelRef(el, i)}
              className="absolute inset-0 px-20 lg:px-28 pt-32 pb-24 flex items-center"
              style={{ visibility: i === 0 ? "visible" : "hidden" }}
            >
              <div className="w-[45%] lg:w-[40%] pr-10 lg:pr-14">
                <span
                  data-overline
                  className="text-brand-teal text-xs font-semibold tracking-[0.2em] uppercase mb-4 inline-block"
                >
                  Step {step.step}
                </span>
                <h3
                  data-title
                  className="text-4xl lg:text-5xl font-bold text-brand-blue tracking-tight mb-6"
                >
                  {step.title}
                </h3>
                <div data-accent className="w-12 h-[2px] bg-brand-teal mb-6" />
                <p
                  data-desc
                  className="text-base lg:text-lg text-brand-blue/60 font-light leading-relaxed max-w-[42ch]"
                >
                  {step.longDesc}
                </p>
              </div>

              <div
                data-visual
                className="w-[50%] lg:w-[55%] ml-auto h-[72%] rounded-[2rem] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-zinc-100"
              >
                <StepVisual step={step.step} type={step.visual} />
              </div>
            </div>
          ))}

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full border border-zinc-200 bg-white/65 backdrop-blur-sm flex items-center gap-3 lg:gap-8">
            {solutionSteps.map((step, i) => (
              <span
                key={`desktop-label-${step.step}`}
                ref={(el) => setLabelRef(el, i)}
                className="text-[0.625rem] lg:text-xs uppercase tracking-[0.18em] text-brand-blue/35 transition-colors"
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
