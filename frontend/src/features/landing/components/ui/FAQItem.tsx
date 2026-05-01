import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Minus, Plus } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

export function FAQItem({
  question,
  answer,
  index,
  isOpen,
  onToggle,
}: FAQItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useGSAP(
    () => {
      if (!contentRef.current || !innerRef.current || !iconRef.current) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.killTweensOf([
        contentRef.current,
        innerRef.current,
        iconRef.current,
      ]);

      const setOpenState = () => {
        gsap.set(iconRef.current, { rotation: 180 });
        gsap.set(contentRef.current, {
          display: "block",
          height: "auto",
          opacity: 1,
        });
        gsap.set(innerRef.current, { y: 0, opacity: 1 });
      };

      const setClosedState = () => {
        gsap.set(iconRef.current, { rotation: 0 });
        gsap.set(contentRef.current, {
          display: "none",
          height: 0,
          opacity: 0,
        });
        gsap.set(innerRef.current, { y: 0, opacity: 1 });
      };

      if (!initializedRef.current) {
        initializedRef.current = true;
        if (isOpen) {
          setOpenState();
        } else {
          setClosedState();
        }
        return;
      }

      if (reduceMotion) {
        if (isOpen) {
          setOpenState();
        } else {
          setClosedState();
        }
        return;
      }

      if (isOpen) {
        gsap.to(iconRef.current, {
          rotation: 180,
          duration: 0.3,
          ease: "power2.out",
        });

        gsap.set(contentRef.current, { display: "block" });
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(
          contentRef.current,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.45 },
        );
        tl.fromTo(
          innerRef.current,
          { y: -8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3 },
          "-=0.2",
        );
      } else {
        gsap.to(iconRef.current, {
          rotation: 0,
          duration: 0.3,
          ease: "power2.in",
        });

        const tl = gsap.timeline({
          onComplete: () => {
            if (contentRef.current) {
              gsap.set(contentRef.current, { display: "none" });
            }
          },
        });

        tl.to(innerRef.current, {
          y: -6,
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
        });
        tl.to(
          contentRef.current,
          {
            height: 0,
            opacity: 0,
            duration: 0.3,
            ease: "power3.inOut",
          },
          "-=0.1",
        );
      }
    },
    { dependencies: [isOpen] },
  );

  return (
    <div className="border-b border-zinc-200 last:border-b-0" data-faq-item>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex w-full items-start gap-4 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAFA]"
      >
        <span className="shrink-0 pt-1 font-mono text-xs tabular-nums text-brand-teal/40">
          {String(index + 1).padStart(2, "0")}
        </span>

        <h4
          className={[
            "flex-1 text-base transition-colors duration-200 lg:text-lg",
            isOpen
              ? "font-semibold text-brand-blue"
              : "font-medium text-brand-blue group-hover:text-brand-teal",
          ].join(" ")}
        >
          {question}
        </h4>

        <div
          ref={iconRef}
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
            isOpen
              ? "bg-brand-teal/10 text-brand-teal"
              : "bg-zinc-100 text-brand-blue/30 group-hover:bg-brand-teal/10 group-hover:text-brand-teal",
          ].join(" ")}
        >
          {isOpen ? (
            <Minus className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </div>
      </button>

      <div
        ref={contentRef}
        style={{ height: 0, opacity: 0, display: "none", overflow: "hidden" }}
      >
        <div
          ref={innerRef}
          className="max-w-[60ch] pb-6 pl-10 pr-12 text-sm font-light leading-relaxed text-brand-blue/60 lg:text-base"
        >
          {answer}
        </div>
      </div>
    </div>
  );
}
