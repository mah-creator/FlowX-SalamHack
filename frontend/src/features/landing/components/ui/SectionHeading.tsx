interface SectionHeadingProps {
  main: string;
  accent: string;
  center?: boolean;
  className?: string;
}

export function SectionHeading({
  main,
  accent,
  center,
  className,
}: SectionHeadingProps) {
  return (
    <h2
      className={`text-4xl md:text-5xl font-light tracking-tighter mb-16 ${center ? "text-center" : ""} ${className ?? ""}`}
    >
      {main} <br />
      <span className="text-brand-teal italic">{accent}</span>
    </h2>
  );
}
