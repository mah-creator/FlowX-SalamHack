export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="h-px flex-1 bg-zinc-200" />
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
        or
      </span>
      <div className="h-px flex-1 bg-zinc-200" />
    </div>
  );
}
