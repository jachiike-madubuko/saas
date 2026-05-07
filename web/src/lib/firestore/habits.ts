import {
  collection, addDoc, doc, updateDoc, deleteDoc, getDocs,
  query, where, orderBy, getDoc, setDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Habit, HabitCompletionLog } from "../types";
import { habitPoints, habitXp } from "../points";

// ─── Habits ───────────────────────────────────────────────────────────────────

export async function createHabit(uid: string, data: Omit<Habit, "id" | "userId" | "createdAt" | "archivedAt" | "isPaused">): Promise<Habit> {
  const habit: Omit<Habit, "id"> = {
    ...data,
    userId: uid,
    isPaused: false,
    createdAt: Date.now(),
    archivedAt: null,
  };
  const ref = await addDoc(collection(db, "users", uid, "habits"), habit);
  const created = { ...habit, id: ref.id };
  await updateDoc(ref, { id: ref.id });
  return created;
}

export async function getHabits(uid: string): Promise<Habit[]> {
  const q = query(
    collection(db, "users", uid, "habits"),
    where("archivedAt", "==", null),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Habit);
}

export async function updateHabit(uid: string, habitId: string, data: Partial<Habit>): Promise<void> {
  await updateDoc(doc(db, "users", uid, "habits", habitId), data as Record<string, unknown>);
}

export async function archiveHabit(uid: string, habitId: string): Promise<void> {
  await updateDoc(doc(db, "users", uid, "habits", habitId), { archivedAt: Date.now() });
}

// ─── Habit Completions ────────────────────────────────────────────────────────

export async function completeHabit(
  uid: string,
  habit: Habit,
  stackId: string | null,
  wasInOrder: boolean
): Promise<HabitCompletionLog> {
  const pts = habitPoints(habit.difficulty, stackId !== null);
  const xp = habitXp(habit.difficulty);

  const log: Omit<HabitCompletionLog, "id"> = {
    userId: uid,
    habitId: habit.id,
    stackId,
    completedAt: Date.now(),
    wasInOrder,
    pointsEarned: pts,
    xpEarned: xp,
  };

  const ref = await addDoc(collection(db, "users", uid, "habitCompletions"), log);
  return { ...log, id: ref.id };
}

export async function getTodayCompletions(uid: string): Promise<HabitCompletionLog[]> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, "users", uid, "habitCompletions"),
    where("completedAt", ">=", startOfDay.getTime()),
    orderBy("completedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as HabitCompletionLog);
}

export async function isHabitCompletedToday(uid: string, habitId: string): Promise<boolean> {
  const completions = await getTodayCompletions(uid);
  return completions.some((c) => c.habitId === habitId);
}
