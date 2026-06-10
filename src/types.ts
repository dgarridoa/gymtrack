export interface Exercise {
  id: string;
  name: string;
}

export interface Routine {
  id: string;
  name: string;
  exerciseIds: string[];
}

export interface SetEntry {
  weight: number;
  reps: number;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetEntry[];
}

export interface Session {
  id: string;
  routineId: string | null;
  routineName: string;
  startedAt: string;
  finishedAt: string;
  exercises: ExerciseLog[];
}

export interface DraftWorkout {
  routineId: string | null;
  routineName: string;
  startedAt: string;
  exercises: ExerciseLog[];
}

export interface AppData {
  version: 1;
  exercises: Exercise[];
  routines: Routine[];
  sessions: Session[];
}

export const emptyData = (): AppData => ({
  version: 1,
  exercises: [],
  routines: [],
  sessions: [],
});

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}
