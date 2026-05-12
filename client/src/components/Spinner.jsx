export default function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-400"
        role="status"
        aria-label={label || "Loading"}
      />
      {label ? <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p> : null}
    </div>
  );
}
