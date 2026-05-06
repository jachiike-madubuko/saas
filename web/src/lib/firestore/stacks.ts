import {
  collection, addDoc, doc, updateDoc, getDocs,
  query, where, orderBy, writeBatch, getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { HabitStack, StackStep, StackCompletionLog, Habit } from "../types";
import { calculateStackReward, masteryLevel } from "../points";
import { addPoints, addXp } from "./users";

// ─── Stacks ───────────────────────────────────────────────────────────────────

export async function createStack(
  uid: string,
  data: Pick<HabitStack, "name" | "timeOfDay" | "frequencyType" | "frequencyDays">,
  habitIds: string[]
): Promise<HabitStack> {
  const stack: Omit<HabitStack, "id"> = {
    ...data,
    userId: uid,
    currentStreak: 0,
    longestStreak: 0,
    masteryLevel: "Rookie",
    totalCompletions: 0,
    createdAt: Date.now(),
    archivedAt: null,
  };

  const ref = await addDoc(collection(db, "users", uid, "stacks"), stack);
  await updateDoc(ref, { id: ref.id });
  const created = { ...stack, id: ref.id };

  const batch = writeBatch(db);
  habitIds.forEach((habitId, index) => {
    const stepRef = doc(collection(db, "users", uid, "stacks", ref.id, "steps"));
    batch.set(stepRef, {
      id: stepRef.id,
      stackId: ref.id,
      habitId,
      position: index + 1,
    } satisfies StackStep);
  });
  await batch.commit();

  return created;
}

export async function getStacks(uid: string): Promise<HabitStack[]> {
  const q = query(
    collection(db, "users", uid, "stacks"),
    where("archivedAt", "==", null),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as HabitStack);
}

export async function getStackSteps(uid: string, stackId: string): Promise<StackStep[]> {
  const q = query(
    collection(db, "users", uid, "stacks", stackId, "steps"),
    orderBy("position", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as StackStep);
}

export async function updateStack(uid: string, stackId: string, data: Partial<HabitStack>): Promise<void> {
  await updateDoc(doc(db, "users", uid, "stacks", stackId), data as Record<string, unknown>);
}

// ─── Complete a Stack ─────────────────────────────────────────────────────────

export async function completeStack(
  uid: string,
  stack: HabitStack,
  completedHabits: Habit[],
  allInOrder: boolean
): Promise<StackCompletionLog> {
  const difficulties = completedHabits.map((h) => h.difficulty);
  const newStreak = stack.currentStreak + 1;
  const reward = calculateStackReward(difficulties, newStreak, allInOrder);

  const log: Omit<StackCompletionLog, "id"> = {
    userId: uid,
    stackId: stack.id,
    completedAt: Date.now(),
    allInOrder,
    basePoints: reward.habitPoints,
    completionBonus: reward.completionBonus,
    streakMultiplier: reward.multiplier,
    totalPoints: reward.totalPoints,
    streakDay: newStreak,
  };

  const ref = await addDoc(collection(db, "users", uid, "stackCompletions"), log);

  const newMastery = masteryLevel(newStreak);
  await updateDoc(doc(db, "users", uid, "stacks", stack.id), {
    currentStreak: newStreak,
    longestStreak: Math.max(stack.longestStreak, newStreak),
    masteryLevel: newMastery,
    totalCompletions: stack.totalCompletions + 1,
  });

  await addPoints(uid, reward.totalPoints, "StackComplete", `Stack: ${stack.name}`, ref.id);
  await addXp(uid, completedHabits.length * 5);

  return { ...log, id: ref.id };
}
