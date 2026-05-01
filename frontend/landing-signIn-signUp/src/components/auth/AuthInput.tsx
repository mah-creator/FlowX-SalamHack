import type { InputHTMLAttributes } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, id, ...props }: AuthInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-blue/70"
      >
        {label}
      </label>
      <input
        id={id}
        className={[
          'w-full rounded-xl border bg-zinc-50 px-4 py-3.5 text-sm text-brand-blue placeholder:text-brand-blue/30',
          'transition-all duration-200 focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/10',
          error ? 'border-red-300 ring-2 ring-red-100' : 'border-zinc-200',
        ].join(' ')}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
