"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createDuck } from "@/lib/firestore/users";
import { createHabit } from "@/lib/firestore/habits";
import { createStack } from "@/lib/firestore/stacks";
import { updateUser } from "@/lib/firestore/users";
import { Button } from "@/components/ui/Button";
import type { HabitCategory, HabitDifficulty } from "@/lib/types";

const DUCK_OPTIONS = [
  { id: "Glitch", emoji: "🦆", name: "Glitch", quote: '"Call me Glitch. I like chaos."', color: "border-cyber-magenta/60 shadow-neon-magenta" },
  { id: "Zero", emoji: "🦆", name: "Zero", quote: '"Designation: ZERO. Precision only."', color: "border-cyber-cyan/60 shadow-neon-cyan" },
  { id: "Wren", emoji: "🦆", name: "Wren", quote: '"I\'m Wren. Let\'s figure this out together."', color: "border-cyber-amber/60 shadow-neon-amber" },
];

const IDENTITY_OPTIONS = [
  { id: "body", label: "Takes care of their body", category: "Body" as HabitCategory },
  { id: "mind", label: "Thinks clearly every morning", category: "Mind" as HabitCategory },
  { id: "create", label: "Creates something every day", category: "Create" as HabitCategory },
  { id: "rest", label: "Rests without guilt", category: "Rest" as HabitCategory },
  { id: "focus", label: "Shows up consistently", category: "Focus" as HabitCategory },
];

const STARTER_STACKS = [
  {
    name: "Morning Boot Sequence",
    timeOfDay: "Morning" as const,
    habits: [
      { name: "Drink a glass of water", category: "Body" as HabitCategory, difficulty: "Nano" as HabitDifficulty, estimatedTimeMinutes: 1 },
      { name: "Stretch for 3 minutes", category: "Body" as HabitCategory, difficulty: "Easy" as HabitDifficulty, estimatedTimeMinutes: 3 },
      { name: "Write today's top 3 priorities", category: "Mind" as HabitCategory, difficulty: "Medium" as HabitDifficulty, estimatedTimeMinutes: 5 },
    ],
  },
  {
    name: "Deep Focus Protocol",
    timeOfDay: "Morning" as const,
    habits: [
      { name: "Drink a glass of water", category: "Body" as HabitCategory, difficulty: "Nano" as HabitDifficulty, estimatedTimeMinutes: 1 },
      { name: "5-minute meditation", category: "Mind" as HabitCategory, difficulty: "Easy" as HabitDifficulty, estimatedTimeMinutes: 5 },
      { name: "Write today's top 3 priorities", category: "Mind" as HabitCategory, difficulty: "Medium" as HabitDifficulty, estimatedTimeMinutes: 5 },
    ],
  },
  {
    name: "Street Athlete Warm-up",
    timeOfDay: "Morning" as const,
    habits: [
      { name: "Drink a glass of water", category: "Body" as HabitCategory, difficulty: "Nano" as HabitDifficulty, estimatedTimeMinutes: 1 },
      { name: "10-minute workout", category: "Body" as HabitCategory, difficulty: "Hard" as HabitDifficulty, estimatedTimeMinutes: 10 },
      { name: "Post-workout protein", category: "Body" as HabitCategory, difficulty: "Nano" as HabitDifficulty, estimatedTimeMinutes: 2 },
    ],
  },
];

export default function OnboardingPage() {
  const { firebaseUser, refreshAppUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedDuck, setSelectedDuck] = useState<string | null>(null);
  const [selectedIdentities, setSelectedIdentities] = useState<string[]>([]);
  const [selectedStack, setSelectedStack] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;
  const progress = ((step) / totalSteps) * 100;

  const toggleIdentity = (id: string) => {
    setSelectedIdentities((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    if (!firebaseUser || !selectedDuck || selectedStack === null) return;
    setLoading(true);
    try {
      await createDuck(firebaseUser.uid, selectedDuck, selectedDuck);
      const stack = STARTER_STACKS[selectedStack];
      const habitIds: string[] = [];
      for (const h of stack.habits) {
        const habit = await createHabit(firebaseUser.uid, {
          name: h.name,
          category: h.category,
          difficulty: h.difficulty,
          estimatedTimeMinutes: h.estimatedTimeMinutes,
          frequencyType: "Daily",
          frequencyDays: null,
          triggerCue: null,
          identityStatement: null,
          rewardNote: null,
          stackEligible: true,
          notes: null,
        });
        habitIds.push(habit.id);
      }
      await createStack(
        firebaseUser.uid,
        { name: stack.name, timeOfDay: stack.timeOfDay, frequencyType: "Daily", frequencyDays: null },
        habitIds
      );
      await updateUser(firebaseUser.uid, { onboardingComplete: true });
      await refreshAppUser();
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-cyber-bg grid-bg flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-cyber-surface">
        <div
          className="h-full bg-cyber-cyan transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center p-6 max-w-md mx-auto w-full">
        {/* Step 0 — Intro */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-slide-up text-center">
            <div className="text-8xl animate-float">🦆</div>
            <div>
              <h1 className="text-3xl font-bold text-cyber-text">New runner detected.</h1>
              <p className="text-cyber-dim mt-2">I&apos;ve been waiting.</p>
            </div>
            <p className="text-cyber-dim text-sm max-w-xs">
              In this city, habits are power. Build yours, gear up your duck, and become the runner you were meant to be.
            </p>
            <Button onClick={() => setStep(1)} className="w-full" size="lg">
              Initialize Sequence
            </Button>
          </div>
        )}

        {/* Step 1 — Choose your duck */}
        {step === 1 && (
          <div className="flex-1 flex flex-col gap-6 animate-slide-up w-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-cyber-text">Choose your companion</h2>
              <p className="text-cyber-dim text-sm mt-1">Who&apos;s riding with you?</p>
            </div>
            <div className="flex flex-col gap-3">
              {DUCK_OPTIONS.map((duck) => (
                <button
                  key={duck.id}
                  onClick={() => setSelectedDuck(duck.id)}
                  className={`w-full p-4 rounded-2xl border-2 bg-cyber-card text-left transition-all duration-200 active:scale-98
                    ${selectedDuck === duck.id ? duck.color : "border-cyber-border hover:border-cyber-border/80"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-5xl w-16 h-16 flex items-center justify-center rounded-2xl bg-cyber-surface border ${selectedDuck === duck.id ? duck.color : "border-cyber-border"}`}>
                      {duck.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-cyber-text">{duck.name}</p>
                      <p className="text-cyber-dim text-sm italic mt-0.5">{duck.quote}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <Button onClick={() => setStep(2)} disabled={!selectedDuck} className="w-full mt-auto">
              Lock In
            </Button>
          </div>
        )}

        {/* Step 2 — Identity framing */}
        {step === 2 && (
          <div className="flex-1 flex flex-col gap-6 animate-slide-up w-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-cyber-text">Who are you becoming?</h2>
              <p className="text-cyber-dim text-sm mt-1">Select all that apply. No wrong answers.</p>
            </div>
            <p className="text-cyber-cyan text-sm font-mono text-center">I am someone who…</p>
            <div className="flex flex-col gap-2">
              {IDENTITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => toggleIdentity(opt.id)}
                  className={`w-full p-3.5 rounded-xl border text-left text-sm font-medium transition-all duration-200
                    ${selectedIdentities.includes(opt.id)
                      ? "border-cyber-cyan/60 bg-cyber-cyan/10 text-cyber-cyan"
                      : "border-cyber-border bg-cyber-card text-cyber-dim hover:text-cyber-text hover:border-cyber-border/80"}`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedIdentities.includes(opt.id) ? "border-cyber-cyan bg-cyber-cyan" : "border-cyber-muted"}`}>
                      {selectedIdentities.includes(opt.id) && <span className="text-[8px] text-cyber-bg font-bold">✓</span>}
                    </span>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            <Button onClick={() => setStep(3)} disabled={selectedIdentities.length === 0} className="w-full mt-auto">
              Set Identity
            </Button>
          </div>
        )}

        {/* Step 3 — First stack */}
        {step === 3 && (
          <div className="flex-1 flex flex-col gap-6 animate-slide-up w-full">
            <div className="text-center">
              <p className="text-cyber-cyan text-sm font-mono mb-1">
                {DUCK_OPTIONS.find((d) => d.id === selectedDuck)?.name ?? "Duck"}:
              </p>
              <h2 className="text-2xl font-bold text-cyber-text">One habit is a mission.</h2>
              <p className="text-cyber-text text-xl font-bold">A sequence is a system.</p>
              <p className="text-cyber-dim text-sm mt-2">Pick your first stack to get started.</p>
            </div>
            <div className="flex flex-col gap-3">
              {STARTER_STACKS.map((stack, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedStack(i)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-200
                    ${selectedStack === i
                      ? "border-cyber-cyan/60 bg-cyber-cyan/5"
                      : "border-cyber-border bg-cyber-card hover:border-cyber-border/80"}`}
                >
                  <p className={`font-bold text-sm mb-2 ${selectedStack === i ? "text-cyber-cyan" : "text-cyber-text"}`}>
                    {stack.name}
                  </p>
                  <div className="flex flex-col gap-1">
                    {stack.habits.map((h, hi) => (
                      <p key={hi} className="text-cyber-dim text-xs flex items-center gap-2">
                        <span className="text-cyber-muted font-mono">{hi + 1}.</span>
                        {h.name}
                        <span className="ml-auto text-cyber-muted">{h.estimatedTimeMinutes}m</span>
                      </p>
                    ))}
                  </div>
                  <p className="text-cyber-muted text-xs mt-2 font-mono">
                    ~{stack.habits.reduce((s, h) => s + h.estimatedTimeMinutes, 0)} min total
                  </p>
                </button>
              ))}
            </div>
            <Button onClick={handleFinish} disabled={selectedStack === null} loading={loading} className="w-full mt-auto">
              Boot Up CyberDuck
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
