import { Zap } from "lucide-react";

interface LogoProps {
  className?: string;
  tone?: "brand" | "light";
  variant?: "default" | "white";
}

export function Logo({
  className,
  tone = "brand",
  variant = "default",
}: LogoProps) {
  const isWhite = variant === "white" || tone === "light";
  const colorClass = isWhite ? "text-white" : "text-brand-blue";

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <Zap className={`w-5 h-5 ${colorClass}`} />
      <span className={`text-lg font-semibold tracking-tight ${colorClass}`}>
        flowX
      </span>
    </div>
  );
}
