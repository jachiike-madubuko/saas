"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getHabits } from "@/lib/firestore/habits";
import { createStack } from "@/lib/firestore/stacks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CategoryBadge, DifficultyBadge } from "@/components/ui/Badge";
import { stackCompletionBonus, BASE_POINTS } from "@/lib/points";
import type { Habit, TimeOfDay, FrequencyType } from "@/lib/types";

const TIME_OPTIONS: TimeOfDay[] = ["Morning", "Afternoon", "Evening", "Anytime"];

export default function NewStackPage() {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stackName, setStackName] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("Morning");
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [habitsLoading, setHabitsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    getHabits(firebaseUser.uid)
      .then(setHabits)
      .finally(() => setHabitsLoading(false));
  }, [firebaseUser]);

  const toggleHabit = (id: string) => {
    setSelectedHabitIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 8 ? [...prev, id] : prev
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...selectedHabitIds];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setSelectedHabitIds(next);
  };

  const moveDown = (index: number) => {
    if (index === selectedHabitIds.length - 1) return;
    const next = [...selectedHabitIds];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setSelectedHabitIds(next);
  };

  const selectedHabits = selectedHabitIds.map((id) => habits.find((h) => h.id === id)).filter(Boolean) as Habit[];
  const totalTime = selectedHabits.reduce((s, h) => s + h.estimatedTimeMinutes, 0);
  const basePointsRange = selectedHabits.reduce((s, h) => s + Math.round(BASE_POINTS[h.difficulty] * 1.4), 0);
  const bonus = stackCompletionBonus(selectedHabits.length);
  const potentialPoints = basePointsRange + bonus;

  const canSave = stackName.trim().length > 0 && selectedHabitIds.length >= 2;

  const handleSave = async () => {
    if (!firebaseUser || !canSave) return;
    setLoading(true);
    try {
      const stack = await createStack(
        firebaseUser.uid,
        { name: stackName.trim(), timeOfDay, frequencyType: "Daily", frequencyDays: null },
        selectedHabitIds
      );
      router.push(`/stacks/${stack.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-cyber-bg grid-bg flex flex-col">
      <div className="sticky top-0 z-10 bg-cyber-bg/90 backdrop-blur-md border-b border-cyber-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-cyber-dim hover:text-cyber-text">←</button>
        <h1 className="font-bold text-cyber-text flex-1">Build Stack</h1>
        <Button onClick={handleSave} disabled={!canSave} loading={loading} size="sm">
          Save
        </Button>
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto w-full">
        <Input
          label="Stack Name"
          value={stackName}
          onChange={(e) => setStackName(e.target.value)}
          placeholder="Morning Boot Sequence"
          autoFocus
        />

        {/* Time of day */}
        <div>
          <p className="text-sm font-medium text-cyber-text mb-2">Time of Day</p>
          <div className="grid grid-cols-4 gap-2">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setTimeOfDay(t)}
                className={`py-2 rounded-xl border text-xs font-medium transition-all
                  ${timeOfDay === t ? "border-cyber-cyan/60 bg-cyber-cyan/10 text-cyber-cyan" : "border-cyber-border text-cyber-dim hover:border-cyber-border/80"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Selected sequence */}
        {selectedHabitIds.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-cyber-text">Sequence ({selectedHabitIds.length}/8)</p>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-cyber-dim">~{totalTime}m</span>
                <span className="text-cyber-amber">~{potentialPoints} pts</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {selectedHabits.map((habit, index) => (
                <div key={habit.id} className="flex items-center gap-3 p-3 bg-cyber-card border border-cyber-border rounded-xl">
                  <span className="text-cyber-cyan font-mono text-sm w-5 text-center">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-cyber-text text-sm truncate">{habit.name}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => moveUp(index)} disabled={index === 0} className="text-cyber-dim disabled:opacity-30 hover:text-cyber-text px-1 text-xs">↑</button>
                    <button onClick={() => moveDown(index)} disabled={index === selectedHabitIds.length - 1} className="text-cyber-dim disabled:opacity-30 hover:text-cyber-text px-1 text-xs">↓</button>
                    <button onClick={() => toggleHabit(habit.id)} className="text-cyber-red text-xs px-1 hover:text-cyber-red/80">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Habit picker */}
        <div>
          <p className="text-sm font-medium text-cyber-text mb-2">
            {selectedHabitIds.length === 0 ? "Add Habits (min 2)" : "Add More"}
          </p>
          {habitsLoading ? (
            <p className="text-cyber-dim text-sm">Loading habits…</p>
          ) : habits.filter((h) => !selectedHabitIds.includes(h.id) && !h.isPaused).length === 0 ? (
            <div className="text-center py-6">
              <p className="text-cyber-dim text-sm mb-2">No more habits to add.</p>
              <button onClick={() => router.push("/habits/new")} className="text-cyber-cyan text-sm hover:underline">
                Create a habit first →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {habits.filter((h) => !selectedHabitIds.includes(h.id) && !h.isPaused).map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className="w-full flex items-center gap-3 p-3 bg-cyber-card border border-cyber-border rounded-xl text-left
                    hover:border-cyber-cyan/40 transition-all active:scale-98"
                >
                  <span className="text-cyber-dim text-lg w-5 text-center">+</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-cyber-text text-sm truncate">{habit.name}</p>
                    <div className="flex gap-1.5 mt-1">
                      <CategoryBadge category={habit.category} />
                      <DifficultyBadge difficulty={habit.difficulty} />
                    </div>
                  </div>
                  <span className="text-cyber-dim text-xs shrink-0">{habit.estimatedTimeMinutes}m</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => router.push("/habits/new")}
          className="text-cyber-cyan text-sm text-center hover:underline"
        >
          + Create new habit
        </button>
      </div>
    </div>
  );
}
