import { ArrowUpRight } from "lucide-react";
import { Container } from "../ui";

function renderWords(
  text: string,
  attr: "data-hero-word-1" | "data-hero-word-2",
) {
  return text.split(" ").map((word, i) => (
    <span
      key={`${word}-${i}`}
      className="mr-2 inline-block overflow-hidden md:mr-3"
    >
      <span {...{ [attr]: "" }} className="inline-block gsap-hidden">
        {word}
      </span>
    </span>
  ));
}

export function HeroSection() {
  return (
    <Container
      as="main"
      className="relative flex flex-grow flex-col justify-center pb-0 pt-12 md:pt-24"
      data-hero-section
    >
      <div
        className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-24"
        data-hero-content
      >
        <div>
          <h1 className="text-4xl font-light tracking-tighter text-brand-blue sm:text-5xl md:text-7xl">
            {renderWords("Send Money Across", "data-hero-word-1")}
            <br />
            <span className=" block text-3xl font-extralight  text-brand-blue sm:text-4xl md:text-6xl leading-snug">
              {renderWords("Borders — Without Moving It", "data-hero-word-2")}
            </span>
          </h1>
        </div>

        <div className="flex flex-col gap-6 md:gap-8 lg:ml-auto lg:max-w-md lg:items-start lg:text-left">
          <p
            data-hero-subtitle
            className="gsap-hidden max-w-sm text-sm font-light leading-relaxed text-brand-blue/90 md:text-base"
          >
            FlowX matches local payment needs to make cross-border transfers
            faster, cheaper, and more reliable — even in restricted regions.
          </p>

          <div data-hero-cta className="gsap-hidden">
            <button className="group flex items-center gap-2 rounded-sm bg-brand-teal px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand-teal/20 transition-colors hover:bg-brand-teal/90">
              How It Works
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}
