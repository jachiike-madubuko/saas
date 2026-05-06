"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createHabit } from "@/lib/firestore/habits";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BASE_POINTS } from "@/lib/points";
import type { HabitCategory, HabitDifficulty, FrequencyType } from "@/lib/types";

const CATEGORIES: { id: HabitCategory; emoji: string; color: string }[] = [
  { id: "Mind", emoji: "🧠", color: "border-cyber-violet/60 bg-cyber-violet/10 text-cyber-violet" },
  { id: "Body", emoji: "⚡", color: "border-cyber-green/60 bg-cyber-green/10 text-cyber-green" },
  { id: "Focus", emoji: "🎯", color: "border-cyber-cyan/60 bg-cyber-cyan/10 text-cyber-cyan" },
  { id: "Social", emoji: "🌐", color: "border-cyber-amber/60 bg-cyber-amber/10 text-cyber-amber" },
  { id: "Create", emoji: "✦", color: "border-cyber-magenta/60 bg-cyber-magenta/10 text-cyber-magenta" },
  { id: "Rest", emoji: "🌙", color: "border-cat-rest/60 bg-cat-rest/10 text-cat-rest" },
];

const DIFFICULTIES: { id: HabitDifficulty; label: string; sub: string; color: string }[] = [
  { id: "Nano", label: "Nano", sub: "< 2 min", color: "border-cyber-dim/60 text-cyber-dim" },
  { id: "Easy", label: "Easy", sub: "2–10 min", color: "border-cyber-green/60 text-cyber-green" },
  { id: "Medium", label: "Medium", sub: "10–30 min", color: "border-cyber-amber/60 text-cyber-amber" },
  { id: "Hard", label: "Hard", sub: "30+ min", color: "border-cyber-magenta/60 text-cyber-magenta" },
];

const TRIGGER_SUGGESTIONS = [
  "After I pour my morning coffee",
  "After I wake up",
  "Before I open my laptop",
  "After lunch",
  "Before bed",
  "After my previous habit",
];

export default function NewHabitPage() {
  const { firebaseUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<HabitCategory | null>(null);
  const [difficulty, setDifficulty] = useState<HabitDifficulty | null>(null);
  const [timeMinutes, setTimeMinutes] = useState(5);
  const [frequency, setFrequency] = useState<FrequencyType>("Daily");
  const [triggerCue, setTriggerCue] = useState("");
  const [identityStatement, setIdentityStatement] = useState("");
  const [rewardNote, setRewardNote] = useState("");
  const [loading, setLoading] = useState(false);

  const step1Valid = name.trim().length > 0 && category !== null && difficulty !== null;
  const progress = (step / 3) * 100;

  const handleSave = async () => {
    if (!firebaseUser || !category || !difficulty) return;
    setLoading(true);
    try {
      await createHabit(firebaseUser.uid, {
        name: name.trim(),
        category,
        difficulty,
        estimatedTimeMinutes: timeMinutes,
        frequencyType: frequency,
        frequencyDays: null,
        triggerCue: triggerCue.trim() || null,
        identityStatement: identityStatement.trim() || null,
        rewardNote: rewardNote.trim() || null,
        stackEligible: true,
        notes: null,
      });
      router.push("/habits");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-cyber-bg grid-bg flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-cyber-bg/90 backdrop-blur-md border-b border-cyber-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="text-cyber-dim hover:text-cyber-text transition-colors">
          ←
        </button>
        <div className="flex-1">
          <p className="text-cyber-dim text-xs font-mono">Step {step} of 3</p>
          <div className="h-1 bg-cyber-surface rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-cyber-cyan rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {step > 1 && (
          <button onClick={handleSave} disabled={loading} className="text-cyber-dim text-xs hover:text-cyber-cyan transition-colors">
            Skip & Save
          </button>
        )}
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto w-full">
        {/* Step 1 — Basics */}
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-slide-up">
            <div>
              <h1 className="text-2xl font-bold text-cyber-text">New Op</h1>
              <p className="text-cyber-dim text-sm mt-1">Small and real beats big and abandoned.</p>
            </div>

            <Input
              label="Habit Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Drink a glass of water"
              autoFocus
            />

            <div>
              <p className="text-sm font-medium text-cyber-text mb-2">Category</p>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 text-xs font-medium transition-all
                      ${category === cat.id ? cat.color : "border-cyber-border text-cyber-dim hover:border-cyber-border/80"}`}
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    {cat.id}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cyber-text mb-2">Difficulty</p>
              <div className="grid grid-cols-2 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all
                      ${difficulty === d.id ? `${d.color} bg-opacity-10` : "border-cyber-border text-cyber-dim hover:border-cyber-border/80"}`}
                  >
                    <p className="font-bold text-sm">{d.label}</p>
                    <p className="text-xs opacity-70">{d.sub}</p>
                    {difficulty === d.id && difficulty && (
                      <p className="text-xs font-mono mt-1">{BASE_POINTS[d.id]} pts base</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cyber-text mb-2">
                Estimated Time: <span className="text-cyber-cyan font-mono">{timeMinutes}m</span>
              </p>
              <input
                type="range"
                min="1"
                max="120"
                value={timeMinutes}
                onChange={(e) => setTimeMinutes(Number(e.target.value))}
                className="w-full accent-cyber-cyan"
              />
              <div className="flex justify-between text-xs text-cyber-dim mt-1">
                <span>1m</span><span>1h</span><span>2h</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cyber-text mb-2">Frequency</p>
              <div className="flex gap-2">
                {(["Daily", "Weekdays"] as FrequencyType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all
                      ${frequency === f ? "border-cyber-cyan/60 bg-cyber-cyan/10 text-cyber-cyan" : "border-cyber-border text-cyber-dim hover:border-cyber-border/80"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={() => setStep(2)} disabled={!step1Valid} className="w-full mt-auto">
              Continue →
            </Button>
          </div>
        )}

        {/* Step 2 — Make it stick */}
        {step === 2 && (
          <div className="flex flex-col gap-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold text-cyber-text">Make It Stick</h2>
              <p className="text-cyber-dim text-sm mt-1">Optional but powerful. Skip any you don&apos;t want.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-cyber-text block mb-2">
                Trigger / Cue
                <span className="text-cyber-dim font-normal ml-2 text-xs">What prompts this habit?</span>
              </label>
              <Input
                value={triggerCue}
                onChange={(e) => setTriggerCue(e.target.value)}
                placeholder="After I pour my morning coffee"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {TRIGGER_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setTriggerCue(s)}
                    className="text-xs text-cyber-dim border border-cyber-border/50 rounded-full px-2.5 py-1 hover:text-cyber-cyan hover:border-cyber-cyan/40 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-cyber-text block mb-2">
                Identity Statement
                <span className="text-cyber-dim font-normal ml-2 text-xs">Who are you becoming?</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-3 text-cyber-cyan text-sm font-mono pointer-events-none">
                  I am someone who…
                </div>
                <textarea
                  value={identityStatement}
                  onChange={(e) => setIdentityStatement(e.target.value)}
                  placeholder="thinks clearly every morning"
                  className="w-full bg-cyber-surface border border-cyber-border rounded-xl px-4 pt-10 pb-3
                    text-cyber-text placeholder:text-cyber-muted focus:outline-none focus:border-cyber-cyan/50 transition-all min-h-[80px] resize-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-cyber-text block mb-2">
                Personal Reward
                <span className="text-cyber-dim font-normal ml-2 text-xs">What you treat yourself to after</span>
              </label>
              <Input
                value={rewardNote}
                onChange={(e) => setRewardNote(e.target.value)}
                placeholder="A good stretch and 30s to feel the win"
              />
            </div>

            <Button onClick={() => setStep(3)} className="w-full mt-auto">
              Continue →
            </Button>
          </div>
        )}

        {/* Step 3 — Stack it */}
        {step === 3 && (
          <div className="flex flex-col gap-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold text-cyber-text">Stack It?</h2>
              <p className="text-cyber-dim text-sm mt-1">
                You can add <span className="text-cyber-cyan font-mono">{name}</span> to a stack after saving, from Mission Control.
              </p>
            </div>

            <div className="p-5 bg-cyber-card border border-cyber-border rounded-2xl text-center">
              <div className="text-4xl mb-3">◈</div>
              <p className="text-cyber-text font-bold mb-1">{name}</p>
              <p className="text-cyber-dim text-sm">{category} · {difficulty} · {timeMinutes}m · {frequency}</p>
              {identityStatement && (
                <p className="text-cyber-dim text-xs italic mt-2">"I am someone who {identityStatement}"</p>
              )}
            </div>

            <Button onClick={handleSave} loading={loading} className="w-full">
              Save Habit
            </Button>
            <button onClick={() => router.push("/stacks/new")} className="text-cyber-cyan text-sm text-center hover:underline">
              Add to a stack now →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
