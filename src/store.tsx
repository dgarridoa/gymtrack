import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import type {
  AppData,
  DraftWorkout,
  Exercise,
  ExerciseLog,
  Routine,
  Session,
} from "./types";
import { uid } from "./types";
import { loadData, loadDraft, saveData, saveDraft } from "./storage";

interface State {
  data: AppData;
  draft: DraftWorkout | null;
}

type Action =
  | { type: "saveRoutine"; routine: Routine; newExercises: Exercise[] }
  | { type: "deleteRoutine"; routineId: string }
  | { type: "startWorkout"; routine: Routine | null }
  | { type: "updateDraft"; exercises: ExerciseLog[] }
  | { type: "setDraftNote"; note: string }
  | { type: "addDraftExercise"; exercise: Exercise; isNew: boolean }
  | { type: "cancelWorkout" }
  | { type: "finishWorkout" }
  | { type: "deleteSession"; sessionId: string }
  | {
      type: "updateSession";
      sessionId: string;
      exercises: ExerciseLog[];
      newExercises: Exercise[];
      note?: string;
    }
  | { type: "importData"; data: AppData };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "saveRoutine": {
      const exists = state.data.routines.some(
        (r) => r.id === action.routine.id,
      );
      return {
        ...state,
        data: {
          ...state.data,
          exercises: [...state.data.exercises, ...action.newExercises],
          routines: exists
            ? state.data.routines.map((r) =>
                r.id === action.routine.id ? action.routine : r,
              )
            : [...state.data.routines, action.routine],
        },
      };
    }
    case "deleteRoutine":
      return {
        ...state,
        data: {
          ...state.data,
          routines: state.data.routines.filter(
            (r) => r.id !== action.routineId,
          ),
        },
      };
    case "startWorkout": {
      const draft: DraftWorkout = {
        routineId: action.routine?.id ?? null,
        routineName: action.routine?.name ?? "Quick workout",
        startedAt: new Date().toISOString(),
        exercises:
          action.routine?.exerciseIds.map((exerciseId) => ({
            exerciseId,
            sets: [],
          })) ?? [],
      };
      return { ...state, draft };
    }
    case "updateDraft":
      if (!state.draft) return state;
      return {
        ...state,
        draft: { ...state.draft, exercises: action.exercises },
      };
    case "setDraftNote":
      if (!state.draft) return state;
      return {
        ...state,
        draft: { ...state.draft, note: action.note },
      };
    case "addDraftExercise": {
      if (!state.draft) return state;
      return {
        data: action.isNew
          ? {
              ...state.data,
              exercises: [...state.data.exercises, action.exercise],
            }
          : state.data,
        draft: {
          ...state.draft,
          exercises: [
            ...state.draft.exercises,
            { exerciseId: action.exercise.id, sets: [] },
          ],
        },
      };
    }
    case "cancelWorkout":
      return { ...state, draft: null };
    case "finishWorkout": {
      if (!state.draft) return state;
      const logged = state.draft.exercises
        .map((log) => ({
          ...log,
          sets: log.sets.filter((s) => s.reps > 0),
        }))
        .filter((log) => log.sets.length > 0);
      if (logged.length === 0) return { ...state, draft: null };
      const session: Session = {
        id: uid(),
        routineId: state.draft.routineId,
        routineName: state.draft.routineName,
        startedAt: state.draft.startedAt,
        finishedAt: new Date().toISOString(),
        exercises: logged,
        note: state.draft.note,
      };
      return {
        draft: null,
        data: { ...state.data, sessions: [session, ...state.data.sessions] },
      };
    }
    case "deleteSession":
      return {
        ...state,
        data: {
          ...state.data,
          sessions: state.data.sessions.filter(
            (s) => s.id !== action.sessionId,
          ),
        },
      };
    case "updateSession": {
      // Drop empty sets and exercises, like finishWorkout does.
      const logged = action.exercises
        .map((log) => ({
          ...log,
          sets: log.sets.filter((s) => s.reps > 0),
        }))
        .filter((log) => log.sets.length > 0);
      if (logged.length === 0) return state;
      const kept = action.newExercises.filter((e) =>
        logged.some((log) => log.exerciseId === e.id),
      );
      return {
        ...state,
        data: {
          ...state.data,
          exercises: [...state.data.exercises, ...kept],
          sessions: state.data.sessions.map((s) =>
            s.id === action.sessionId
              ? { ...s, exercises: logged, note: action.note }
              : s,
          ),
        },
      };
    }
    case "importData":
      return { data: action.data, draft: null };
  }
}

interface StoreValue {
  data: AppData;
  draft: DraftWorkout | null;
  dispatch: (action: Action) => void;
  exerciseName: (id: string) => string;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    data: loadData(),
    draft: loadDraft(),
  }));

  useEffect(() => {
    saveData(state.data);
  }, [state.data]);

  useEffect(() => {
    saveDraft(state.draft);
  }, [state.draft]);

  const exerciseName = (id: string) =>
    state.data.exercises.find((e) => e.id === id)?.name ?? "Unknown exercise";

  return (
    <StoreContext.Provider
      value={{ data: state.data, draft: state.draft, dispatch, exerciseName }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within StoreProvider");
  return value;
}
