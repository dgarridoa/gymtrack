import { useState } from "react";

interface StepperProps {
  label: string;
  value: number;
  step: number;
  min?: number;
  decimals?: number;
  onChange: (value: number) => void;
}

/**
 * Mobile-first numeric stepper: big +/- tap targets (44px+) with a
 * direct numeric input in the middle for fast entry of larger jumps.
 * Fills its container width so rows of steppers fit narrow screens.
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

  // Raw text while the field is focused, so it can be empty or hold
  // intermediate input ("62.") without the committed number being
  // written back into it (which caused stray leading zeros).
  const [text, setText] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col items-center gap-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-steel">
        {label}
      </span>
      <div className="flex w-full items-center overflow-hidden rounded-xl border border-line bg-card shadow-sm">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          className="h-12 w-11 shrink-0 text-2xl font-bold text-plate-red transition-colors active:bg-chalk"
          onClick={() => onChange(clamp(value - step))}
        >
          −
        </button>
        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          value={text ?? String(value)}
          aria-label={label}
          className="h-12 min-w-0 flex-1 border-x border-line bg-transparent text-center font-display text-2xl font-semibold text-iron outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          onChange={(e) => {
            setText(e.target.value);
            const parsed = Number(e.target.value);
            if (e.target.value !== "" && Number.isFinite(parsed)) {
              onChange(clamp(parsed));
            }
          }}
          onFocus={(e) => {
            // Start from a blank field when the value is 0; select()
            // is unreliable for number inputs on mobile Safari.
            setText(value === 0 ? "" : String(value));
            e.target.select();
          }}
          onBlur={() => setText(null)}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          className="h-12 w-11 shrink-0 text-2xl font-bold text-plate-red transition-colors active:bg-chalk"
          onClick={() => onChange(clamp(value + step))}
        >
          +
        </button>
      </div>
    </div>
  );
}
