import type { ReactNode } from "react";

interface SocialButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export function SocialButton({ icon, label, onClick }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-medium text-brand-blue",
        "flex items-center justify-center gap-3 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/20",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}
