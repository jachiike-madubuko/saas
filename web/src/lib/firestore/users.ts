import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc, query, where, getDocs, orderBy, limit,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { User, Duck, RewardTransaction } from "../types";

// ─── User ─────────────────────────────────────────────────────────────────────

export async function createUser(uid: string, email: string, displayName: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    id: uid,
    email,
    displayName,
    createdAt: Date.now(),
    runnerLevel: 1,
    runnerXp: 0,
    pointsBalance: 0,
    pointsTotalEarned: 0,
    systemGlitchTokens: 1,
    onboardingComplete: false,
    theme: "dark-neon",
    notificationPreferences: { enabled: true, tone: "Standard" },
  } satisfies User);
}

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function updateUser(uid: string, data: Partial<User>): Promise<void> {
  await updateDoc(doc(db, "users", uid), data as Record<string, unknown>);
}

export async function addPoints(uid: string, amount: number, type: string, description: string, referenceId?: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const user = snap.data() as User;
  const newBalance = user.pointsBalance + amount;
  const newTotal = amount > 0 ? user.pointsTotalEarned + amount : user.pointsTotalEarned;

  await updateDoc(userRef, {
    pointsBalance: newBalance,
    pointsTotalEarned: newTotal,
  });

  await addDoc(collection(db, "users", uid, "transactions"), {
    id: "",
    userId: uid,
    amount,
    transactionType: type,
    referenceId: referenceId ?? null,
    balanceAfter: newBalance,
    description,
    createdAt: Date.now(),
  } as RewardTransaction);
}

export async function addXp(uid: string, xp: number): Promise<void> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const user = snap.data() as User;
  await updateDoc(userRef, { runnerXp: user.runnerXp + xp });
}

// ─── Duck ─────────────────────────────────────────────────────────────────────

export async function createDuck(uid: string, name: string, personality: string): Promise<Duck> {
  const duck: Duck = {
    id: uid,
    userId: uid,
    name,
    personality: personality as Duck["personality"],
    personalityMode: "Playful",
    duckLevel: 1,
    duckXp: 0,
    equippedWeaponId: null,
    equippedHeadgearId: null,
    equippedArmorId: null,
    equippedBootsId: null,
    equippedGadgetId: null,
    equippedImplantId: null,
    equippedAccessoryId: null,
    equippedCosmeticId: null,
  };
  await setDoc(doc(db, "users", uid, "duck", uid), duck);
  return duck;
}

export async function getDuck(uid: string): Promise<Duck | null> {
  const snap = await getDoc(doc(db, "users", uid, "duck", uid));
  return snap.exists() ? (snap.data() as Duck) : null;
}

export async function updateDuck(uid: string, data: Partial<Duck>): Promise<void> {
  await updateDoc(doc(db, "users", uid, "duck", uid), data as Record<string, unknown>);
}

export async function getRecentTransactions(uid: string, limitCount = 20): Promise<RewardTransaction[]> {
  const q = query(
    collection(db, "users", uid, "transactions"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as RewardTransaction);
}
