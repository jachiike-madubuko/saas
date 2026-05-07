// ─── Enums ──────────────────────────────────────────────────────────────────

export type HabitCategory = "Mind" | "Body" | "Focus" | "Social" | "Create" | "Rest";
export type HabitDifficulty = "Nano" | "Easy" | "Medium" | "Hard";
export type FrequencyType = "Daily" | "Weekdays" | "Custom";
export type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Anytime";
export type GearCategory = "Weapon" | "Headgear" | "Armor" | "Boots" | "Gadget" | "Implant" | "Accessory" | "Cosmetic";
export type GearRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
export type StackMastery = "Rookie" | "Wired" | "Neural" | "Chrome" | "Ghost" | "Legend";
export type PersonalityMode = "Playful" | "Serious" | "Stoic";
export type DuckPersonality = "Glitch" | "Zero" | "Wren";

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
  runnerLevel: number;
  runnerXp: number;
  pointsBalance: number;
  pointsTotalEarned: number;
  systemGlitchTokens: number;
  onboardingComplete: boolean;
  theme: "dark-neon" | "dark-mono" | "soft-cyber";
  notificationPreferences: {
    enabled: boolean;
    tone: "Gentle" | "Standard" | "Drill";
  };
}

// ─── Duck ────────────────────────────────────────────────────────────────────

export interface Duck {
  id: string;
  userId: string;
  name: string;
  personality: DuckPersonality;
  personalityMode: PersonalityMode;
  duckLevel: number;
  duckXp: number;
  equippedWeaponId: string | null;
  equippedHeadgearId: string | null;
  equippedArmorId: string | null;
  equippedBootsId: string | null;
  equippedGadgetId: string | null;
  equippedImplantId: string | null;
  equippedAccessoryId: string | null;
  equippedCosmeticId: string | null;
}

export interface DuckStats {
  attack: number;
  defense: number;
  speed: number;
  focus: number;
  discipline: number;
  resilience: number;
  charisma: number;
  energy: number;
  luck: number;
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export interface Habit {
  id: string;
  userId: string;
  name: string;
  category: HabitCategory;
  difficulty: HabitDifficulty;
  estimatedTimeMinutes: number;
  frequencyType: FrequencyType;
  frequencyDays: number[] | null;
  triggerCue: string | null;
  identityStatement: string | null;
  rewardNote: string | null;
  stackEligible: boolean;
  notes: string | null;
  isPaused: boolean;
  createdAt: number;
  archivedAt: number | null;
}

export interface HabitCompletionLog {
  id: string;
  userId: string;
  habitId: string;
  stackId: string | null;
  completedAt: number;
  wasInOrder: boolean;
  pointsEarned: number;
  xpEarned: number;
}

// ─── Stacks ──────────────────────────────────────────────────────────────────

export interface HabitStack {
  id: string;
  userId: string;
  name: string;
  timeOfDay: TimeOfDay;
  frequencyType: FrequencyType;
  frequencyDays: number[] | null;
  currentStreak: number;
  longestStreak: number;
  masteryLevel: StackMastery;
  totalCompletions: number;
  createdAt: number;
  archivedAt: number | null;
}

export interface StackStep {
  id: string;
  stackId: string;
  habitId: string;
  position: number;
}

export interface StackCompletionLog {
  id: string;
  userId: string;
  stackId: string;
  completedAt: number;
  allInOrder: boolean;
  basePoints: number;
  completionBonus: number;
  streakMultiplier: number;
  totalPoints: number;
  streakDay: number;
}

// ─── Gear ────────────────────────────────────────────────────────────────────

export interface GearItem {
  id: string;
  name: string;
  category: GearCategory;
  rarity: GearRarity;
  basePrice: number;
  loreText: string;
  emoji: string;
  stats: DuckStats;
  maxUpgradeLevel: number;
  isActive: boolean;
  availableFrom: number | null;
  availableUntil: number | null;
}

export interface InventoryItem {
  id: string;
  userId: string;
  gearItemId: string;
  upgradeLevel: number;
  acquiredAt: number;
  isEquipped: boolean;
  equippedSlot: GearCategory | null;
}

// ─── Rewards ─────────────────────────────────────────────────────────────────

export type TransactionType = "HabitComplete" | "StackComplete" | "Quest" | "Achievement" | "Purchase" | "Upgrade";

export interface RewardTransaction {
  id: string;
  userId: string;
  amount: number;
  transactionType: TransactionType;
  referenceId: string | null;
  balanceAfter: number;
  description: string;
  createdAt: number;
}

// ─── Streak ──────────────────────────────────────────────────────────────────

export interface Streak {
  id: string;
  userId: string;
  entityType: "Habit" | "Stack";
  entityId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  streakProtected: boolean;
  updatedAt: number;
}

// ─── Daily Quest ─────────────────────────────────────────────────────────────

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  pointReward: number;
  xpReward: number;
  questType: "any-stack" | "category" | "difficulty" | "streak";
  targetCategory?: HabitCategory;
  targetDifficulty?: HabitDifficulty;
  targetCount: number;
}

export interface UserDailyQuest {
  questId: string;
  date: string;
  completed: boolean;
  progress: number;
}

// ─── UI State Types ───────────────────────────────────────────────────────────

export interface StackSession {
  stackId: string;
  steps: StackStep[];
  habits: Habit[];
  completedHabitIds: string[];
  startedAt: number;
  isComplete: boolean;
}

export interface PointsAnimation {
  id: string;
  amount: number;
  label: string;
  x: number;
  y: number;
}
