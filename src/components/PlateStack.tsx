interface Plate {
  kg: number;
  color: string;
  h: number;
  outlined?: boolean;
}

// IWF competition plate colors, largest first for greedy loading.
const PLATES: Plate[] = [
  { kg: 25, color: "var(--color-plate-red)", h: 24 },
  { kg: 20, color: "var(--color-plate-blue)", h: 22 },
  { kg: 15, color: "var(--color-plate-yellow)", h: 20 },
  { kg: 10, color: "var(--color-plate-green)", h: 17 },
  { kg: 5, color: "#ffffff", h: 14, outlined: true },
  { kg: 2.5, color: "var(--color-iron)", h: 11 },
  { kg: 1.25, color: "#9aa0a8", h: 9 },
];

const MAX_PLATES = 8;

/**
 * Renders how to load one side of a 20kg bar for the given total
 * weight, using competition plate colors. Returns nothing when the
 * weight can't be plated (≤ bar weight or below the smallest plate).
 */
export default function PlateStack({
  weight,
  bar = 20,
}: {
  weight: number;
  bar?: number;
}) {
  let perSide = (weight - bar) / 2;
  if (perSide <= 0) return null;

  const stack: Plate[] = [];
  for (const plate of PLATES) {
    while (perSide >= plate.kg && stack.length < MAX_PLATES) {
      stack.push(plate);
      perSide -= plate.kg;
    }
  }
  if (stack.length === 0) return null;

  const label = stack.map((p) => p.kg).join(" · ");

  return (
    <div
      className="flex items-center gap-2"
      title={`Plates per side on a ${bar}kg bar`}
    >
      <div className="flex h-6 items-center gap-[3px]">
        {/* bar sleeve */}
        <span className="h-[5px] w-3 rounded-sm bg-steel/50" />
        {stack.map((p, i) => (
          <span
            key={i}
            className="w-[5px] rounded-[2px]"
            style={{
              height: p.h,
              background: p.color,
              boxShadow: p.outlined
                ? "inset 0 0 0 1px var(--color-line)"
                : undefined,
            }}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-steel">
        {label} / side{stack.length === MAX_PLATES && perSide > 0 ? " +" : ""}
      </span>
    </div>
  );
}
