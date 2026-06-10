import { useState } from "react";
import { useStore } from "../store";

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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-100">History</h1>

      {data.sessions.length === 0 && (
        <p className="rounded-xl bg-slate-800/60 p-4 text-sm text-slate-400">
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
            className="rounded-2xl border border-slate-800 bg-slate-800/60"
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : session.id)}
              className="flex min-h-16 w-full items-center justify-between gap-2 p-4 text-left"
            >
              <div>
                <h2 className="text-base font-semibold text-slate-100">
                  {session.routineName || "Workout"}
                </h2>
                <p className="text-sm text-slate-400">
                  {formatDate(session.startedAt)} · {totalSets} sets ·{" "}
                  {Math.round(volume).toLocaleString()} kg volume
                </p>
              </div>
              <span className="text-slate-500">{open ? "▴" : "▾"}</span>
            </button>

            {open && (
              <div className="border-t border-slate-700/60 p-4 pt-3">
                {session.exercises.map((log) => (
                  <div key={log.exerciseId} className="mb-3 last:mb-0">
                    <h3 className="text-sm font-semibold text-slate-200">
                      {exerciseName(log.exerciseId)}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {log.sets
                        .map((s) => `${s.weight}kg × ${s.reps}`)
                        .join("  ·  ")}
                    </p>
                  </div>
                ))}
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
                  className="mt-2 h-11 rounded-xl px-3 text-sm font-medium text-rose-400 active:bg-slate-700"
                >
                  Delete workout
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
