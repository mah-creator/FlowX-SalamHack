import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { faqData } from "../../data/constants";
import { FAQItem } from "../ui";

gsap.registerPlugin(ScrollTrigger);

export function FAQSection() {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const overlineRef = useRef<HTMLSpanElement>(null);
  const headingWordsRef = useRef<HTMLSpanElement[]>([]);
  const counterRef = useRef<HTMLDivElement>(null);
  const accentLineRef = useRef<HTMLDivElement>(null);
  const supportCtaRef = useRef<HTMLDivElement>(null);

  headingWordsRef.current = [];

  const toggleFaq = (index: number) => {
    setActiveFaqIndex((current) => (current === index ? null : index));
  };

  const addHeadingRef = (el: HTMLSpanElement | null) => {
    if (el && !headingWordsRef.current.includes(el)) {
      headingWordsRef.current.push(el);
    }
  };

  const renderWords = (text: string, className: string) =>
    text.split(" ").map((word, i) => (
      <span key={`${word}-${i}`} className="mr-3 inline-block overflow-hidden">
        <span
          ref={addHeadingRef}
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
      const faqItems = Array.from(section.querySelectorAll("[data-faq-item]"));

      if (reduceMotion) {
        gsap.set(
          [
            overlineRef.current,
            ...headingWordsRef.current,
            counterRef.current,
            accentLineRef.current,
            supportCtaRef.current,
            ...faqItems,
          ],
          { clearProps: "all" },
        );
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
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
          y: 40,
          opacity: 0,
          rotateX: 30,
          transformOrigin: "center bottom",
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.06,
        },
        "-=0.2",
      );

      tl.from(
        counterRef.current,
        {
          y: 20,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.3",
      );

      tl.from(
        accentLineRef.current,
        {
          width: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.2",
      );

      tl.from(
        supportCtaRef.current,
        {
          y: 15,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.2",
      );

      tl.from(
        faqItems,
        {
          x: 30,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.08,
        },
        "-=0.4",
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="bg-[#FAFAFA] py-24 text-brand-blue md:py-32"
    >
      <div className="mx-auto w-full max-w-[1250px] px-6 md:px-12">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[35%_1fr] lg:gap-24">
          <div className="self-start lg:sticky lg:top-32">
            <span
              ref={overlineRef}
              className="mb-4 block text-xs font-bold uppercase tracking-[0.25em] text-brand-teal"
            >
              Support
            </span>

            <h2 className="text-3xl font-bold tracking-tight text-brand-blue md:text-4xl lg:text-5xl">
              {renderWords("Questions", "text-brand-blue")}
            </h2>
            <h2 className="mb-8 text-3xl font-light tracking-tight text-brand-blue/40 md:text-4xl lg:mb-10 lg:text-5xl">
              {renderWords("& Answers", "text-brand-blue/40")}
            </h2>

            <div
              ref={counterRef}
              className="mb-8 flex items-baseline gap-3"
              data-counter
            >
              <span className="text-5xl font-bold tabular-nums text-brand-teal">
                {String(faqData.length).padStart(2, "0")}
              </span>
              <span className="text-sm font-light text-brand-blue/40">
                questions
                <br />
                answered
              </span>
            </div>

            <div
              ref={accentLineRef}
              className="mb-8 h-[2px] w-12 bg-brand-teal"
              data-accent-line
            />

            <div ref={supportCtaRef} data-support-cta>
              <p className="mb-3 text-sm font-light text-brand-blue/50">
                Still have a question?
              </p>
              <a
                href="mailto:support@flowx.app"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-teal"
              >
                Contact Us
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          <div className="border-y border-zinc-200">
            {faqData.map((item, i) => (
              <FAQItem
                key={item.q}
                index={i}
                question={item.q}
                answer={item.a}
                isOpen={activeFaqIndex === i}
                onToggle={() => toggleFaq(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
