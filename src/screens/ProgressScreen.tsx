import { useState } from "react";
import { useStore } from "../store";
import Sparkline from "../components/Sparkline";

export default function ProgressScreen() {
  const { data } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Only show exercises that actually appear in logged sessions.
  const loggedIds = new Set(
    data.sessions.flatMap((s) => s.exercises.map((e) => e.exerciseId)),
  );
  const exercises = data.exercises.filter((e) => loggedIds.has(e.id));
  const selected =
    exercises.find((e) => e.id === selectedId) ?? exercises[0] ?? null;

  // Sessions are stored newest-first; chart oldest → newest.
  const history = selected
    ? [...data.sessions]
        .reverse()
        .flatMap((session) => {
          const log = session.exercises.find(
            (e) => e.exerciseId === selected.id,
          );
          if (!log || log.sets.length === 0) return [];
          const best = log.sets.reduce((a, b) =>
            b.weight > a.weight ? b : a,
          );
          const volume = log.sets.reduce(
            (v, s) => v + s.weight * s.reps,
            0,
          );
          return [{ date: session.startedAt, best, volume }];
        })
    : [];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-4xl font-bold uppercase">Progress</h1>

      {exercises.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card p-4 text-sm text-steel shadow-sm">
          Log a few workouts and your progress per exercise will show up here.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {exercises.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelectedId(e.id)}
                className={`h-11 rounded-full px-4 text-sm font-semibold transition-colors ${
                  selected?.id === e.id
                    ? "bg-iron text-chalk"
                    : "border border-line bg-card text-steel"
                }`}
              >
                {e.name}
              </button>
            ))}
          </div>

          {selected && history.length > 0 && (
            <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
              <h2 className="font-display text-xl font-semibold uppercase">
                {selected.name} — top set
              </h2>
              <Sparkline values={history.map((h) => h.best.weight)} />
              <div className="mt-2 flex flex-col gap-1">
                {[...history].reverse().map((h, i) => (
                  <div
                    key={i}
                    className="flex justify-between border-t border-line py-2 text-sm first:border-t-0"
                  >
                    <span className="text-steel">
                      {new Date(h.date).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-medium text-iron">
                      {h.best.weight}kg × {h.best.reps}
                      <span className="ml-2 text-steel">
                        {Math.round(h.volume).toLocaleString()}kg vol
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
