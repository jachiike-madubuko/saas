"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getHabits, archiveHabit, updateHabit } from "@/lib/firestore/habits";
import { getStacks as fetchStacks } from "@/lib/firestore/stacks";
import { CategoryBadge, DifficultyBadge, MasteryBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Habit, HabitStack } from "@/lib/types";

type Tab = "stacks" | "habits";

export default function HabitsPage() {
  const { firebaseUser } = useAuth();
  const [tab, setTab] = useState<Tab>("stacks");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stacks, setStacks] = useState<HabitStack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    Promise.all([
      getHabits(firebaseUser.uid),
      fetchStacks(firebaseUser.uid),
    ]).then(([h, s]) => {
      setHabits(h);
      setStacks(s);
    }).finally(() => setLoading(false));
  }, [firebaseUser]);

  const handlePauseHabit = async (habit: Habit) => {
    if (!firebaseUser) return;
    await updateHabit(firebaseUser.uid, habit.id, { isPaused: !habit.isPaused });
    setHabits((prev) => prev.map((h) => h.id === habit.id ? { ...h, isPaused: !h.isPaused } : h));
  };

  const handleArchiveHabit = async (habitId: string) => {
    if (!firebaseUser) return;
    await archiveHabit(firebaseUser.uid, habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  return (
    <div className="min-h-full bg-cyber-bg grid-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-cyber-bg/90 backdrop-blur-md border-b border-cyber-border px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-bold text-xl text-cyber-text">Mission Control</h1>
          <div className="flex gap-2">
            <Link href="/stacks/new" className="text-xs bg-cyber-surface border border-cyber-border text-cyber-text px-3 py-1.5 rounded-xl hover:border-cyber-cyan/40 transition-all">
              + Stack
            </Link>
            <Link href="/habits/new" className="text-xs bg-cyber-cyan text-cyber-bg px-3 py-1.5 rounded-xl font-semibold hover:shadow-neon-cyan transition-all">
              + Habit
            </Link>
          </div>
        </div>
        {/* Tab bar */}
        <div className="flex border-b border-cyber-border">
          {(["stacks", "habits"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                tab === t
                  ? "text-cyber-cyan border-cyber-cyan"
                  : "text-cyber-dim border-transparent hover:text-cyber-text"
              }`}
            >
              {t} <span className="text-xs opacity-60">({t === "stacks" ? stacks.length : habits.length})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3 max-w-lg mx-auto">
        {loading && <p className="text-cyber-dim text-sm text-center py-8">Loading ops…</p>}

        {/* Stacks Tab */}
        {!loading && tab === "stacks" && (
          <>
            {stacks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-5xl mb-3">◈</p>
                <p className="text-cyber-dim text-sm mb-4">No stacks yet. A sequence is a system.</p>
                <Link href="/stacks/new" className="text-cyber-cyan text-sm hover:underline">Build your first stack →</Link>
              </Card>
            ) : stacks.map((stack) => (
              <Card key={stack.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-cyber-text text-sm">{stack.name}</h3>
                      <MasteryBadge mastery={stack.masteryLevel} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-cyber-dim text-xs">{stack.timeOfDay}</span>
                      <span className="text-cyber-amber text-xs font-mono">🔥 {stack.currentStreak}d</span>
                      <span className="text-cyber-dim text-xs">{stack.totalCompletions} runs</span>
                    </div>
                  </div>
                  <Link href={`/stacks/${stack.id}`} className="text-cyber-cyan text-xs hover:underline shrink-0">
                    Run →
                  </Link>
                </div>
              </Card>
            ))}
          </>
        )}

        {/* Habits Tab */}
        {!loading && tab === "habits" && (
          <>
            {habits.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-5xl mb-3">◦</p>
                <p className="text-cyber-dim text-sm mb-4">No habits created yet.</p>
                <Link href="/habits/new" className="text-cyber-cyan text-sm hover:underline">Create your first habit →</Link>
              </Card>
            ) : habits.map((habit) => (
              <Card key={habit.id} className={`p-4 ${habit.isPaused ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm mb-1.5 ${habit.isPaused ? "text-cyber-dim" : "text-cyber-text"}`}>
                      {habit.name}
                      {habit.isPaused && <span className="ml-2 text-xs text-cyber-dim font-normal">(paused)</span>}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <CategoryBadge category={habit.category} />
                      <DifficultyBadge difficulty={habit.difficulty} />
                      <span className="text-xs text-cyber-dim border border-cyber-border/50 px-1.5 py-0.5 rounded-full">
                        {habit.estimatedTimeMinutes}m
                      </span>
                    </div>
                    {habit.identityStatement && (
                      <p className="text-cyber-dim text-xs italic mt-1.5">"{habit.identityStatement}"</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => handlePauseHabit(habit)} className="text-cyber-dim text-xs hover:text-cyber-text px-2 py-1 rounded-lg hover:bg-cyber-surface transition-all">
                      {habit.isPaused ? "Resume" : "Pause"}
                    </button>
                    <button onClick={() => handleArchiveHabit(habit.id)} className="text-cyber-dim text-xs hover:text-cyber-red px-2 py-1 rounded-lg hover:bg-cyber-surface transition-all">
                      Archive
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
