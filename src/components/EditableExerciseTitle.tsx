import { useRef, useState } from "react";

interface Props {
  name: string;
  /** Called with the trimmed new name when it changed. */
  onRename: (name: string) => void;
  /** Heading styles to match the surrounding title. */
  className?: string;
}

/**
 * Exercise title that turns into a text field on tap. Commit happens on
 * blur (Enter blurs to save); Escape flags a cancel so blur skips it.
 * Rejected renames (empty/unchanged/duplicate) just re-render `name`.
 */
export default function EditableExerciseTitle({
  name,
  onRename,
  className = "",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelled = useRef(false);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        autoFocus
        aria-label="Exercise name"
        onFocus={(e) => e.target.select()}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (cancelled.current) {
            cancelled.current = false;
            return;
          }
          const trimmed = draft.trim();
          if (trimmed && trimmed !== name) onRename(trimmed);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            inputRef.current?.blur();
          } else if (e.key === "Escape") {
            cancelled.current = true;
            inputRef.current?.blur();
          }
        }}
        className={`${className} min-w-0 border-b border-plate-red bg-transparent outline-none`}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`Rename ${name}`}
      onClick={() => {
        setDraft(name);
        setEditing(true);
      }}
      className={`${className} text-left`}
    >
      {name}
    </button>
  );
}
