export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-8 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
      {Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
          <Icon className="h-7 w-7" strokeWidth={1.5} />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
