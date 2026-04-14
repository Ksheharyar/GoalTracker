import clsx from 'clsx';

function Input({ label, error, className, ...props }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-300">
      {label ? <span className="font-medium text-slate-200">{label}</span> : null}
      <input
        className={clsx(
          'rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20',
          error && 'border-rose-400/70 focus:border-rose-400',
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}

export default Input;