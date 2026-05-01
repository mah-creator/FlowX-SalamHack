import type { InputHTMLAttributes, ReactNode } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  endAdornment?: ReactNode;
}

export function AuthInput({
  label,
  error,
  id,
  endAdornment,
  ...props
}: AuthInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-blue/70"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className={[
            "w-full rounded-xl border bg-zinc-50 px-4 py-3.5 text-sm text-brand-blue placeholder:text-brand-blue/30",
            "transition-all duration-200 focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/10",
            endAdornment ? "pr-12" : "",
            error ? "border-red-300 ring-2 ring-red-100" : "border-zinc-200",
          ].join(" ")}
          {...props}
        />
        {endAdornment ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {endAdornment}
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
