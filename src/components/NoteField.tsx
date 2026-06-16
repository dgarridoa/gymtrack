import type { ExerciseLog } from "../types";

/**
 * Keys of notes that currently hold text, in the same format the screens
 * use to toggle open/closed: "workout", "ex:<id>", "set:<id>:<i>". Used to
 * seed which notes start expanded so existing notes show on open.
 */
export function notedKeys(
  note: string | undefined,
  exercises: ExerciseLog[],
): Set<string> {
  const keys = new Set<string>();
  if (note?.trim()) keys.add("workout");
  for (const log of exercises) {
    if (log.note?.trim()) keys.add(`ex:${log.exerciseId}`);
    log.sets.forEach((s, si) => {
      if (s.note?.trim()) keys.add(`set:${log.exerciseId}:${si}`);
    });
  }
  return keys;
}

interface NoteToggleProps {
  /** Accent-colored when the note has text. */
  active: boolean;
  onClick: () => void;
  /** Accessible name, e.g. "Workout note". */
  label: string;
}

/**
 * Small pencil icon that lives inside an existing row (next to a set's
 * remove button, the exercise title, or Discard). Empty notes show only
 * this icon, so they take no extra vertical space; tapping it reveals
 * the matching <NoteField> panel.
 */
export function NoteToggle({ active, onClick, label }: NoteToggleProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`h-11 w-11 shrink-0 rounded-lg transition-colors active:bg-chalk ${
        active ? "text-plate-red" : "text-steel"
      }`}
    >
      ✎
    </button>
  );
}

interface NoteFieldProps {
  value?: string;
  /** Called with the new text; "" means the note was cleared. */
  onChange: (note: string) => void;
  placeholder?: string;
  /** Accessible name for the textarea. */
  label?: string;
  /** Set-level variant: single row, tighter. */
  compact?: boolean;
  autoFocus?: boolean;
  /** Called when the field is blurred while empty, so the parent can collapse it. */
  onBlurEmpty?: () => void;
}

/**
 * Editable note textarea. The caller decides when to mount it (when the
 * note is open or non-empty); blurring it while empty clears the note
 * and asks the parent to collapse back to just the NoteToggle icon.
 */
export default function NoteField({
  value,
  onChange,
  placeholder = "Add a note…",
  label = "Note",
  compact = false,
  autoFocus = false,
  onBlurEmpty,
}: NoteFieldProps) {
  return (
    <textarea
      value={value ?? ""}
      placeholder={placeholder}
      aria-label={label}
      rows={compact ? 1 : 2}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => {
        if (!value?.trim()) {
          onChange("");
          onBlurEmpty?.();
        }
      }}
      className="w-full resize-none rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-iron outline-none placeholder:text-steel/70 focus:border-plate-red"
    />
  );
}
