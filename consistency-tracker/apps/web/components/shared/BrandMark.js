function BrandMark({ className = '', showLabel = true, size = 40 }) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <div
        className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-teal-300 to-emerald-300 text-slate-950 shadow-glow"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 48 48" className="h-[70%] w-[70%]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M13 29.5C13 23.701 17.701 19 23.5 19H35"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M26.5 13.5L35.5 19L26.5 24.5"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 33.5L21 38.5L32.5 27"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showLabel ? (
        <div className="leading-tight">
          <p className="font-display text-lg font-semibold tracking-tight text-white">GoalTracker</p>
        </div>
      ) : null}
    </div>
  );
}

export default BrandMark;