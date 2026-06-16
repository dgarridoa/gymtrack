import { useState } from "react";
import type { Exercise, ExerciseLog, Session, SetEntry } from "../types";
import { useStore } from "../store";
import Stepper from "./Stepper";
import ExerciseInput from "./ExerciseInput";
import PlateStack from "./PlateStack";
import NoteField, { NoteToggle } from "./NoteField";

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
  const [note, setNote] = useState<string | undefined>(session.note);
  // Keys of empty-but-expanded notes (notes with text always show).
  const [openNotes, setOpenNotes] = useState<Set<string>>(new Set());
  const toggleNote = (key: string) =>
    setOpenNotes((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  const closeNote = (key: string) =>
    setOpenNotes((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });

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
            <div className="flex items-center gap-1">
              <NoteToggle
                label="Exercise note"
                active={openNotes.has(`ex:${log.exerciseId}`) || !!log.note?.trim()}
                onClick={() => toggleNote(`ex:${log.exerciseId}`)}
              />
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
          </div>

          {(openNotes.has(`ex:${log.exerciseId}`) || log.note?.trim()) && (
            <div className="mt-1">
              <NoteField
                label="Exercise note"
                placeholder="Form cue, setup, tempo…"
                value={log.note}
                autoFocus={
                  openNotes.has(`ex:${log.exerciseId}`) && !log.note?.trim()
                }
                onChange={(n) => updateLog(i, { ...log, note: n })}
                onBlurEmpty={() => closeNote(`ex:${log.exerciseId}`)}
              />
            </div>
          )}

          {log.sets.map((set, si) => (
            <div key={si} className="mt-2 border-t border-line pt-2">
              <div className="flex min-h-11 items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-steel">
                  Set {si + 1}
                </span>
                <div className="flex min-w-0 flex-1 justify-end overflow-hidden">
                  <PlateStack weight={set.weight} />
                </div>
                <NoteToggle
                  label={`Note for set ${si + 1}`}
                  active={
                    openNotes.has(`set:${log.exerciseId}:${si}`) ||
                    !!set.note?.trim()
                  }
                  onClick={() => toggleNote(`set:${log.exerciseId}:${si}`)}
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
              {(openNotes.has(`set:${log.exerciseId}:${si}`) ||
                set.note?.trim()) && (
                <div className="mt-1">
                  <NoteField
                    compact
                    label={`Note for set ${si + 1}`}
                    placeholder="Note for this set…"
                    value={set.note}
                    autoFocus={
                      openNotes.has(`set:${log.exerciseId}:${si}`) &&
                      !set.note?.trim()
                    }
                    onChange={(n) =>
                      updateLog(i, {
                        ...log,
                        sets: log.sets.map((s, j) =>
                          j === si ? { ...s, note: n } : s,
                        ),
                      })
                    }
                    onBlurEmpty={() => closeNote(`set:${log.exerciseId}:${si}`)}
                  />
                </div>
              )}
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

      {(openNotes.has("workout") || note?.trim()) && (
        <div className="mt-4">
          <NoteField
            label="Workout note"
            placeholder="How did this session feel?"
            value={note}
            autoFocus={openNotes.has("workout") && !note?.trim()}
            onChange={(n) => setNote(n)}
            onBlurEmpty={() => closeNote("workout")}
          />
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <NoteToggle
          label="Workout note"
          active={openNotes.has("workout") || !!note?.trim()}
          onClick={() => toggleNote("workout")}
        />
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
              note: note?.trim() ? note : undefined,
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
