import type { HabitDifficulty, StackMastery } from "./types";

// ─── Base Points ──────────────────────────────────────────────────────────────

export const BASE_POINTS: Record<HabitDifficulty, number> = {
  Nano: 5,
  Easy: 15,
  Medium: 30,
  Hard: 60,
};

export const BASE_XP: Record<HabitDifficulty, number> = {
  Nano: 1,
  Easy: 3,
  Medium: 6,
  Hard: 12,
};

// In-stack bonus multiplier (40% more than solo)
const IN_STACK_MULTIPLIER = 1.4;

export function habitPoints(difficulty: HabitDifficulty, inStack: boolean): number {
  const base = BASE_POINTS[difficulty];
  return inStack ? Math.round(base * IN_STACK_MULTIPLIER) : base;
}

export function habitXp(difficulty: HabitDifficulty): number {
  return BASE_XP[difficulty];
}

// ─── Stack Completion Bonus ───────────────────────────────────────────────────

const STACK_COMPLETION_BONUS: Record<number, number> = {
  2: 20,
  3: 35,
  4: 55,
  5: 80,
};

export function stackCompletionBonus(habitCount: number): number {
  if (habitCount <= 1) return 0;
  if (habitCount >= 6) return 110;
  return STACK_COMPLETION_BONUS[habitCount] ?? 80;
}

// ─── Streak Multiplier ────────────────────────────────────────────────────────

export function streakMultiplier(streakDays: number): number {
  if (streakDays < 3) return 1.0;
  if (streakDays < 7) return 1.25;
  if (streakDays < 14) return 1.5;
  if (streakDays < 30) return 1.75;
  if (streakDays < 60) return 2.0;
  if (streakDays < 100) return 2.25;
  return 2.5; // hard cap
}

// ─── Out-of-order penalty ─────────────────────────────────────────────────────

const OUT_OF_ORDER_PENALTY = 0.8; // 20% reduction

export function applyOrderPenalty(bonus: number, allInOrder: boolean): number {
  return allInOrder ? bonus : Math.round(bonus * OUT_OF_ORDER_PENALTY);
}

// ─── Daily Cap ────────────────────────────────────────────────────────────────

const SOFT_CAP = 500;
const HARD_CAP = 800;

export function applyDailyCap(pointsEarnedToday: number, newPoints: number): number {
  if (pointsEarnedToday >= HARD_CAP) return 0;
  if (pointsEarnedToday + newPoints > HARD_CAP) {
    return HARD_CAP - pointsEarnedToday;
  }
  if (pointsEarnedToday >= SOFT_CAP) {
    return Math.round(newPoints * 0.5);
  }
  if (pointsEarnedToday + newPoints > SOFT_CAP) {
    const fullPart = SOFT_CAP - pointsEarnedToday;
    const halfPart = Math.round((newPoints - fullPart) * 0.5);
    return fullPart + halfPart;
  }
  return newPoints;
}

// ─── Full Stack Calculation ───────────────────────────────────────────────────

export interface StackRewardResult {
  habitPoints: number;
  completionBonus: number;
  multipliedBonus: number;
  totalPoints: number;
  multiplier: number;
  breakdown: string;
}

export function calculateStackReward(
  difficulties: HabitDifficulty[],
  streakDays: number,
  allInOrder: boolean
): StackRewardResult {
  const habitPts = difficulties.reduce(
    (sum, d) => sum + habitPoints(d, true),
    0
  );
  const rawBonus = stackCompletionBonus(difficulties.length);
  const orderedBonus = applyOrderPenalty(rawBonus, allInOrder);
  const mult = streakMultiplier(streakDays);
  const multipliedBonus = Math.round(orderedBonus * mult);
  const totalPoints = habitPts + multipliedBonus;

  const breakdown = `${habitPts} habit pts + ${multipliedBonus} bonus (${mult}× streak)`;

  return { habitPoints: habitPts, completionBonus: orderedBonus, multipliedBonus, totalPoints, multiplier: mult, breakdown };
}

// ─── Mastery Level ────────────────────────────────────────────────────────────

export function masteryLevel(streak: number): StackMastery {
  if (streak >= 100) return "Legend";
  if (streak >= 60) return "Ghost";
  if (streak >= 30) return "Chrome";
  if (streak >= 14) return "Neural";
  if (streak >= 7) return "Wired";
  return "Rookie";
}

export const MASTERY_BONUS: Record<StackMastery, number> = {
  Rookie: 0,
  Wired: 0.1,
  Neural: 0.2,
  Chrome: 0.3,
  Ghost: 0.4,
  Legend: 0.5,
};

// ─── Runner Level ─────────────────────────────────────────────────────────────

const LEVEL_XP_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250, 2750];

export function runnerLevel(totalXp: number): number {
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function xpForNextLevel(currentLevel: number): number {
  return LEVEL_XP_THRESHOLDS[currentLevel] ?? LEVEL_XP_THRESHOLDS[LEVEL_XP_THRESHOLDS.length - 1];
}

// ─── Gear Pricing Reference ───────────────────────────────────────────────────

export const RARITY_PRICE_RANGE = {
  Common: { min: 100, max: 250 },
  Uncommon: { min: 400, max: 700 },
  Rare: { min: 1000, max: 1800 },
  Epic: { min: 3000, max: 5000 },
  Legendary: { min: 8000, max: 12000 },
};
