/**
 * Dependency-free SVG line chart for per-exercise progress.
 *
 * The y-domain is padded (a fixed ±2.5 when all values are equal) so a
 * constant series renders as a centered, labeled line instead of an
 * unreadable flat line on the chart edge. Gridlines mark the actual
 * data min/max with unit labels, and the best value is ringed as a PR.
 */
export default function Sparkline({
  values,
  unit = "kg",
}: {
  values: number[];
  unit?: string;
}) {
  if (values.length === 0) return null;
  const w = 320;
  const h = 110;
  const padTop = 18;
  const padBottom = 10;
  const padLeft = 38;
  const padRight = 12;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const lo = span === 0 ? min - 2.5 : min - span * 0.12;
  const hi = span === 0 ? max + 2.5 : max + span * 0.12;

  const x = (i: number) =>
    values.length === 1
      ? padLeft + (w - padLeft - padRight) / 2
      : padLeft + (i / (values.length - 1)) * (w - padLeft - padRight);
  const y = (v: number) =>
    padTop + ((hi - v) / (hi - lo)) * (h - padTop - padBottom);

  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const prIndex = values.indexOf(max);
  const prX = x(prIndex);
  const prY = y(prIndex);
  const prOnLeft = prX < w / 2;
  const gridValues = span === 0 ? [max] : [max, min];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-28 w-full"
      role="img"
      aria-label={`Progress chart, best ${max}${unit}`}
    >
      {gridValues.map((v) => (
        <g key={v}>
          <line
            x1={padLeft}
            x2={w - padRight}
            y1={y(v)}
            y2={y(v)}
            stroke="var(--color-line)"
            strokeWidth="1"
          />
          <text
            x={padLeft - 6}
            y={y(v)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="10"
            fill="var(--color-steel)"
          >
            {String(v)}
          </text>
        </g>
      ))}
      {values.length > 1 && (
        <polygon
          points={`${x(0)},${h - padBottom} ${points} ${x(values.length - 1)},${h - padBottom}`}
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
          r="3"
          fill="var(--color-plate-red)"
        />
      ))}
      <circle
        cx={prX}
        cy={prY}
        r="6"
        fill="none"
        stroke="var(--color-plate-red)"
        strokeWidth="2"
      />
      <text
        x={prOnLeft ? prX + 10 : prX - 10}
        y={Math.max(prY - 10, 10)}
        textAnchor={prOnLeft ? "start" : "end"}
        fontSize="10"
        fontWeight="600"
        fill="var(--color-plate-red)"
      >
        PR {String(max)}
        {unit}
      </text>
    </svg>
  );
}
