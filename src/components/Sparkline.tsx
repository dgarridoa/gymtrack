/**
 * Dependency-free SVG line chart for per-exercise progress. Plots the
 * series left-to-right and scales to the value range with padding.
 */
export default function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const w = 320;
  const h = 96;
  const pad = 8;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const x = (i: number) =>
    values.length === 1
      ? w / 2
      : pad + (i / (values.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);
  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-24 w-full"
      role="img"
      aria-label="Progress chart"
    >
      {values.length > 1 && (
        <polygon
          points={`${x(0)},${h - pad} ${points} ${x(values.length - 1)},${h - pad}`}
          fill="var(--color-plate-red)"
          opacity="0.08"
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-plate-red)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r="3.5"
          fill="var(--color-plate-red)"
        />
      ))}
    </svg>
  );
}
