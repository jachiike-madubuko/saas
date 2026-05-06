"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await signUp(email, password, displayName);
      router.push("/onboarding");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) {
        setError("That email is already registered.");
      } else {
        setError("Something went wrong. Check your connection and retry.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Runner Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="What do they call you?"
        required
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="runner@neon.city"
        required
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Min 6 characters"
        required
        autoComplete="new-password"
      />
      {error && <p className="text-cyber-red text-sm text-center">{error}</p>}
      <Button type="submit" loading={loading} className="w-full mt-2">
        Initialize Runner
      </Button>
      <p className="text-center text-cyber-dim text-sm">
        Already jacked in?{" "}
        <Link href="/login" className="text-cyber-cyan hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
