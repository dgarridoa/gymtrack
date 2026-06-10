import { useState } from "react";
import type { Exercise } from "../types";
import { uid } from "../types";
import { useStore } from "../store";

/**
 * Text input with suggestions from the existing exercise catalog.
 * Reuses a matching exercise (case-insensitive) so progress history
 * stays linked; otherwise reports a brand-new exercise via isNew.
 */
export default function ExerciseInput({
  excludeIds,
  pendingExercises = [],
  onAdd,
}: {
  excludeIds: string[];
  pendingExercises?: Exercise[];
  onAdd: (exercise: Exercise, isNew: boolean) => void;
}) {
  const { data } = useStore();
  const [name, setName] = useState("");
  const catalog = [...data.exercises, ...pendingExercises];
  const suggestions = catalog.filter((e) => !excludeIds.includes(e.id));

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = catalog.find(
      (e) => e.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing && excludeIds.includes(existing.id)) {
      setName("");
      return;
    }
    onAdd(existing ?? { id: uid(), name: trimmed }, !existing);
    setName("");
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        list="exercise-suggestions"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") add();
        }}
        placeholder="Exercise name (e.g. Squat)"
        className="h-12 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 text-base text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500"
      />
      <datalist id="exercise-suggestions">
        {suggestions.map((e) => (
          <option key={e.id} value={e.name} />
        ))}
      </datalist>
      <button
        type="button"
        onClick={add}
        disabled={!name.trim()}
        className="h-12 shrink-0 rounded-xl bg-emerald-600 px-5 text-base font-semibold text-white disabled:opacity-40 active:bg-emerald-700"
      >
        Add
      </button>
    </div>
  );
}
