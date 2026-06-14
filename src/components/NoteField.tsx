import { useState } from "react";

interface NoteFieldProps {
  value?: string;
  /** Called with the new text; "" means the note was cleared. */
  onChange: (note: string) => void;
  placeholder?: string;
  /** Collapsed-trigger text for the block variant. */
  label?: string;
  /** Set-level variant: icon-only trigger, tighter spacing. */
  compact?: boolean;
}

/**
 * Free-text note that stays collapsed behind a small trigger until the
 * user wants it. Used for workout, exercise and set notes. Renders the
 * textarea whenever there is text to show or the user is editing, and
 * drops the note (onChange("")) when left blank.
 */
export default function NoteField({
  value,
  onChange,
  placeholder = "Add a note…",
  label = "Note",
  compact = false,
}: NoteFieldProps) {
  const [editing, setEditing] = useState(false);
  const hasNote = !!value?.trim();

  if (!editing && !hasNote) {
    if (compact) {
      return (
        <button
          type="button"
          aria-label="Add note"
          onClick={() => setEditing(true)}
          className="h-11 w-11 shrink-0 rounded-lg text-steel transition-colors active:bg-chalk"
        >
          ✎
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="h-9 rounded-lg text-sm font-medium text-steel transition-colors active:bg-chalk"
      >
        ＋ {label}
      </button>
    );
  }

  return (
    <textarea
      value={value ?? ""}
      placeholder={placeholder}
      aria-label={label}
      rows={compact ? 1 : 2}
      autoFocus={editing}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => {
        if (!value?.trim()) onChange("");
        setEditing(false);
      }}
      className="w-full resize-none rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-iron outline-none placeholder:text-steel/70 focus:border-plate-red"
    />
  );
}
