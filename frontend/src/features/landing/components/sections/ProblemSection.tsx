import { useRef, type MouseEvent, type MutableRefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "../ui";
import { problemItems, type ProblemItem } from "../../data/constants";

gsap.registerPlugin(ScrollTrigger);

type KineticHeadingProps = {
  main: string;
  accent: string;
  wordsRef: MutableRefObject<HTMLSpanElement[]>;
};

function KineticHeading({ main, accent, wordsRef }: KineticHeadingProps) {
  const addRef = (el: HTMLSpanElement | null) => {
    if (el && !wordsRef.current.includes(el)) {
      wordsRef.current.push(el);
    }
  };

  const renderWords = (text: string, className: string) =>
    text.split(" ").map((word, i) => (
      <span key={`${word}-${i}`} className="inline-block overflow-hidden mr-3">
        <span
          ref={addRef}
          className={`inline-block ${className}`}
          style={{ willChange: "transform, opacity" }}
        >
          {word}
        </span>
      </span>
    ));

  return (
    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center mb-8 md:mb-10">
      {renderWords(main, "text-brand-blue")}
      <br className="hidden sm:block" />
      {renderWords(accent, "text-brand-teal")}
    </h2>
  );
}

function ProblemIcon({ type }: { type: ProblemItem["icon"] }) {
  const paths: Record<ProblemItem["icon"], string> = {
    blocked: "M18 6L6 18M6 6l12 12",
    fees: "M12 2v20M7 7h10M7 17h10",
    slow: "M12 6v6l4 2M12 22a10 10 0 110-20 10 10 0 010 20",
    trust:
      "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6m10 3a3 3 0 100-6 3 3 0 000 6",
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-8 h-8 text-brand-teal"
      data-icon-svg
    >
      <path d={paths[type]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type ProblemCardProps = {
  item: ProblemItem;
  index: number;
  cardRef: (el: HTMLDivElement | null) => void;
};

function ProblemCard({ item, index, cardRef }: ProblemCardProps) {
  const isWide = item.variant === "wide";
  const indexStr = String(index + 1).padStart(2, "0");

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 800,
      duration: 0.4,
      ease: "power2.out",
    });

    const indexEl = card.querySelector("[data-index]");
    gsap.to(indexEl, {
      x: ((x - centerX) / centerX) * 8,
      y: ((y - centerY) / centerY) * 6,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });
    gsap.to(card.querySelector("[data-index]"), {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={[
        "relative overflow-hidden rounded-[1.25rem] border border-brand-blue/10",
        "group cursor-default transition-colors duration-500 hover:border-brand-teal/50",
        "col-span-1",
        isWide ? "md:col-span-2 p-8 md:p-10 lg:p-12" : "p-8 md:p-8 lg:p-10",
      ].join(" ")}
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, rgba(0,148,172,0.08), transparent 70%), #ffffff",
        willChange: "transform, opacity",
      }}
    >
      <span
        className="absolute top-[-0.5rem] right-4 font-extrabold text-brand-blue/[0.07] select-none pointer-events-none leading-none"
        style={{ fontSize: "clamp(8rem, 12vw, 12rem)" }}
        data-index
      >
        {indexStr}
      </span>

      <div className="relative z-10">
        <div className="w-8 h-8 mb-4" data-icon>
          <ProblemIcon type={item.icon} />
        </div>
        <div
          className="h-[2px] bg-brand-teal mb-6 origin-left w-0"
          data-accent-line
        />
        <h3
          className={`font-semibold text-brand-blue mb-3 ${isWide ? "text-2xl" : "text-xl"}`}
          data-title
        >
          {item.title}
        </h3>
        <p
          className="text-sm text-brand-blue/65 leading-relaxed font-light max-w-[32ch]"
          data-desc
        >
          {item.desc}
        </p>
      </div>
    </div>
  );
}

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingWordsRef = useRef<HTMLSpanElement[]>([]);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const quoteRef = useRef<HTMLDivElement>(null);
  const headingLineRef = useRef<HTMLDivElement>(null);

  cardsRef.current = [];
  headingWordsRef.current = [];

  const setCardRef = (el: HTMLDivElement | null) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 90%",
          end: "bottom 25%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(headingWordsRef.current, {
        y: 40,
        opacity: 0,
        rotateX: 45,
        transformOrigin: "center bottom",
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.08,
      });

      tl.fromTo(
        headingLineRef.current,
        { width: 0, opacity: 0 },
        { width: 80, opacity: 1, duration: 0.45, ease: "power2.out" },
        "-=0.2",
      );

      tl.from(
        cardsRef.current,
        {
          y: 80,
          opacity: 0,
          scale: 0.96,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
        },
        "-=0.2",
      );

      cardsRef.current.forEach((card) => {
        const icon = card.querySelector("[data-icon]");
        const accentLine = card.querySelector("[data-accent-line]");
        const title = card.querySelector("[data-title]");
        const desc = card.querySelector("[data-desc]");
        const index = card.querySelector("[data-index]");
        const path = card.querySelector("[data-icon-svg] path");

        if (path) {
          const length = (path as SVGPathElement).getTotalLength();
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        }

        const subTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 92%",
            toggleActions: "play none none reverse",
          },
        });

        subTl
          .from(icon, {
            scale: 0,
            opacity: 0,
            duration: 0.4,
            ease: "back.out(2)",
          })
          .to(
            accentLine,
            { width: 48, duration: 0.5, ease: "power2.out" },
            "-=0.2",
          )
          .to(
            path,
            { strokeDashoffset: 0, duration: 0.6, ease: "power2.out" },
            "-=0.5",
          )
          .from(
            title,
            { y: 20, opacity: 0, duration: 0.45, ease: "power2.out" },
            "-=0.3",
          )
          .from(
            desc,
            { y: 15, opacity: 0, duration: 0.45, ease: "power2.out" },
            "-=0.3",
          )
          .to(
            index,
            { opacity: 0.03, duration: 0.35, ease: "power2.out" },
            "<",
          );
      });

      tl.from(
        quoteRef.current,
        { y: 30, opacity: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3",
      );
      const quoteLine = quoteRef.current?.querySelector("[data-quote-line]");
      if (quoteLine) {
        tl.to(
          quoteLine,
          { height: "100%", duration: 0.6, ease: "power2.out" },
          "-=0.45",
        );
      }
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="problem"
      className="problem-section relative py-24 md:py-32 bg-[#f7fafc] overflow-hidden"
    >
      <Container className="relative z-10">
        <KineticHeading
          main="Cross-Border"
          accent="Transfers Are Broken"
          wordsRef={headingWordsRef}
        />
        <div
          className="mx-auto mb-14 h-px bg-brand-teal/80"
          ref={headingLineRef}
        />

        <div className="problem-grid">
          {problemItems.map((item, i) => (
            <ProblemCard
              key={item.title}
              item={item}
              index={i}
              cardRef={setCardRef}
            />
          ))}
        </div>

        <div ref={quoteRef} className="mt-20 relative pl-8">
          <div
            className="absolute left-0 top-0 w-[2px] bg-brand-teal origin-top h-0"
            data-quote-line
          />
          <p className="text-brand-blue/60 font-light italic text-lg max-w-2xl">
            Millions of people are left without reliable ways to send or receive
            money.
          </p>
        </div>
      </Container>
    </section>
  );
}
