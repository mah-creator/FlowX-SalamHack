import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Logo } from "./Logo";

interface LoaderProps {
  progress: number;
  onComplete: () => void;
}

export function Loader({ progress, onComplete }: LoaderProps) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const mountedAtRef = useRef<number>(Date.now());
  const hasExitedRef = useRef(false);

  useEffect(() => {
    if (!progressBarRef.current) return;

    gsap.to(progressBarRef.current, {
      width: `${progress}%`,
      duration: 0.4,
      ease: "power2.out",
    });

    if (progressTextRef.current) {
      progressTextRef.current.textContent = `${progress}%`;
    }
  }, [progress]);

  useEffect(() => {
    if (progress < 100 || hasExitedRef.current) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const elapsed = Date.now() - mountedAtRef.current;
    const waitForMinimum = Math.max(0, 500 - elapsed);

    const timer = window.setTimeout(() => {
      if (hasExitedRef.current) return;

      if (reduceMotion) {
        hasExitedRef.current = true;
        onComplete();
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          hasExitedRef.current = true;
          onComplete();
        },
      });

      tl.to(progressBarRef.current, {
        backgroundColor: "#0094ac",
        duration: 0.2,
      })
        .to({}, { duration: 0.3 })
        .to(logoRef.current, {
          scale: 1.1,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
        })
        .to(
          [progressTrackRef.current, progressTextRef.current],
          {
            opacity: 0,
            duration: 0.3,
          },
          "-=0.4",
        )
        .to(
          loaderRef.current,
          {
            yPercent: -100,
            duration: 0.7,
            ease: "power3.inOut",
          },
          "-=0.2",
        );
    }, waitForMinimum + 200);

    return () => window.clearTimeout(timer);
  }, [onComplete, progress]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
    >
      <div ref={logoRef} className="mb-8">
        <Logo />
      </div>

      <div
        ref={progressTrackRef}
        className="h-[2px] w-48 overflow-hidden rounded-full bg-zinc-100"
      >
        <div
          ref={progressBarRef}
          className="h-full rounded-full bg-brand-blue/30"
          style={{ width: "0%" }}
        />
      </div>

      <span
        ref={progressTextRef}
        className="mt-3 font-mono text-[10px] tabular-nums tracking-wider text-brand-blue/30"
      >
        0%
      </span>
    </div>
  );
}
