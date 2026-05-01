import type { MouseEvent, ReactNode } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUp, Github, Linkedin, Mail, Twitter } from "lucide-react";
import { Logo } from "../ui";

gsap.registerPlugin(ScrollTrigger);

type FooterIcon = "twitter" | "linkedin" | "github" | "mail";

type FooterLink = {
  label: string;
  href: string;
  icon?: FooterIcon;
};

const footerColumns: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "Product",
    links: [
      { label: "Problem", href: "#problem" },
      { label: "Solution", href: "#solution" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Case Study", href: "#case-study" },
      { label: "Security", href: "#security" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Help Center", href: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Twitter", href: "#", icon: "twitter" },
      { label: "LinkedIn", href: "#", icon: "linkedin" },
      { label: "GitHub", href: "#", icon: "github" },
      { label: "Email", href: "mailto:hello@flowx.com", icon: "mail" },
    ],
  },
];

const legalLinks: FooterLink[] = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Contact", href: "#" },
];

function SocialIcon({ icon }: { icon: FooterIcon }) {
  const className = "h-4 w-4";

  switch (icon) {
    case "twitter":
      return <Twitter className={className} />;
    case "linkedin":
      return <Linkedin className={className} />;
    case "github":
      return <Github className={className} />;
    case "mail":
      return <Mail className={className} />;
  }
}

function renderTaglineWords(line: string): ReactNode {
  return line.split(" ").map((word, i) => (
    <span key={`${word}-${i}`} className="mr-3 inline-block" data-tagline-word>
      {word}
    </span>
  ));
}

function BackToTopButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.pushState(null, "", "#top");
  };

  const handleMouseMove = (event: MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (reduceMotion || !canHover) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    gsap.to(button, {
      x: x * 0.15,
      y: y * 0.15,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Back to top"
      className={[
        "group flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.1]",
        "text-white/40 transition-colors duration-300 hover:border-brand-teal/40 hover:text-brand-teal",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]",
      ].join(" ")}
      style={{ willChange: "transform" }}
    >
      <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const currentYear = new Date().getFullYear();

  const handleSmoothScroll = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href === "#") {
      event.preventDefault();
      return;
    }

    if (!href.startsWith("#")) {
      return;
    }

    event.preventDefault();

    if (href === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", href);
      return;
    }

    const target = document.querySelector(href);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", href);
  };

  useGSAP(
    () => {
      const footer = footerRef.current;
      if (!footer) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        return;
      }

      const logo = footer.querySelector("[data-footer-logo]");
      const taglineWords = footer.querySelectorAll("[data-tagline-word]");
      const desc = footer.querySelector("[data-footer-desc]");
      const separators = footer.querySelectorAll("[data-separator]");
      const columns = footer.querySelectorAll("[data-footer-col]");
      const bottomBar = footer.querySelector("[data-bottom-bar]");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footer,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      tl.from(logo, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      tl.from(
        taglineWords,
        {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.06,
        },
        "-=0.2",
      );

      tl.from(
        desc,
        {
          y: 15,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.3",
      );

      tl.from(
        separators[0],
        {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.2",
      );

      columns.forEach((col, i) => {
        const heading = col.querySelector("[data-col-heading]");
        const links = col.querySelectorAll("[data-col-link]");

        tl.from(
          heading,
          {
            y: 10,
            opacity: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          i === 0 ? "-=0.2" : "-=0.12",
        );

        tl.from(
          links,
          {
            y: 10,
            opacity: 0,
            duration: 0.3,
            ease: "power2.out",
            stagger: 0.04,
          },
          "-=0.15",
        );
      });

      tl.from(
        separators[1],
        {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.2",
      );

      tl.from(
        bottomBar,
        {
          y: 10,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.3",
      );
    },
    { scope: footerRef },
  );

  return (
    <footer ref={footerRef} className="bg-[#0a0a0a] pt-24 pb-12 text-white">
      <div className="mx-auto w-full max-w-[1250px] px-6 md:px-12">
        <div className="mb-16">
          <div data-footer-logo>
            <Logo tone="light" />
          </div>

          <h2 className="mt-10 text-3xl font-light tracking-tight text-white sm:text-4xl lg:text-5xl">
            {renderTaglineWords("Move Money Without")}
            <br />
            {renderTaglineWords("Borders.")}
          </h2>

          <p
            className="mt-6 max-w-md text-sm font-light leading-relaxed text-white/40"
            data-footer-desc
          >
            Cross-border transfers made faster, cheaper, and reliable for
            constrained regions.
          </p>
        </div>

        <div className="h-px bg-white/[0.06]" data-separator />

        <div
          className="grid grid-cols-2 gap-x-8 gap-y-10 py-12 md:grid-cols-4 md:gap-x-12 md:gap-y-8"
          data-footer-grid
        >
          {footerColumns.map((column) => (
            <div key={column.title} data-footer-col>
              <p
                className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white/30"
                data-col-heading
              >
                {column.title}
              </p>

              <div className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(event) => handleSmoothScroll(event, link.href)}
                    className="footer-link inline-flex w-fit items-center gap-2 text-sm font-light text-white/50 transition-colors hover:text-white"
                    data-col-link
                  >
                    {link.icon ? <SocialIcon icon={link.icon} /> : null}
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="h-px bg-white/[0.06]" data-separator />

        <div
          className="flex flex-col gap-6 pt-8 text-center sm:text-left md:flex-row md:items-end md:justify-between"
          data-bottom-bar
        >
          <div>
            <p className="text-xs text-white/25">
              © {currentYear} FlowX. All rights reserved.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 md:justify-start">
              {legalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(event) => handleSmoothScroll(event, link.href)}
                  className="footer-link text-xs text-white/30 transition-colors hover:text-white/60"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <BackToTopButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
