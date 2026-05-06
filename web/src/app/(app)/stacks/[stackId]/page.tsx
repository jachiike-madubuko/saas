"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getStacks, getStackSteps, completeStack } from "@/lib/firestore/stacks";
import { getHabits, completeHabit } from "@/lib/firestore/habits";
import { addPoints, addXp, getDuck } from "@/lib/firestore/users";
import { habitPoints, stackCompletionBonus, streakMultiplier, applyOrderPenalty } from "@/lib/points";
import { DuckAvatar } from "@/components/duck/DuckAvatar";
import { CategoryBadge, DifficultyBadge } from "@/components/ui/Badge";
import type { HabitStack, StackStep, Habit, Duck } from "@/lib/types";

interface PointPop {
  id: string;
  amount: number;
  label: string;
}

export default function StackRunPage({ params }: { params: Promise<{ stackId: string }> }) {
  const { stackId } = use(params);
  const { firebaseUser, refreshAppUser } = useAuth();
  const router = useRouter();

  const [stack, setStack] = useState<HabitStack | null>(null);
  const [steps, setSteps] = useState<StackStep[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [duck, setDuck] = useState<Duck | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [orderViolation, setOrderViolation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [pops, setPops] = useState<PointPop[]>([]);
  const [phase, setPhase] = useState<"run" | "complete">("run");
  const [rewardResult, setRewardResult] = useState<{ total: number; breakdown: string; streakDay: number } | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    Promise.all([
      getStacks(uid),
      getStackSteps(uid, stackId),
      getHabits(uid),
      getDuck(uid),
    ]).then(([stacks, st, h, d]) => {
      const found = stacks.find((s) => s.id === stackId) ?? null;
      setStack(found);
      setSteps(st);
      setHabits(h);
      setDuck(d);
    }).finally(() => setLoading(false));
  }, [firebaseUser, stackId]);

  const stackHabits = steps.map((s) => habits.find((h) => h.id === s.habitId)).filter(Boolean) as Habit[];

  const addPointPop = (amount: number, label: string) => {
    const pop: PointPop = { id: `${Date.now()}-${Math.random()}`, amount, label };
    setPops((prev) => [...prev, pop]);
    setTimeout(() => setPops((prev) => prev.filter((p) => p.id !== pop.id)), 2000);
  };

  const handleCompleteHabit = async (habit: Habit, index: number) => {
    if (!firebaseUser || !stack || completedIds.includes(habit.id)) return;

    const expectedNext = steps.find((s) => !completedIds.includes(s.habitId));
    const isInOrder = expectedNext?.habitId === habit.id;
    if (!isInOrder) setOrderViolation(true);

    const newCompleted = [...completedIds, habit.id];
    setCompletedIds(newCompleted);

    const pts = habitPoints(habit.difficulty, true);
    addPointPop(pts, `+${pts}`);

    await completeHabit(firebaseUser.uid, habit, stackId, isInOrder);
    await addPoints(firebaseUser.uid, pts, "HabitComplete", `${habit.name} (in stack)`, habit.id);
    await addXp(firebaseUser.uid, 3);

    if (newCompleted.length === stackHabits.length) {
      setFinishing(true);
      await handleStackComplete(newCompleted, !orderViolation && isInOrder);
    }
  };

  const handleStackComplete = async (allCompleted: string[], allInOrder: boolean) => {
    if (!firebaseUser || !stack) return;
    const completedHabits = allCompleted.map((id) => habits.find((h) => h.id === id)).filter(Boolean) as Habit[];
    const log = await completeStack(firebaseUser.uid, stack, completedHabits, allInOrder);
    await refreshAppUser();

    const breakdown = `${log.basePoints} habit pts + ${log.completionBonus} bonus × ${log.streakMultiplier}`;
    setRewardResult({ total: log.totalPoints, breakdown, streakDay: log.streakDay });
    addPointPop(log.completionBonus, `Stack bonus!`);
    setPhase("complete");
    setFinishing(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-cyber-bg">
        <div className="text-4xl animate-float">🦆</div>
      </div>
    );
  }

  if (!stack) {
    return (
      <div className="h-full flex items-center justify-center bg-cyber-bg">
        <div className="text-center">
          <p className="text-cyber-dim">Stack not found.</p>
          <button onClick={() => router.back()} className="text-cyber-cyan mt-2 text-sm hover:underline">← Back</button>
        </div>
      </div>
    );
  }

  const progressPct = stackHabits.length > 0 ? (completedIds.length / stackHabits.length) * 100 : 0;

  // ─── Complete Screen ───────────────────────────────────────────────────────
  if (phase === "complete" && rewardResult) {
    return (
      <div className="min-h-full bg-cyber-bg grid-bg flex flex-col items-center justify-center p-6 text-center">
        {/* Neon glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl bg-cyber-cyan" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm w-full">
          {duck && <DuckAvatar duck={duck} size="xl" />}

          <div>
            <p className="text-cyber-green text-sm font-mono mb-1">SEQUENCE LOCKED</p>
            <h1 className="text-3xl font-bold text-cyber-text">{stack.name}</h1>
            <p className="text-cyber-dim text-sm mt-1">Complete.</p>
          </div>

          {/* Points breakdown */}
          <div className="w-full bg-cyber-card border border-cyber-cyan/30 rounded-2xl p-5 text-left">
            <div className="flex items-center justify-between mb-3">
              <p className="text-cyber-dim text-xs font-mono">TOTAL EARNED</p>
              <p className="text-4xl font-bold font-mono text-cyber-cyan">+{rewardResult.total}</p>
            </div>
            <div className="border-t border-cyber-border pt-3">
              <p className="text-cyber-dim text-xs font-mono">{rewardResult.breakdown}</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-cyber-amber text-xs">🔥 Day {rewardResult.streakDay} streak</p>
              {orderViolation && <p className="text-cyber-amber text-xs">Sequence disrupted (−20% bonus)</p>}
            </div>
          </div>

          {duck && (
            <div className="bg-cyber-surface/60 border border-cyber-border rounded-xl px-4 py-3 text-sm">
              <p className="text-cyber-cyan font-mono text-xs mb-1">{duck.name}:</p>
              <p className="text-cyber-dim italic">
                {rewardResult.streakDay >= 7
                  ? `Day ${rewardResult.streakDay}. They said it couldn't be done. They were wrong.`
                  : "Sequence locked. Good run today."}
              </p>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={() => router.push("/shop")}
              className="flex-1 py-3 rounded-xl border border-cyber-amber/40 text-cyber-amber text-sm font-semibold hover:bg-cyber-amber/10 transition-all"
            >
              Visit Shop
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 py-3 rounded-xl bg-cyber-cyan text-cyber-bg text-sm font-semibold hover:shadow-neon-cyan transition-all"
            >
              Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Run Screen ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-cyber-bg grid-bg flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-cyber-bg/90 backdrop-blur-md border-b border-cyber-border px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.back()} className="text-cyber-dim hover:text-cyber-text">←</button>
          <div className="flex-1">
            <p className="font-bold text-cyber-text text-sm truncate">{stack.name}</p>
            <div className="flex items-center gap-2 text-xs">
              {stack.currentStreak > 0 && <span className="text-cyber-amber font-mono">🔥 {stack.currentStreak}d</span>}
              <span className="text-cyber-dim">{completedIds.length}/{stackHabits.length} done</span>
            </div>
          </div>
          {duck && <DuckAvatar duck={duck} size="sm" animate={false} />}
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-cyber-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-cyber-cyan rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Point pops */}
      <div className="fixed top-20 right-4 z-50 pointer-events-none flex flex-col gap-2">
        {pops.map((pop) => (
          <div key={pop.id} className="text-cyber-cyan font-mono font-bold text-lg animate-slide-up opacity-0 translate-y-[-40px]"
            style={{ animation: "points-pop 2s ease-out forwards" }}>
            {pop.label}
          </div>
        ))}
      </div>

      {/* Habits list */}
      <div className="flex-1 px-4 py-6 flex flex-col gap-3 max-w-lg mx-auto w-full">
        {orderViolation && (
          <div className="text-center text-cyber-amber text-xs py-2 px-4 bg-cyber-amber/10 rounded-xl border border-cyber-amber/30">
            Sequence disrupted. Completion bonus reduced 20%.
          </div>
        )}

        {stackHabits.map((habit, index) => {
          const isDone = completedIds.includes(habit.id);
          const isNext = !isDone && completedIds.length === index;
          const pts = habitPoints(habit.difficulty, true);

          return (
            <div
              key={habit.id}
              className={`p-4 rounded-2xl border transition-all duration-300
                ${isDone
                  ? "bg-cyber-green/5 border-cyber-green/30"
                  : isNext
                  ? "bg-cyber-card border-cyber-cyan/40 shadow-neon-cyan"
                  : "bg-cyber-card border-cyber-border opacity-60"}`}
            >
              <div className="flex items-center gap-4">
                {/* Check button */}
                <button
                  onClick={() => handleCompleteHabit(habit, index)}
                  disabled={isDone || finishing}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200
                    ${isDone
                      ? "border-cyber-green bg-cyber-green/20 text-cyber-green"
                      : isNext
                      ? "border-cyber-cyan hover:bg-cyber-cyan/20 text-cyber-cyan hover:scale-110 active:scale-90"
                      : "border-cyber-muted text-cyber-muted cursor-default"}`}
                >
                  {isDone ? "✓" : <span className="font-mono text-sm">{index + 1}</span>}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${isDone ? "text-cyber-dim line-through" : "text-cyber-text"}`}>
                    {habit.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <CategoryBadge category={habit.category} />
                    <DifficultyBadge difficulty={habit.difficulty} />
                    <span className="text-cyber-dim text-xs">{habit.estimatedTimeMinutes}m</span>
                  </div>
                  {habit.triggerCue && isNext && (
                    <p className="text-cyber-dim text-xs italic mt-1.5">Cue: {habit.triggerCue}</p>
                  )}
                </div>

                <span className={`text-xs font-mono shrink-0 ${isDone ? "text-cyber-green" : "text-cyber-dim"}`}>
                  +{pts}
                </span>
              </div>
            </div>
          );
        })}

        {finishing && (
          <div className="text-center py-6">
            <p className="text-cyber-cyan font-mono animate-pulse-neon">Calculating reward…</p>
          </div>
        )}
      </div>
    </div>
  );
}
