import type { ReactNode } from "react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Logo } from "../ui";

interface AuthLayoutProps {
  children: ReactNode;
}

function renderWords(text: string, className: string) {
  return text.split(" ").map((word, i) => (
    <span
      key={`${word}-${i}`}
      className={`mr-3 inline-block ${className}`}
      data-tagline-word
    >
      {word}
    </span>
  ));
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const layoutRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const layout = layoutRef.current;
      if (!layout) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) return;

      const leftPanel = layout.querySelector("[data-auth-left]");
      const taglineWords = layout.querySelectorAll("[data-tagline-word]");
      const rightContent = layout.querySelector("[data-auth-right]");

      const tl = gsap.timeline();
      tl.from(leftPanel, {
        x: -40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
        .from(
          taglineWords,
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.06,
          },
          "-=0.45",
        )
        .from(
          rightContent,
          {
            y: 30,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.4",
        );
    },
    { scope: layoutRef },
  );

  return (
    <div
      ref={layoutRef}
      className="flex min-h-screen font-sans selection:bg-brand-teal/30"
    >
      <div
        className="relative hidden overflow-hidden bg-brand-blue p-12 lg:flex lg:w-[40%] lg:flex-col lg:justify-between"
        data-auth-left
      >
        <div data-auth-logo>
          <Link to="/" aria-label="Go to home">
            <Logo variant="white" />
          </Link>
        </div>

        <div>
          <h1 className="mb-4 text-3xl font-light tracking-tight text-white lg:text-4xl">
            {renderWords("Move Money", "text-white")}
            <br />
            {renderWords("Without Borders.", "text-white/30")}
          </h1>
          <p className="max-w-xs text-sm font-light leading-relaxed text-white/30">
            Trusted by thousands of users across 4+ corridors for fast, secure
            transfers.
          </p>
        </div>

        <div className="text-xs font-light text-white/20">
          <p>© {new Date().getFullYear()} FlowX. All rights reserved.</p>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px]"
          style={{
            background:
              "radial-gradient(circle at 0% 100%, rgba(0,148,172,0.08), transparent 60%)",
          }}
        />
      </div>

      <div className="flex flex-1 items-center justify-center bg-white p-6 lg:p-12">
        <div className="w-full max-w-md" data-auth-right>
          <div className="mb-10 lg:hidden">
            <Link to="/" aria-label="Go to home">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
