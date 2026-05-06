"use client";

import type { Duck } from "@/lib/types";

const DUCK_PERSONALITIES = {
  Glitch: { color: "#ff00c8", accent: "#ff00c8", tagline: "Chaos operative" },
  Zero: { color: "#00f5ff", accent: "#00f5ff", tagline: "Precision unit" },
  Wren: { color: "#ffb800", accent: "#ffb800", tagline: "Field agent" },
};

interface DuckAvatarProps {
  duck: Duck;
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
}

export function DuckAvatar({ duck, size = "md", animate = true }: DuckAvatarProps) {
  const personality = DUCK_PERSONALITIES[duck.personality] ?? DUCK_PERSONALITIES.Wren;

  const sizeMap = {
    sm: { container: "w-12 h-12 text-3xl", glow: "w-16 h-16" },
    md: { container: "w-20 h-20 text-5xl", glow: "w-28 h-28" },
    lg: { container: "w-32 h-32 text-7xl", glow: "w-44 h-44" },
    xl: { container: "w-44 h-44 text-8xl", glow: "w-56 h-56" },
  };

  const s = sizeMap[size];

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow */}
      <div
        className={`absolute ${s.glow} rounded-full opacity-20 blur-2xl`}
        style={{ background: `radial-gradient(circle, ${personality.color} 0%, transparent 70%)` }}
      />
      {/* Duck body */}
      <div
        className={`relative ${s.container} rounded-full bg-cyber-surface border-2 flex items-center justify-center
          ${animate ? "animate-float" : ""}`}
        style={{ borderColor: `${personality.color}60` }}
      >
        <span className="select-none" style={{ filter: `drop-shadow(0 0 8px ${personality.color}80)` }}>
          🦆
        </span>
        {/* Gear indicator dots */}
        {duck.equippedHeadgearId && (
          <span className="absolute -top-1 right-0 text-xs">🎭</span>
        )}
        {duck.equippedArmorId && (
          <span className="absolute -bottom-1 left-0 text-xs">🧥</span>
        )}
        {duck.equippedWeaponId && (
          <span className="absolute -bottom-1 right-0 text-xs">⚔️</span>
        )}
      </div>
      {/* Level badge */}
      {size !== "sm" && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyber-bg border border-cyber-border rounded-full px-2 py-0.5 text-xs font-mono text-cyber-cyan whitespace-nowrap">
          Lv {duck.duckLevel}
        </div>
      )}
    </div>
  );
}

export function DuckGreeting({ duck, timeOfDay }: { duck: Duck; timeOfDay: "morning" | "afternoon" | "evening" }) {
  const messages: Record<Duck["personality"], Record<typeof timeOfDay, string>> = {
    Glitch: {
      morning: "System boot. Chaos loading. Ready when you are.",
      afternoon: "Midday check-in. Still running hot.",
      evening: "Night mode active. Final ops for the day?",
    },
    Zero: {
      morning: "Designation: ZERO. Daily objectives queued.",
      afternoon: "Afternoon protocols active. Efficiency nominal.",
      evening: "End-of-day assessment. Log your completions.",
    },
    Wren: {
      morning: "Morning, runner. Coffee's hot. Stack's ready.",
      afternoon: "Hey. Still here. What's next on the list?",
      evening: "Good run today. Let's finish strong.",
    },
  };

  return (
    <p className="text-cyber-dim text-sm italic">
      {messages[duck.personality]?.[timeOfDay] ?? "Systems online. Let's run."}
    </p>
  );
}
