import type { ExerciseLog, SetEntry } from "../types";
import { useStore } from "../store";
import Stepper from "../components/Stepper";
import ExerciseInput from "../components/ExerciseInput";

export default function WorkoutScreen({ onDone }: { onDone: () => void }) {
  const { data, draft, dispatch, exerciseName } = useStore();
  if (!draft) return null;

  const update = (exercises: ExerciseLog[]) =>
    dispatch({ type: "updateDraft", exercises });

  const updateLog = (index: number, log: ExerciseLog) =>
    update(draft.exercises.map((l, i) => (i === index ? log : l)));

  /** Seed a new set from the last set this workout, or the most recent
   *  session containing the exercise, so steppers start near target. */
  const seedSet = (log: ExerciseLog): SetEntry => {
    const last = log.sets[log.sets.length - 1];
    if (last) return { ...last };
    for (const session of data.sessions) {
      const prev = session.exercises.find(
        (e) => e.exerciseId === log.exerciseId,
      );
      const prevLast = prev?.sets[prev.sets.length - 1];
      if (prevLast) return { ...prevLast };
    }
    return { weight: 20, reps: 8 };
  };

  const loggedSets = draft.exercises.reduce(
    (n, log) => n + log.sets.filter((s) => s.reps > 0).length,
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            {draft.routineName}
          </h1>
          <p className="text-sm text-slate-400">
            Started{" "}
            {new Date(draft.startedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" · "}
            {loggedSets} set{loggedSets === 1 ? "" : "s"} logged
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Discard this workout? Logged sets will be lost.")) {
              dispatch({ type: "cancelWorkout" });
              onDone();
            }
          }}
          className="h-11 rounded-xl px-3 text-sm font-medium text-rose-400 active:bg-slate-800"
        >
          Discard
        </button>
      </div>

      {draft.exercises.map((log, i) => (
        <section
          key={log.exerciseId}
          className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">
              {exerciseName(log.exerciseId)}
            </h2>
            {log.sets.length === 0 && (
              <button
                type="button"
                aria-label="Remove exercise"
                onClick={() =>
                  update(draft.exercises.filter((_, j) => j !== i))
                }
                className="h-11 w-11 rounded-lg text-slate-500 active:bg-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          {log.sets.map((set, si) => (
            <div
              key={si}
              className="mt-3 flex items-end justify-between gap-2 border-t border-slate-700/60 pt-3"
            >
              <span className="mb-3 w-6 text-sm font-bold text-slate-500">
                {si + 1}
              </span>
              <Stepper
                label="kg"
                value={set.weight}
                step={2.5}
                decimals={2}
                onChange={(weight) =>
                  updateLog(i, {
                    ...log,
                    sets: log.sets.map((s, j) =>
                      j === si ? { ...s, weight } : s,
                    ),
                  })
                }
              />
              <Stepper
                label="reps"
                value={set.reps}
                step={1}
                onChange={(reps) =>
                  updateLog(i, {
                    ...log,
                    sets: log.sets.map((s, j) =>
                      j === si ? { ...s, reps } : s,
                    ),
                  })
                }
              />
              <button
                type="button"
                aria-label={`Remove set ${si + 1}`}
                onClick={() =>
                  updateLog(i, {
                    ...log,
                    sets: log.sets.filter((_, j) => j !== si),
                  })
                }
                className="mb-1 h-11 w-8 rounded-lg text-slate-500 active:bg-slate-700"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              updateLog(i, { ...log, sets: [...log.sets, seedSet(log)] })
            }
            className="mt-3 h-12 w-full rounded-xl border border-slate-700 text-base font-semibold text-emerald-400 active:bg-slate-700"
          >
            + Add set
          </button>
        </section>
      ))}

      <ExerciseInput
        excludeIds={draft.exercises.map((l) => l.exerciseId)}
        onAdd={(exercise, isNew) =>
          dispatch({ type: "addDraftExercise", exercise, isNew })
        }
      />

      <button
        type="button"
        onClick={() => {
          dispatch({ type: "finishWorkout" });
          onDone();
        }}
        disabled={loggedSets === 0}
        className="h-14 w-full rounded-2xl bg-emerald-600 text-lg font-semibold text-white disabled:opacity-40 active:bg-emerald-700"
      >
        Finish workout
      </button>
    </div>
  );
}
