"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getStacks } from "@/lib/firestore/stacks";
import { getTodayCompletions } from "@/lib/firestore/habits";
import { getRecentTransactions } from "@/lib/firestore/users";
import { MasteryBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { HabitStack, HabitCompletionLog, RewardTransaction } from "@/lib/types";

export default function ProgressPage() {
  const { appUser, firebaseUser } = useAuth();
  const [stacks, setStacks] = useState<HabitStack[]>([]);
  const [todayCompletions, setTodayCompletions] = useState<HabitCompletionLog[]>([]);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    Promise.all([
      getStacks(firebaseUser.uid),
      getTodayCompletions(firebaseUser.uid),
      getRecentTransactions(firebaseUser.uid, 10),
    ]).then(([s, c, t]) => {
      setStacks(s);
      setTodayCompletions(c);
      setTransactions(t);
    }).finally(() => setLoading(false));
  }, [firebaseUser]);

  const totalStreak = stacks.reduce((max, s) => Math.max(max, s.currentStreak), 0);
  const longestStreak = stacks.reduce((max, s) => Math.max(max, s.longestStreak), 0);

  return (
    <div className="min-h-full bg-cyber-bg grid-bg">
      <div className="sticky top-0 z-10 bg-cyber-bg/90 backdrop-blur-md border-b border-cyber-border px-4 py-4">
        <h1 className="font-bold text-xl text-cyber-text">Netrunner Log</h1>
        <p className="text-cyber-dim text-xs mt-0.5 font-mono">Mission debrief</p>
      </div>

      <div className="px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto">
        {/* Stats row */}
        {appUser && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Points", value: appUser.pointsBalance.toLocaleString(), color: "text-cyber-amber" },
              { label: "Level", value: `Lv ${appUser.runnerLevel}`, color: "text-cyber-cyan" },
              { label: "Best Streak", value: `${longestStreak}d`, color: "text-cyber-magenta" },
            ].map((stat) => (
              <Card key={stat.label} className="p-3 text-center">
                <p className={`font-bold font-mono text-lg ${stat.color}`}>{stat.value}</p>
                <p className="text-cyber-dim text-xs mt-0.5">{stat.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Today's activity */}
        <section>
          <h2 className="font-bold text-cyber-text mb-3">Today&apos;s Ops</h2>
          {todayCompletions.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-cyber-dim text-sm">No habits completed yet today.</p>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-cyber-dim text-xs">Habits logged today</p>
                <p className="text-cyber-cyan font-mono font-bold">{todayCompletions.length}</p>
              </div>
              <div className="flex flex-col gap-2">
                {todayCompletions.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <span className="text-cyber-text">Habit completed</span>
                    <span className="text-cyber-amber font-mono">+{c.pointsEarned} pts</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>

        {/* Stack progress */}
        <section>
          <h2 className="font-bold text-cyber-text mb-3">Active Sequences</h2>
          {loading ? <p className="text-cyber-dim text-sm">Loading…</p> : stacks.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-cyber-dim text-sm">No stacks yet.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {stacks.map((stack) => (
                <Card key={stack.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-cyber-text text-sm">{stack.name}</p>
                        <MasteryBadge mastery={stack.masteryLevel} />
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-cyber-amber font-mono">🔥 {stack.currentStreak}d current</span>
                        <span className="text-cyber-dim">Best: {stack.longestStreak}d</span>
                        <span className="text-cyber-dim">{stack.totalCompletions} runs</span>
                      </div>
                    </div>
                  </div>
                  {/* Streak bar */}
                  <div className="mt-3 h-1.5 bg-cyber-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyber-amber rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stack.currentStreak / 30) * 100)}%` }}
                    />
                  </div>
                  <p className="text-cyber-dim text-xs mt-1 text-right font-mono">
                    {stack.currentStreak}/30 to Chrome mastery
                  </p>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Recent transactions */}
        <section>
          <h2 className="font-bold text-cyber-text mb-3">Recent Activity</h2>
          {transactions.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-cyber-dim text-sm">No activity yet.</p>
            </Card>
          ) : (
            <Card className="divide-y divide-cyber-border">
              {transactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-cyber-text text-sm">{tx.description}</p>
                    <p className="text-cyber-dim text-xs font-mono">
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className={`font-mono font-bold text-sm ${tx.amount > 0 ? "text-cyber-green" : "text-cyber-red"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </section>

        {/* Runner XP */}
        {appUser && (
          <section>
            <h2 className="font-bold text-cyber-text mb-3">Runner Rank</h2>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-cyber-cyan">Level {appUser.runnerLevel}</p>
                <p className="text-cyber-dim text-xs font-mono">{appUser.runnerXp} XP</p>
              </div>
              <div className="h-2 bg-cyber-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyber-violet rounded-full transition-all"
                  style={{ width: `${Math.min(100, (appUser.runnerXp % 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-cyber-dim mt-2">
                <span>Lv {appUser.runnerLevel}</span>
                <span>Lv {appUser.runnerLevel + 1}</span>
              </div>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
