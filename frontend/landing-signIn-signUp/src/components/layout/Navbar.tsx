import type { MouseEvent } from "react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Menu } from "lucide-react";
import { navLinks } from "../../data/constants";
import { Logo } from "../ui";

interface NavbarProps {
  onOpenMenu: () => void;
}

export function Navbar({ onOpenMenu }: NavbarProps) {
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const linksHiddenRef = useRef(false);
  const linksNaturalWidth = useRef(0);

  const SCROLL_THRESHOLD = 5;
  const TOP_VISIBILITY_THRESHOLD = 80;

  const showLinks = () => {
    if (!linksRef.current) {
      return;
    }

    gsap.killTweensOf(linksRef.current);
    gsap.to(linksRef.current, {
      opacity: 1,
      width: linksNaturalWidth.current,
      duration: 0.4,
      ease: "power2.inOut",
      pointerEvents: "auto",
      overflow: "visible",
      clearProps: "width,overflow,marginLeft,marginRight,gap",
    });
    linksHiddenRef.current = false;
  };

  const hideLinks = () => {
    if (!linksRef.current) {
      return;
    }

    gsap.killTweensOf(linksRef.current);
    gsap.to(linksRef.current, {
      opacity: 0,
      width: 0,
      marginLeft: 0,
      marginRight: 0,
      gap: 0,
      duration: 0.4,
      ease: "power2.inOut",
      pointerEvents: "none",
      overflow: "hidden",
    });
    linksHiddenRef.current = true;
  };

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) {
      return;
    }

    event.preventDefault();
    const target = document.querySelector(href);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", href);
  };

  useGSAP(() => {
    if (!linksRef.current) {
      return;
    }

    linksNaturalWidth.current = linksRef.current.scrollWidth;

    let lastY = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;
      const isDesktop = window.innerWidth >= 1024;

      if (!isDesktop) {
        lastY = currentY;
        return;
      }

      if (!linksRef.current) {
        return;
      }

      if (currentY < TOP_VISIBILITY_THRESHOLD) {
        if (linksHiddenRef.current) {
          showLinks();
        }
        lastY = currentY;
        return;
      }

      if (Math.abs(delta) < SCROLL_THRESHOLD) {
        return;
      }

      const scrollingDown = delta > 0;

      if (scrollingDown && !linksHiddenRef.current) {
        hideLinks();
      }

      if (!scrollingDown && linksHiddenRef.current) {
        showLinks();
      }

      lastY = currentY;
    };

    const handleResize = () => {
      if (!linksRef.current) {
        return;
      }

      if (window.innerWidth < 1024) {
        gsap.killTweensOf(linksRef.current);
        gsap.set(linksRef.current, {
          clearProps: "all",
        });
        linksHiddenRef.current = false;
        return;
      }

      if (!linksHiddenRef.current) {
        linksNaturalWidth.current = linksRef.current.scrollWidth;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <nav
      data-navbar
      ref={navRef}
      className="gsap-hidden fixed left-1/2 top-4 z-40 flex w-auto max-w-[calc(100vw-1.5rem)] -translate-x-1/2 shrink-0 items-center justify-between rounded-full border border-brand-blue/40 bg-white/8 px-6 py-4 backdrop-blur-lg transition-all duration-300 md:max-w-[calc(100vw-3rem)] md:px-12 md:py-5"
    >
      <div className="flex items-center gap-8 shrink-0">
        <Logo className="shrink-0" />
        <div
          ref={linksRef}
          className="hidden lg:flex items-center gap-8 text-[11px] font-medium uppercase tracking-widest text-brand-blue/70 overflow-hidden whitespace-nowrap"
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(event) => handleNavClick(event, link.href)}
              className="hover:text-brand-teal transition-colors flex items-center gap-1 group"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 lg:ml-8">
        <Link
          to="/signup"
          className="cursor-pointer px-5 py-2 rounded-full border border-brand-teal/70 bg-white/5 hover:bg-white/15 transition-colors text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="cursor-pointer px-5 py-2 rounded-full bg-brand-teal text-white font-semibold text-[11px] uppercase tracking-wider hover:bg-brand-teal/90 transition-colors whitespace-nowrap"
        >
          Sign In
        </Link>
      </div>

      <button
        onClick={onOpenMenu}
        aria-label="Open mobile menu"
        className="lg:hidden w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-teal/10 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
    </nav>
  );
}
