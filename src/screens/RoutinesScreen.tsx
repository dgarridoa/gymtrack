import { useState } from "react";
import type { Exercise, Routine } from "../types";
import { uid } from "../types";
import { useStore } from "../store";
import ExerciseInput from "../components/ExerciseInput";

export default function RoutinesScreen({
  onStartWorkout,
}: {
  onStartWorkout: (routine: Routine | null) => void;
}) {
  const { data, exerciseName } = useStore();
  const [editing, setEditing] = useState<Routine | "new" | null>(null);

  if (editing !== null) {
    return (
      <RoutineEditor
        routine={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-100">Routines</h1>

      {data.routines.length === 0 && (
        <p className="rounded-xl bg-slate-800/60 p-4 text-sm text-slate-400">
          No routines yet. Create one with your usual exercises, then start a
          workout from it with one tap.
        </p>
      )}

      {data.routines.map((routine) => (
        <div
          key={routine.id}
          className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                {routine.name}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {routine.exerciseIds.length === 0
                  ? "No exercises"
                  : routine.exerciseIds.map(exerciseName).join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(routine)}
              className="h-11 shrink-0 rounded-xl px-3 text-sm font-medium text-slate-300 active:bg-slate-700"
            >
              Edit
            </button>
          </div>
          <button
            type="button"
            onClick={() => onStartWorkout(routine)}
            className="mt-3 h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white active:bg-emerald-700"
          >
            Start workout
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setEditing("new")}
        className="h-14 w-full rounded-2xl border-2 border-dashed border-slate-700 text-base font-semibold text-slate-300 active:bg-slate-800"
      >
        + New routine
      </button>

      <button
        type="button"
        onClick={() => onStartWorkout(null)}
        className="h-12 w-full rounded-xl text-sm font-medium text-slate-400 active:bg-slate-800"
      >
        Start an empty workout instead
      </button>
    </div>
  );
}

function RoutineEditor({
  routine,
  onClose,
}: {
  routine: Routine | null;
  onClose: () => void;
}) {
  const { dispatch, exerciseName } = useStore();
  const [name, setName] = useState(routine?.name ?? "");
  const [exerciseIds, setExerciseIds] = useState<string[]>(
    routine?.exerciseIds ?? [],
  );
  // Exercises created in this editor but not yet committed to the store;
  // they are persisted together with the routine on save.
  const [pending, setPending] = useState<Exercise[]>([]);

  const nameOf = (id: string) =>
    pending.find((e) => e.id === id)?.name ?? exerciseName(id);

  const move = (index: number, delta: number) => {
    const next = [...exerciseIds];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setExerciseIds(next);
  };

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({
      type: "saveRoutine",
      routine: {
        id: routine?.id ?? uid(),
        name: trimmed,
        exerciseIds,
      },
      newExercises: pending.filter((e) => exerciseIds.includes(e.id)),
    });
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">
          {routine ? "Edit routine" : "New routine"}
        </h1>
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded-xl px-3 text-sm font-medium text-slate-400 active:bg-slate-800"
        >
          Cancel
        </button>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Routine name (e.g. Push Day)"
        className="h-12 rounded-xl border border-slate-700 bg-slate-800 px-4 text-base text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500"
      />

      <div className="flex flex-col gap-2">
        {exerciseIds.map((id, i) => (
          <div
            key={id}
            className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-800/60 py-1 pl-4 pr-1"
          >
            <span className="flex-1 truncate text-base text-slate-100">
              {nameOf(id)}
            </span>
            <button
              type="button"
              aria-label="Move up"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="h-11 w-11 rounded-lg text-slate-400 disabled:opacity-30 active:bg-slate-700"
            >
              ↑
            </button>
            <button
              type="button"
              aria-label="Move down"
              onClick={() => move(i, 1)}
              disabled={i === exerciseIds.length - 1}
              className="h-11 w-11 rounded-lg text-slate-400 disabled:opacity-30 active:bg-slate-700"
            >
              ↓
            </button>
            <button
              type="button"
              aria-label="Remove exercise"
              onClick={() =>
                setExerciseIds(exerciseIds.filter((x) => x !== id))
              }
              className="h-11 w-11 rounded-lg text-rose-400 active:bg-slate-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <ExerciseInput
        excludeIds={exerciseIds}
        pendingExercises={pending}
        onAdd={(exercise, isNew) => {
          if (isNew) setPending([...pending, exercise]);
          setExerciseIds([...exerciseIds, exercise.id]);
        }}
      />

      <button
        type="button"
        onClick={save}
        disabled={!name.trim()}
        className="h-14 w-full rounded-2xl bg-emerald-600 text-lg font-semibold text-white disabled:opacity-40 active:bg-emerald-700"
      >
        Save routine
      </button>

      {routine && (
        <button
          type="button"
          onClick={() => {
            if (confirm(`Delete routine "${routine.name}"? Workout history is kept.`)) {
              dispatch({ type: "deleteRoutine", routineId: routine.id });
              onClose();
            }
          }}
          className="h-12 w-full rounded-xl text-sm font-medium text-rose-400 active:bg-slate-800"
        >
          Delete routine
        </button>
      )}
    </div>
  );
}
