export type Tab = "routines" | "history" | "progress" | "data";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "routines", label: "Routines", icon: "🏋️" },
  { id: "history", label: "History", icon: "🗓️" },
  { id: "progress", label: "Progress", icon: "📈" },
  { id: "data", label: "Data", icon: "💾" },
];

export default function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-slate-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
              active === tab.id ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            <span className="text-xl" aria-hidden>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
