import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface AnimatedCardProps {
  index: number;
  children: ReactNode;
  className?: string;
}

export function AnimatedCard({
  index,
  children,
  className,
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cardRef.current) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 90%",
            end: "top 55%",
            scrub: true,
          },
        },
      );
    },
    { dependencies: [index] },
  );

  return (
    <div ref={cardRef} className={className}>
      {children}
    </div>
  );
}
