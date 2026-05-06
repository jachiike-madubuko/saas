"use client";

import {
  createContext, useContext, useEffect, useState, useCallback,
} from "react";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut as firebaseSignOut, onAuthStateChanged, type User as FBUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { createUser, getUser } from "@/lib/firestore/users";
import type { User } from "@/lib/types";

interface AuthContextValue {
  firebaseUser: FBUser | null;
  appUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FBUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAppUser = useCallback(async () => {
    if (!firebaseUser) return;
    const user = await getUser(firebaseUser.uid);
    setAppUser(user);
  }, [firebaseUser]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const user = await getUser(fbUser.uid);
        setAppUser(user);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await createUser(cred.user.uid, email, displayName);
    const user = await getUser(cred.user.uid);
    setAppUser(user);
  };

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = await getUser(cred.user.uid);
    setAppUser(user);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setAppUser(null);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading, signUp, signIn, signOut, refreshAppUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
