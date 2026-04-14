import clsx from 'clsx';

const buttonStyles = {
  primary:
    'bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 text-slate-950 shadow-glow hover:brightness-110',
  secondary: 'bg-white/[0.08] text-slate-100 border border-white/10 hover:bg-white/[0.12]',
  danger: 'bg-rose-500/90 text-white hover:bg-rose-500',
  ghost: 'text-slate-200 hover:bg-white/[0.08]',
};

function Button({ className, variant = 'primary', size = 'md', children, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && buttonStyles.primary,
        variant === 'secondary' && buttonStyles.secondary,
        variant === 'danger' && buttonStyles.danger,
        variant === 'ghost' && buttonStyles.ghost,
        size === 'sm' && 'px-3 py-2 text-sm',
        size === 'md' && 'px-4 py-3 text-sm',
        size === 'lg' && 'px-5 py-4 text-base',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;