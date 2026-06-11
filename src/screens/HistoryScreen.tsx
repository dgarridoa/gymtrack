import { useState } from "react";
import { useStore } from "../store";
import SessionEditor from "../components/SessionEditor";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function HistoryScreen() {
  const { data, dispatch, exerciseName } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-4xl font-bold uppercase">History</h1>

      {data.sessions.length === 0 && (
        <p className="rounded-2xl border border-line bg-card p-4 text-sm text-steel shadow-sm">
          No workouts logged yet. Start one from the Routines tab.
        </p>
      )}

      {data.sessions.map((session) => {
        const totalSets = session.exercises.reduce(
          (n, e) => n + e.sets.length,
          0,
        );
        const volume = session.exercises.reduce(
          (v, e) => v + e.sets.reduce((s, set) => s + set.weight * set.reps, 0),
          0,
        );
        const open = openId === session.id;
        return (
          <div
            key={session.id}
            className="rounded-2xl border border-line bg-card shadow-sm"
          >
            <button
              type="button"
              onClick={() => {
                setOpenId(open ? null : session.id);
                setEditingId(null);
              }}
              className="flex min-h-16 w-full items-center justify-between gap-2 p-4 text-left"
            >
              <div>
                <h2 className="font-display text-xl font-semibold uppercase">
                  {session.routineName || "Workout"}
                </h2>
                <p className="text-sm text-steel">
                  {formatDate(session.startedAt)} · {totalSets} sets ·{" "}
                  {Math.round(volume).toLocaleString()} kg volume
                </p>
              </div>
              <span className="text-steel">{open ? "▴" : "▾"}</span>
            </button>

            {open && editingId === session.id && (
              <SessionEditor
                session={session}
                onClose={() => setEditingId(null)}
              />
            )}

            {open && editingId !== session.id && (
              <div className="border-t border-line p-4 pt-3">
                {session.exercises.map((log) => (
                  <div key={log.exerciseId} className="mb-3 last:mb-0">
                    <h3 className="text-sm font-semibold text-iron">
                      {exerciseName(log.exerciseId)}
                    </h3>
                    <p className="text-sm text-steel">
                      {log.sets
                        .map((s) => `${s.weight}kg × ${s.reps}`)
                        .join("  ·  ")}
                    </p>
                  </div>
                ))}
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(session.id)}
                    className="h-11 rounded-xl px-3 text-sm font-semibold text-iron transition-colors active:bg-chalk"
                  >
                    Edit workout
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this workout from history?")) {
                        dispatch({
                          type: "deleteSession",
                          sessionId: session.id,
                        });
                      }
                    }}
                    className="h-11 rounded-xl px-3 text-sm font-semibold text-plate-red transition-colors active:bg-chalk"
                  >
                    Delete workout
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
