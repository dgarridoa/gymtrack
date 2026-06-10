import { useState } from "react";
import { useStore } from "./store";
import TabBar, { type Tab } from "./components/TabBar";
import RoutinesScreen from "./screens/RoutinesScreen";
import WorkoutScreen from "./screens/WorkoutScreen";
import HistoryScreen from "./screens/HistoryScreen";
import ProgressScreen from "./screens/ProgressScreen";
import DataScreen from "./screens/DataScreen";

export default function App() {
  const { draft, dispatch } = useStore();
  const [tab, setTab] = useState<Tab>("routines");
  // Reopen the workout screen automatically if a draft survived a reload.
  const [inWorkout, setInWorkout] = useState(draft !== null);

  const showWorkout = inWorkout && draft !== null;

  return (
    <div className="min-h-dvh bg-chalk text-iron">
      <main className="mx-auto max-w-md px-4 pb-40 pt-[max(1rem,env(safe-area-inset-top))]">
        {showWorkout ? (
          <WorkoutScreen onDone={() => setInWorkout(false)} />
        ) : tab === "routines" ? (
          <RoutinesScreen
            onStartWorkout={(routine) => {
              dispatch({ type: "startWorkout", routine });
              setInWorkout(true);
            }}
          />
        ) : tab === "history" ? (
          <HistoryScreen />
        ) : tab === "progress" ? (
          <ProgressScreen />
        ) : (
          <DataScreen />
        )}
      </main>

      {!showWorkout && draft !== null && (
        <button
          type="button"
          onClick={() => setInWorkout(true)}
          className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 mx-auto h-12 max-w-md rounded-2xl bg-plate-yellow text-base font-semibold text-onyx shadow-lg transition-colors active:bg-plate-yellow/80"
        >
          ▶ Resume workout — {draft.routineName}
        </button>
      )}

      {!showWorkout && <TabBar active={tab} onChange={setTab} />}
    </div>
  );
}
