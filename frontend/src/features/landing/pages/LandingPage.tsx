import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Footer } from "../components/layout/Footer";
import { MobileMenu } from "../components/layout/MobileMenu";
import { Navbar } from "../components/layout/Navbar";
import {
  CTASection,
  CaseStudySection,
  DemoSection,
  FAQSection,
  FeaturesSection,
  HeroSection,
  MarqueeStrip,
  PricingSection,
  ProblemSection,
  SecuritySection,
  SolutionSection,
} from "../components/sections";
import { Loader } from "../components/ui";
import { heroCards } from "../data/constants";
import { useAssetLoader } from "../hooks/useAssetLoader";
import { useLenis } from "../hooks/useLenis";

let hasShownLandingLoader = false;
let hasPlayedLandingEntrance = false;

export default function LandingPage() {
  useLenis();

  const prefersReducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  if (prefersReducedMotion) {
    hasShownLandingLoader = true;
    hasPlayedLandingEntrance = true;
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(
    !hasShownLandingLoader && !prefersReducedMotion,
  );
  const [isLoaded, setIsLoaded] = useState(
    hasShownLandingLoader || prefersReducedMotion,
  );
  const [isHeroEntering, setIsHeroEntering] = useState(false);

  const heroViewportRef = useRef<HTMLDivElement>(null);

  const criticalAssets = useMemo(
    () => ["/media/bgVideo.mp4", heroCards[0].img],
    [],
  );

  const { progress } = useAssetLoader(criticalAssets);

  const shouldRunEntrance = !prefersReducedMotion && !hasPlayedLandingEntrance;

  useEffect(() => {
    const shouldLock = showLoader || isHeroEntering;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isHeroEntering, showLoader]);

  useEffect(() => {
    if (!isLoaded || shouldRunEntrance) return;

    const root = heroViewportRef.current;
    if (!root) return;

    const hiddenTargets = root.querySelectorAll(".gsap-hidden");
    hiddenTargets.forEach((target) => {
      const element = target as HTMLElement;
      element.style.visibility = "inherit";
      element.style.opacity = "1";
    });
  }, [isLoaded, shouldRunEntrance]);

  useGSAP(
    () => {
      if (!isLoaded || !shouldRunEntrance) {
        return;
      }

      const root = heroViewportRef.current;
      if (!root) {
        return;
      }

      const navbar = root.querySelector("[data-navbar]");
      const headlineWords1 = root.querySelectorAll("[data-hero-word-1]");
      const headlineWords2 = root.querySelectorAll("[data-hero-word-2]");
      const subtitle = root.querySelector("[data-hero-subtitle]");
      const cta = root.querySelector("[data-hero-cta]");
      const marquee = root.querySelector("[data-marquee]");
      const heroCard = root.querySelector("[data-hero-card]");

      const animatedTargets = [
        navbar,
        ...headlineWords1,
        ...headlineWords2,
        subtitle,
        cta,
        marquee,
        heroCard,
      ].filter(Boolean);

      gsap.set(animatedTargets, { willChange: "transform, opacity" });

      setIsHeroEntering(true);

      const tl = gsap.timeline({
        onComplete: () => {
          setIsHeroEntering(false);
          hasPlayedLandingEntrance = true;
          gsap.set(animatedTargets, { clearProps: "willChange" });
        },
      });

      tl.fromTo(
        navbar,
        {
          autoAlpha: 0,
          y: -30,
          xPercent: -50,
        },
        {
          autoAlpha: 1,
          y: 0,
          xPercent: -50,
          duration: 0.6,
          ease: "power3.out",
          onComplete: () => {
            gsap.set(navbar, { clearProps: "transform" });
          },
        },
      );

      tl.fromTo(
        headlineWords1,
        {
          y: 60,
          autoAlpha: 0,
          rotateX: 35,
          transformOrigin: "center bottom",
        },
        {
          y: 0,
          autoAlpha: 1,
          rotateX: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.07,
        },
        "-=0.35",
      );

      tl.fromTo(
        headlineWords2,
        {
          y: 50,
          autoAlpha: 0,
          rotateX: 25,
          transformOrigin: "center bottom",
        },
        {
          y: 0,
          autoAlpha: 1,
          rotateX: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.06,
        },
        "-=0.3",
      );

      tl.fromTo(
        subtitle,
        {
          y: 25,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.2",
      );

      tl.fromTo(
        cta,
        {
          y: 20,
          autoAlpha: 0,
          scale: 0.95,
        },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.5)",
        },
        "-=0.2",
      );

      tl.fromTo(
        marquee,
        {
          y: 30,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.2",
      );

      if (heroCard) {
        tl.fromTo(
          heroCard,
          {
            y: 20,
            autoAlpha: 0,
            scale: 0.97,
          },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.3",
        );
      }
    },
    { dependencies: [isLoaded, shouldRunEntrance], scope: heroViewportRef },
  );

  const handleLoaderComplete = () => {
    hasShownLandingLoader = true;
    setShowLoader(false);
    setIsLoaded(true);
  };

  return (
    <>
      {showLoader ? (
        <Loader progress={progress} onComplete={handleLoaderComplete} />
      ) : null}

      <div className="relative flex min-h-screen flex-col bg-white font-sans text-brand-blue selection:bg-brand-teal/30">
        <div
          className="relative flex min-h-screen flex-col overflow-hidden lg:h-screen"
          ref={heroViewportRef}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          >
            <source src="/media/bgVideo.mp4" type="video/mp4" />
          </video>

          <div
            className="relative z-10 flex min-h-screen flex-col lg:h-screen"
            id="top"
          >
            <Navbar onOpenMenu={() => setIsMenuOpen(true)} />
            <MobileMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
            />
            <HeroSection />
            <MarqueeStrip />
          </div>
        </div>

        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <CaseStudySection />
        <SecuritySection />
        <DemoSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
