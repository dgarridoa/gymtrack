interface StepperProps {
  label: string;
  value: number;
  step: number;
  min?: number;
  decimals?: number;
  onChange: (value: number) => void;
}

/**
 * Mobile-first numeric stepper: big +/- tap targets (48px) with a direct
 * numeric input in the middle for fast entry of larger jumps.
 */
export default function Stepper({
  label,
  value,
  step,
  min = 0,
  decimals = 0,
  onChange,
}: StepperProps) {
  const clamp = (v: number) =>
    Math.max(min, Number(v.toFixed(decimals > 0 ? decimals : 0)));

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-steel">
        {label}
      </span>
      <div className="flex items-center overflow-hidden rounded-xl border border-line bg-card shadow-sm">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          className="h-12 w-12 shrink-0 text-2xl font-bold text-plate-red transition-colors active:bg-chalk"
          onClick={() => onChange(clamp(value - step))}
        >
          −
        </button>
        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          value={value}
          aria-label={label}
          className="h-12 w-16 border-x border-line bg-transparent text-center font-display text-2xl font-semibold text-iron outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          onChange={(e) => {
            const parsed = Number(e.target.value);
            onChange(Number.isFinite(parsed) ? clamp(parsed) : min);
          }}
          onFocus={(e) => e.target.select()}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          className="h-12 w-12 shrink-0 text-2xl font-bold text-plate-red transition-colors active:bg-chalk"
          onClick={() => onChange(clamp(value + step))}
        >
          +
        </button>
      </div>
    </div>
  );
}
