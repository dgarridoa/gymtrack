import type { ReactNode } from "react";

export type Tab = "routines" | "history" | "progress" | "data";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const icons: Record<Tab, ReactNode> = {
  routines: (
    // barbell
    <g {...stroke}>
      <path d="M3 12h2.5M18.5 12h2.5M8.5 12h7" />
      <path d="M5.5 8.5v7M18.5 8.5v7" />
      <path d="M8.5 6.5v11M15.5 6.5v11" />
    </g>
  ),
  history: (
    // clock with rewind arrow
    <g {...stroke}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6L3.5 8.5" />
      <path d="M3.5 4v4.5H8" />
      <path d="M12 8v4.5l3 2" />
    </g>
  ),
  progress: (
    // trend line
    <g {...stroke}>
      <path d="M3.5 19.5 9 13l3.5 3.5 8-9" />
      <path d="M15.5 7.5h5v5" />
    </g>
  ),
  data: (
    // archive box with down arrow
    <g {...stroke}>
      <rect x="3.5" y="4" width="17" height="5" rx="1" />
      <path d="M5.5 9v9.5a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5V9" />
      <path d="M12 12v5m0 0-2.5-2.5M12 17l2.5-2.5" />
    </g>
  ),
};

const tabs: { id: Tab; label: string }[] = [
  { id: "routines", label: "Routines" },
  { id: "history", label: "History" },
  { id: "progress", label: "Progress" },
  { id: "data", label: "Data" },
];

export default function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={active === tab.id ? "page" : undefined}
            className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              active === tab.id ? "text-plate-red" : "text-steel"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
              {icons[tab.id]}
            </svg>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
