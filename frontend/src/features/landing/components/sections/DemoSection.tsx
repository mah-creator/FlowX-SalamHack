import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Clock3, Link2, Wallet } from "lucide-react";
import {
  demoStatuses,
  demoTransaction,
  type DemoStatus,
} from "../../data/constants";

gsap.registerPlugin(ScrollTrigger);

function StepIcon({ type }: { type: DemoStatus["icon"] }) {
  const common = "h-3.5 w-3.5";
  switch (type) {
    case "clock":
      return <Clock3 className={common} />;
    case "link":
      return <Link2 className={common} />;
    case "wallet":
      return <Wallet className={common} />;
    case "check":
      return <Check className={common} />;
  }
}

type StepIndicatorProps = {
  status: DemoStatus;
  index: number;
  isLast: boolean;
};

function StepIndicator({ status, index, isLast }: StepIndicatorProps) {
  return (
    <div className="flex items-start gap-3 md:flex-1" data-step={index}>
      <div className="relative mt-0.5 shrink-0" data-step-dot>
        <div
          className="flex h-3 w-3 items-center justify-center rounded-full bg-white/20"
          data-step-core
        />
        <div
          className="absolute inset-0 rounded-full ring-4 ring-brand-teal/20 opacity-0"
          data-step-ring
        />
      </div>

      <div>
        <span
          className="mb-0.5 block text-xs font-semibold uppercase tracking-wider text-white/30"
          data-step-label
        >
          {status.s}
        </span>
        <span className="block text-[10px] italic text-white/15" data-step-desc>
          {status.d}
        </span>
        <span
          className="mt-1 block text-[10px] font-mono tabular-nums text-white/0"
          data-step-time
        >
          {status.timestamp}
        </span>
      </div>

      {!isLast && (
        <>
          <div
            className="mx-2 mt-[7px] hidden h-px flex-1 bg-white/[0.06] md:block"
            data-connector
          />
          <div
            className="ml-[5px] mt-2 h-5 w-px bg-white/[0.06] md:hidden"
            data-connector-mobile
          />
        </>
      )}

      <div className="ml-auto text-white/20" data-step-icon>
        <StepIcon type={status.icon} />
      </div>
    </div>
  );
}

export function DemoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const overlineRef = useRef<HTMLSpanElement>(null);
  const headingWordsRef = useRef<HTMLSpanElement[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

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
      const steps = Array.from(
        section.querySelectorAll<HTMLElement>("[data-step]"),
      );
      const connectors = Array.from(
        section.querySelectorAll<HTMLElement>(
          "[data-connector], [data-connector-mobile]",
        ),
      );
      const progressFill = progressRef.current;
      const header = section.querySelector("[data-header]");

      const stepNodes = steps.map((step) => ({
        core: step.querySelector<HTMLElement>("[data-step-core]"),
        ring: step.querySelector<HTMLElement>("[data-step-ring]"),
        label: step.querySelector<HTMLElement>("[data-step-label]"),
        desc: step.querySelector<HTMLElement>("[data-step-desc]"),
        time: step.querySelector<HTMLElement>("[data-step-time]"),
        icon: step.querySelector<HTMLElement>("[data-step-icon]"),
      }));

      const setCompleteState = () => {
        gsap.set(progressFill, { width: "100%" });
        stepNodes.forEach((node, i) => {
          gsap.set(node.core, { backgroundColor: "#0094ac", scale: 1 });
          gsap.set(node.label, {
            color: i === stepNodes.length - 1 ? "#0094ac" : "#ffffff",
          });
          gsap.set(node.desc, { color: "rgba(255,255,255,0.4)" });
          gsap.set(node.time, { color: "rgba(255,255,255,0.2)" });
          gsap.set(node.icon, {
            color:
              i === stepNodes.length - 1 ? "#0094ac" : "rgba(255,255,255,0.45)",
          });
        });
        gsap.set(connectors, { backgroundColor: "#0094ac" });
        gsap.set(summaryRef.current, {
          display: "block",
          opacity: 1,
          y: 0,
          scale: 1,
        });
      };

      if (reduceMotion) {
        setCompleteState();
        return;
      }

      gsap.set(progressFill, { width: "0%" });
      gsap.set(summaryRef.current, {
        display: "none",
        opacity: 0,
        y: 15,
        scale: 0.98,
      });

      stepNodes.forEach((node) => {
        gsap.set(node.core, {
          backgroundColor: "rgba(255,255,255,0.2)",
          scale: 1,
        });
        gsap.set(node.ring, { opacity: 0, scale: 1 });
        gsap.set(node.label, { color: "rgba(255,255,255,0.3)" });
        gsap.set(node.desc, { color: "rgba(255,255,255,0.15)" });
        gsap.set(node.time, { color: "rgba(255,255,255,0)" });
        gsap.set(node.icon, { color: "rgba(255,255,255,0.2)" });
      });

      gsap.set(connectors, { backgroundColor: "rgba(255,255,255,0.06)" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(overlineRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
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
        panelRef.current,
        {
          y: 60,
          opacity: 0,
          scale: 0.97,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.3",
      );

      tl.from(
        header,
        {
          y: 15,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.4",
      );

      steps.forEach((_, i) => {
        const node = stepNodes[i];
        const pct = ((i + 1) / steps.length) * 100;

        tl.to(
          progressFill,
          {
            width: `${pct}%`,
            duration: 1,
            ease: "power2.inOut",
          },
          `+=${i === 0 ? 0.3 : 0.5}`,
        );

        tl.to(
          node.core,
          {
            backgroundColor: "#0094ac",
            scale: 1.3,
            duration: 0.3,
            ease: "back.out(2)",
          },
          "-=0.8",
        );

        tl.to(
          node.ring,
          {
            opacity: 1,
            scale: 1.5,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.3",
        );
        tl.to(node.ring, {
          opacity: 0,
          scale: 2,
          duration: 0.6,
          ease: "power2.out",
        });

        tl.to(
          node.label,
          {
            color: i === steps.length - 1 ? "#0094ac" : "#ffffff",
            duration: 0.3,
          },
          "-=1",
        );

        tl.to(
          node.desc,
          {
            color: "rgba(255,255,255,0.4)",
            duration: 0.3,
          },
          "-=0.8",
        );

        tl.to(
          node.time,
          {
            color: "rgba(255,255,255,0.2)",
            duration: 0.3,
          },
          "-=0.6",
        );

        tl.to(
          node.icon,
          {
            color:
              i === steps.length - 1 ? "#0094ac" : "rgba(255,255,255,0.45)",
            duration: 0.3,
          },
          "-=0.7",
        );

        if (i < connectors.length) {
          tl.to(
            connectors[i],
            {
              backgroundColor: "#0094ac",
              duration: 0.4,
              ease: "power2.out",
            },
            "-=0.4",
          );
        }

        if (i > 0) {
          const prevCore = stepNodes[i - 1].core;
          tl.to(prevCore, { scale: 1, duration: 0.2 }, "-=1");
        }
      });

      tl.set(summaryRef.current, { display: "block" });
      tl.to(
        summaryRef.current,
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.5)",
        },
        "+=0.1",
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="bg-[#FAFAFA] py-24 text-brand-blue md:py-32"
    >
      <div className="mx-auto w-full max-w-[1250px] px-6 md:px-12">
        <div className="mb-14 text-center lg:mb-16">
          <span
            ref={overlineRef}
            className="mb-5 block text-xs font-bold uppercase tracking-[0.25em] text-brand-teal"
          >
            Live Demo
          </span>

          <h2 className="mb-3 text-4xl font-bold tracking-tight text-brand-blue md:text-5xl lg:text-6xl">
            {renderWords("Track Every Step", "text-brand-blue")}
          </h2>

          <p className="text-3xl font-light tracking-tight text-brand-blue/40 md:text-4xl">
            {renderWords("in Real Time", "text-brand-blue/40")}
          </p>
        </div>

        <div
          ref={panelRef}
          className="demo-panel relative mx-auto max-w-4xl rounded-3xl border border-white/[0.06] bg-[#111111] p-6 shadow-2xl shadow-black/20 md:p-8 lg:p-10"
          data-panel
        >
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-32 w-[80%] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(0,148,172,0.06), transparent 70%)",
            }}
          />

          <div
            className="mb-8 flex flex-col gap-3 rounded-xl bg-white/[0.04] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            data-header
          >
            <span className="font-mono text-xs text-white/40">
              {demoTransaction.id}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold tabular-nums text-white">
                {demoTransaction.amount}
              </span>
              <span className="text-xs text-white/50">
                {demoTransaction.currencyFrom} -&gt;{" "}
                {demoTransaction.currencyTo}
              </span>
            </div>
          </div>

          <div className="mb-10">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                ref={progressRef}
                className="h-full rounded-full bg-brand-teal"
                style={{ width: "0%" }}
                data-progress-fill
              />
            </div>
          </div>

          <div
            className="mb-8 flex flex-col gap-6 md:flex-row md:gap-4"
            data-steps
          >
            {demoStatuses.map((status, i) => (
              <StepIndicator
                key={status.s}
                status={status}
                index={i}
                isLast={i === demoStatuses.length - 1}
              />
            ))}
          </div>

          <div
            ref={summaryRef}
            className="rounded-xl border border-brand-teal/20 bg-brand-teal/10 px-6 py-4 text-center"
            style={{ opacity: 0, display: "none" }}
            data-summary
          >
            <span className="text-xs font-semibold tracking-wide text-brand-teal">
              Transfer complete - {demoTransaction.amount} -{" "}
              {demoTransaction.routeFrom} -&gt; {demoTransaction.routeTo} - 4m
              32s
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
