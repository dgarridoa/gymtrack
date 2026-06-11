import { useState } from "react";
import type { Exercise, ExerciseLog, Session, SetEntry } from "../types";
import { useStore } from "../store";
import Stepper from "./Stepper";
import ExerciseInput from "./ExerciseInput";
import PlateStack from "./PlateStack";

/**
 * Inline editor for a logged session: change sets, add/remove sets and
 * exercises. Edits stay local until Save commits them to the store.
 */
export default function SessionEditor({
  session,
  onClose,
}: {
  session: Session;
  onClose: () => void;
}) {
  const { dispatch, exerciseName } = useStore();
  const [exercises, setExercises] = useState<ExerciseLog[]>(() =>
    session.exercises.map((log) => ({
      ...log,
      sets: log.sets.map((s) => ({ ...s })),
    })),
  );
  // Brand-new exercises typed in during editing, committed on save.
  const [newExercises, setNewExercises] = useState<Exercise[]>([]);

  const name = (id: string) =>
    newExercises.find((e) => e.id === id)?.name ?? exerciseName(id);

  const updateLog = (index: number, log: ExerciseLog) =>
    setExercises(exercises.map((l, i) => (i === index ? log : l)));

  const seedSet = (log: ExerciseLog): SetEntry => {
    const last = log.sets[log.sets.length - 1];
    return last ? { ...last } : { weight: 20, reps: 8 };
  };

  const loggedSets = exercises.reduce(
    (n, log) => n + log.sets.filter((s) => s.reps > 0).length,
    0,
  );

  return (
    <div className="border-t border-line p-4 pt-3">
      {exercises.map((log, i) => (
        <div key={log.exerciseId} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold uppercase">
              {name(log.exerciseId)}
            </h3>
            {log.sets.length === 0 && (
              <button
                type="button"
                aria-label="Remove exercise"
                onClick={() =>
                  setExercises(exercises.filter((_, j) => j !== i))
                }
                className="h-11 w-11 rounded-lg text-steel transition-colors active:bg-chalk"
              >
                ✕
              </button>
            )}
          </div>

          {log.sets.map((set, si) => (
            <div key={si} className="mt-2 border-t border-line pt-2">
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
            className="mt-2 h-11 w-full rounded-xl border border-line text-sm font-semibold text-plate-red transition-colors active:bg-chalk"
          >
            + Add set
          </button>
        </div>
      ))}

      <div className="mt-4">
        <ExerciseInput
          excludeIds={exercises.map((l) => l.exerciseId)}
          pendingExercises={newExercises}
          onAdd={(exercise, isNew) => {
            if (isNew) setNewExercises([...newExercises, exercise]);
            setExercises([
              ...exercises,
              { exerciseId: exercise.id, sets: [] },
            ]);
          }}
        />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-12 flex-1 rounded-xl border border-line text-base font-semibold text-iron transition-colors active:bg-chalk"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={loggedSets === 0}
          onClick={() => {
            dispatch({
              type: "updateSession",
              sessionId: session.id,
              exercises,
              newExercises,
            });
            onClose();
          }}
          className="h-12 flex-1 rounded-xl bg-plate-red text-base font-semibold text-on-red transition-colors disabled:opacity-40 active:bg-plate-red-deep"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
