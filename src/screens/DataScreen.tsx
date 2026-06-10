import { useRef, useState } from "react";
import { useStore } from "../store";
import { exportToFile, validateData } from "../storage";

export default function DataScreen() {
  const { data, dispatch } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);

  const handleImport = async (file: File) => {
    try {
      const imported = validateData(JSON.parse(await file.text()));
      const summary = `${imported.routines.length} routines, ${imported.sessions.length} workouts, ${imported.exercises.length} exercises`;
      if (
        !confirm(
          `Replace all current data with this backup (${summary})? This cannot be undone.`,
        )
      ) {
        return;
      }
      dispatch({ type: "importData", data: imported });
      setMessage({ kind: "ok", text: `Imported ${summary}.` });
    } catch (err) {
      setMessage({
        kind: "error",
        text: `Import failed: ${err instanceof Error ? err.message : "invalid file."}`,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-4xl font-bold uppercase">Data</h1>

      <p className="rounded-2xl border border-line bg-card p-4 text-sm text-steel shadow-sm">
        Everything is stored locally in this browser ({data.routines.length}{" "}
        routines, {data.sessions.length} workouts). Export a JSON backup before
        clearing browser data or switching devices.
      </p>

      <button
        type="button"
        onClick={() => exportToFile(data)}
        className="h-14 w-full rounded-2xl bg-plate-red text-lg font-semibold text-white transition-colors active:bg-plate-red-deep"
      >
        Export backup (JSON)
      </button>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="h-14 w-full rounded-2xl border border-line bg-card text-lg font-semibold text-iron shadow-sm transition-colors active:bg-chalk"
      >
        Import backup
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImport(file);
          e.target.value = "";
        }}
      />

      {message && (
        <p
          role="status"
          className={`rounded-2xl p-4 text-sm font-medium ${
            message.kind === "ok"
              ? "bg-plate-green/10 text-plate-green"
              : "bg-plate-red/10 text-plate-red"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
