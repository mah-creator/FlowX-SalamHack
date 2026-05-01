import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "div" | "section" | "main" | "nav" | "footer";
  size?: "default" | "narrow";
}

export function Container({
  children,
  className,
  id,
  as = "div",
  size = "default",
}: ContainerProps) {
  const Component = as;
  const maxWidthClass = size === "narrow" ? "max-w-4xl" : "max-w-[1250px]";

  return (
    <Component
      id={id}
      className={`w-full mx-auto px-6 md:px-12 ${maxWidthClass} ${className ?? ""}`}
    >
      {children}
    </Component>
  );
}
