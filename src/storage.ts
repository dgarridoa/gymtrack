import type { AppData, DraftWorkout, ExerciseLog, SetEntry } from "./types";
import { emptyData } from "./types";

const DATA_KEY = "gymtrack:data";
const DRAFT_KEY = "gymtrack:draft";

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return emptyData();
    return validateData(JSON.parse(raw));
  } catch {
    return emptyData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export function loadDraft(): DraftWorkout | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as DraftWorkout;
    if (typeof draft !== "object" || !Array.isArray(draft.exercises)) {
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function saveDraft(draft: DraftWorkout | null): void {
  if (draft === null) {
    localStorage.removeItem(DRAFT_KEY);
  } else {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }
}

/**
 * Validates an arbitrary parsed JSON value as AppData. Throws with a
 * readable message if the shape is wrong; used for both localStorage
 * loads and user-supplied import files.
 */
export function validateData(value: unknown): AppData {
  if (typeof value !== "object" || value === null) {
    throw new Error("Backup must be a JSON object.");
  }
  const obj = value as Record<string, unknown>;
  if (
    !Array.isArray(obj.exercises) ||
    !Array.isArray(obj.routines) ||
    !Array.isArray(obj.sessions)
  ) {
    throw new Error(
      "Backup must contain 'exercises', 'routines' and 'sessions' arrays.",
    );
  }
  const exercises = obj.exercises.map((e) => {
    const ex = e as Record<string, unknown>;
    if (typeof ex.id !== "string" || typeof ex.name !== "string") {
      throw new Error("Each exercise needs a string 'id' and 'name'.");
    }
    return { id: ex.id, name: ex.name };
  });
  const routines = obj.routines.map((r) => {
    const ro = r as Record<string, unknown>;
    if (
      typeof ro.id !== "string" ||
      typeof ro.name !== "string" ||
      !Array.isArray(ro.exerciseIds)
    ) {
      throw new Error(
        "Each routine needs 'id', 'name' and an 'exerciseIds' array.",
      );
    }
    return {
      id: ro.id,
      name: ro.name,
      exerciseIds: ro.exerciseIds.filter(
        (id): id is string => typeof id === "string",
      ),
    };
  });
  const sessions = obj.sessions.map((s) => {
    const se = s as Record<string, unknown>;
    if (
      typeof se.id !== "string" ||
      typeof se.startedAt !== "string" ||
      !Array.isArray(se.exercises)
    ) {
      throw new Error(
        "Each session needs 'id', 'startedAt' and an 'exercises' array.",
      );
    }
    const exerciseLogs: ExerciseLog[] = se.exercises.map((l) => {
      const log = l as Record<string, unknown>;
      if (typeof log.exerciseId !== "string" || !Array.isArray(log.sets)) {
        throw new Error(
          "Each session exercise needs 'exerciseId' and a 'sets' array.",
        );
      }
      const sets: SetEntry[] = log.sets.map((st) => {
        const set = st as Record<string, unknown>;
        if (typeof set.weight !== "number" || typeof set.reps !== "number") {
          throw new Error("Each set needs numeric 'weight' and 'reps'.");
        }
        return { weight: set.weight, reps: set.reps };
      });
      return { exerciseId: log.exerciseId, sets };
    });
    return {
      id: se.id,
      routineId: typeof se.routineId === "string" ? se.routineId : null,
      routineName: typeof se.routineName === "string" ? se.routineName : "",
      startedAt: se.startedAt,
      finishedAt:
        typeof se.finishedAt === "string" ? se.finishedAt : se.startedAt,
      exercises: exerciseLogs,
    };
  });
  return { version: 1, exercises, routines, sessions };
}

export function exportToFile(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gymtrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
