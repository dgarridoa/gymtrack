import type { ExerciseLog, SetEntry } from "../types";
import { useStore } from "../store";
import Stepper from "../components/Stepper";
import ExerciseInput from "../components/ExerciseInput";
import PlateStack from "../components/PlateStack";

export default function WorkoutScreen({ onDone }: { onDone: () => void }) {
  const { data, draft, dispatch, exerciseName } = useStore();
  if (!draft) return null;

  const update = (exercises: ExerciseLog[]) =>
    dispatch({ type: "updateDraft", exercises });

  const updateLog = (index: number, log: ExerciseLog) =>
    update(draft.exercises.map((l, i) => (i === index ? log : l)));

  /** Sets from the most recent session containing the exercise. */
  const lastSessionSets = (exerciseId: string): SetEntry[] | null => {
    for (const session of data.sessions) {
      const prev = session.exercises.find((e) => e.exerciseId === exerciseId);
      if (prev && prev.sets.length > 0) return prev.sets;
    }
    return null;
  };

  /** Seed a new set from the last set this workout, or the most recent
   *  session containing the exercise, so steppers start near target. */
  const seedSet = (log: ExerciseLog): SetEntry => {
    const last = log.sets[log.sets.length - 1];
    if (last) return { ...last };
    const prevSets = lastSessionSets(log.exerciseId);
    if (prevSets) return { ...prevSets[prevSets.length - 1] };
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
          <h1 className="font-display text-4xl font-bold uppercase">
            {draft.routineName}
          </h1>
          <p className="text-sm text-steel">
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
          className="h-11 rounded-xl px-3 text-sm font-semibold text-plate-red transition-colors active:bg-card"
        >
          Discard
        </button>
      </div>

      {draft.exercises.map((log, i) => {
        const prevSets = lastSessionSets(log.exerciseId);
        return (
        <section
          key={log.exerciseId}
          className="rounded-2xl border border-line bg-card p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold uppercase">
              {exerciseName(log.exerciseId)}
            </h2>
            {log.sets.length === 0 && (
              <button
                type="button"
                aria-label="Remove exercise"
                onClick={() =>
                  update(draft.exercises.filter((_, j) => j !== i))
                }
                className="h-11 w-11 rounded-lg text-steel transition-colors active:bg-chalk"
              >
                ✕
              </button>
            )}
          </div>
          {prevSets && (
            <p className="text-sm text-steel">
              Last time:{" "}
              {prevSets.map((s) => `${s.weight}kg × ${s.reps}`).join(" · ")}
            </p>
          )}

          {log.sets.map((set, si) => (
            <div key={si} className="mt-3 border-t border-line pt-2">
              <div className="flex min-h-11 items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-steel">
                  Set {si + 1}
                </span>
                <div className="flex min-w-0 flex-1 justify-end overflow-hidden">
                  <PlateStack weight={set.weight} />
                </div>
                <button
                  type="button"
                  aria-label={`Remove set ${si + 1}`}
                  onClick={() =>
                    updateLog(i, {
                      ...log,
                      sets: log.sets.filter((_, j) => j !== si),
                    })
                  }
                  className="h-11 w-11 shrink-0 rounded-lg text-steel transition-colors active:bg-chalk"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
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
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              updateLog(i, { ...log, sets: [...log.sets, seedSet(log)] })
            }
            className="mt-3 h-12 w-full rounded-xl border border-line text-base font-semibold text-plate-red transition-colors active:bg-chalk"
          >
            + Add set
          </button>
        </section>
        );
      })}

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
        className="h-14 w-full rounded-2xl bg-plate-red text-lg font-semibold text-on-red transition-colors disabled:opacity-40 active:bg-plate-red-deep"
      >
        Finish workout
      </button>
    </div>
  );
}
