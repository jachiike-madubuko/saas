"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getDuck } from "@/lib/firestore/users";
import { getStacks, getStackSteps } from "@/lib/firestore/stacks";
import { getHabits, getTodayCompletions } from "@/lib/firestore/habits";
import { DuckAvatar, DuckGreeting } from "@/components/duck/DuckAvatar";
import { MasteryBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Duck, HabitStack, Habit, StackStep, HabitCompletionLog } from "@/lib/types";

const DAILY_QUESTS = [
  { id: "any-stack", title: "Run any stack", description: "Complete any habit stack today", points: 50, emoji: "◈" },
  { id: "hard-habit", title: "Deep dive", description: "Complete a Hard difficulty habit", points: 75, emoji: "⚡" },
  { id: "three-habits", title: "Triple tap", description: "Complete 3 habits total", points: 25, emoji: "◉" },
];

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function timeGreeting(): string {
  const t = getTimeOfDay();
  return t === "morning" ? "Good morning" : t === "afternoon" ? "Good afternoon" : "Good evening";
}

interface StackCardProps {
  stack: HabitStack;
  steps: StackStep[];
  habits: Habit[];
  completedToday: string[];
}

function StackCard({ stack, steps, habits, completedToday }: StackCardProps) {
  const stackHabits = steps.map((s) => habits.find((h) => h.id === s.habitId)).filter(Boolean) as Habit[];
  const completedCount = stackHabits.filter((h) => completedToday.includes(h.id)).length;
  const total = stackHabits.length;
  const isComplete = completedCount === total;
  const progressPct = total > 0 ? (completedCount / total) * 100 : 0;
  const totalTime = stackHabits.reduce((s, h) => s + h.estimatedTimeMinutes, 0);

  return (
    <Card neon={isComplete ? "green" : undefined} className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-cyber-text text-sm truncate">{stack.name}</h3>
            <MasteryBadge mastery={stack.masteryLevel} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            {stack.currentStreak > 0 && (
              <span className="text-cyber-amber text-xs font-mono flex items-center gap-1">
                🔥 {stack.currentStreak}d streak
              </span>
            )}
            <span className="text-cyber-dim text-xs">~{totalTime}m</span>
          </div>
        </div>
        {isComplete ? (
          <span className="text-cyber-green text-xl shrink-0">✓</span>
        ) : (
          <span className="text-cyber-dim text-xs font-mono shrink-0">{completedCount}/{total}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-cyber-surface rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-cyber-green" : "bg-cyber-cyan"}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Habit steps preview */}
      <div className="flex flex-col gap-1 mb-3">
        {stackHabits.slice(0, 3).map((habit, i) => {
          const done = completedToday.includes(habit.id);
          return (
            <div key={habit.id} className="flex items-center gap-2 text-xs">
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${done ? "border-cyber-green bg-cyber-green/20 text-cyber-green" : "border-cyber-muted text-cyber-muted"}`}>
                {done ? "✓" : i + 1}
              </span>
              <span className={done ? "text-cyber-dim line-through" : "text-cyber-text"}>{habit.name}</span>
            </div>
          );
        })}
        {stackHabits.length > 3 && (
          <p className="text-cyber-dim text-xs ml-6">+{stackHabits.length - 3} more</p>
        )}
      </div>

      {!isComplete && (
        <Link
          href={`/stacks/${stack.id}`}
          className="block w-full text-center py-2 rounded-xl bg-cyber-cyan text-cyber-bg text-sm font-semibold
            hover:shadow-neon-cyan transition-all duration-200 active:scale-95"
        >
          Run Stack →
        </Link>
      )}
      {isComplete && (
        <div className="text-center text-cyber-green text-xs font-mono py-1">Sequence locked. Good run.</div>
      )}
    </Card>
  );
}

export default function HomePage() {
  const { appUser, firebaseUser } = useAuth();
  const [duck, setDuck] = useState<Duck | null>(null);
  const [stacks, setStacks] = useState<HabitStack[]>([]);
  const [steps, setSteps] = useState<Record<string, StackStep[]>>({});
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    Promise.all([
      getDuck(uid),
      getStacks(uid),
      getHabits(uid),
      getTodayCompletions(uid),
    ]).then(async ([d, s, h, completions]) => {
      setDuck(d);
      setHabits(h);
      setCompletedToday(completions.map((c) => c.habitId));
      const stepsMap: Record<string, StackStep[]> = {};
      for (const stack of s) {
        stepsMap[stack.id] = await getStackSteps(uid, stack.id);
      }
      setStacks(s);
      setSteps(stepsMap);
    }).finally(() => setLoading(false));
  }, [firebaseUser]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-4xl animate-float">🦆</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-cyber-bg grid-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-cyber-bg/90 backdrop-blur-md border-b border-cyber-border px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-cyber-dim text-xs">{timeGreeting()}, runner</p>
          <p className="font-bold text-cyber-text">{appUser?.displayName}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-cyber-surface border border-cyber-border rounded-full px-3 py-1.5">
            <span className="text-cyber-amber text-xs font-mono">◈</span>
            <span className="text-cyber-text font-mono font-bold text-sm">{appUser?.pointsBalance ?? 0}</span>
            <span className="text-cyber-dim text-xs">pts</span>
          </div>
          {duck && (
            <Link href="/duck">
              <DuckAvatar duck={duck} size="sm" animate={false} />
            </Link>
          )}
        </div>
      </div>

      <div className="px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto">
        {/* Duck greeting */}
        {duck && (
          <div className="flex items-center gap-4 p-4 bg-cyber-card rounded-2xl border border-cyber-border">
            <DuckAvatar duck={duck} size="md" />
            <div className="flex-1">
              <p className="font-bold text-cyber-text text-sm">{duck.name}</p>
              <DuckGreeting duck={duck} timeOfDay={getTimeOfDay()} />
            </div>
          </div>
        )}

        {/* Today's Stacks */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-cyber-text">Today&apos;s Missions</h2>
            <Link href="/habits" className="text-cyber-cyan text-xs hover:underline">Manage →</Link>
          </div>
          {stacks.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-cyber-dim text-sm mb-3">No stacks built yet, runner.</p>
              <Link
                href="/habits"
                className="text-cyber-cyan text-sm hover:underline"
              >
                Build your first stack →
              </Link>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {stacks.map((stack) => (
                <StackCard
                  key={stack.id}
                  stack={stack}
                  steps={steps[stack.id] ?? []}
                  habits={habits}
                  completedToday={completedToday}
                />
              ))}
            </div>
          )}
        </section>

        {/* Daily Quests */}
        <section>
          <h2 className="font-bold text-cyber-text mb-3">Daily Intel</h2>
          <div className="flex flex-col gap-2">
            {DAILY_QUESTS.map((quest) => (
              <div key={quest.id} className="flex items-center gap-3 p-3 bg-cyber-card border border-cyber-border rounded-xl">
                <span className="text-cyber-cyan text-xl w-8 text-center">{quest.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-cyber-text text-sm font-medium">{quest.title}</p>
                  <p className="text-cyber-dim text-xs">{quest.description}</p>
                </div>
                <span className="text-cyber-amber text-xs font-mono shrink-0">+{quest.points}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Runner Stats */}
        {appUser && (
          <section>
            <div className="flex items-center gap-3 p-4 bg-cyber-card border border-cyber-border rounded-2xl">
              <div className="flex-1">
                <p className="text-cyber-dim text-xs font-mono mb-1">Runner Rank</p>
                <p className="font-bold text-cyber-cyan">Level {appUser.runnerLevel}</p>
                <div className="h-1 bg-cyber-surface rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-cyber-violet rounded-full"
                    style={{ width: `${Math.min(100, (appUser.runnerXp % 100))}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-cyber-dim text-xs font-mono mb-1">Total Earned</p>
                <p className="font-bold text-cyber-amber font-mono">{appUser.pointsTotalEarned}</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
