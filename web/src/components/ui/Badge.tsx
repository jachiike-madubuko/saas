import type { GearRarity, HabitCategory, HabitDifficulty, StackMastery } from "@/lib/types";

export function RarityBadge({ rarity }: { rarity: GearRarity }) {
  const styles: Record<GearRarity, string> = {
    Common: "text-rarity-common border-rarity-common/30 bg-rarity-common/10",
    Uncommon: "text-rarity-uncommon border-rarity-uncommon/30 bg-rarity-uncommon/10",
    Rare: "text-rarity-rare border-rarity-rare/30 bg-rarity-rare/10",
    Epic: "text-rarity-epic border-rarity-epic/30 bg-rarity-epic/10",
    Legendary: "text-rarity-legendary border-rarity-legendary/30 bg-rarity-legendary/10",
  };
  return (
    <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${styles[rarity]}`}>
      {rarity.toUpperCase()}
    </span>
  );
}

export function CategoryBadge({ category }: { category: HabitCategory }) {
  const styles: Record<HabitCategory, { bg: string; text: string; emoji: string }> = {
    Mind: { bg: "bg-cat-mind/20 border-cat-mind/30", text: "text-cat-mind", emoji: "🧠" },
    Body: { bg: "bg-cat-body/20 border-cat-body/30", text: "text-cat-body", emoji: "⚡" },
    Focus: { bg: "bg-cat-focus/20 border-cat-focus/30", text: "text-cat-focus", emoji: "🎯" },
    Social: { bg: "bg-cat-social/20 border-cat-social/30", text: "text-cat-social", emoji: "🌐" },
    Create: { bg: "bg-cat-create/20 border-cat-create/30", text: "text-cat-create", emoji: "✦" },
    Rest: { bg: "bg-cat-rest/20 border-cat-rest/30", text: "text-cat-rest", emoji: "🌙" },
  };
  const s = styles[category];
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${s.bg} ${s.text}`}>
      {s.emoji} {category}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: HabitDifficulty }) {
  const styles: Record<HabitDifficulty, string> = {
    Nano: "text-cyber-dim border-cyber-dim/30 bg-cyber-dim/10",
    Easy: "text-cyber-green border-cyber-green/30 bg-cyber-green/10",
    Medium: "text-cyber-amber border-cyber-amber/30 bg-cyber-amber/10",
    Hard: "text-cyber-magenta border-cyber-magenta/30 bg-cyber-magenta/10",
  };
  const labels: Record<HabitDifficulty, string> = {
    Nano: "Micro-op",
    Easy: "Standard",
    Medium: "Mission",
    Hard: "Deep Dive",
  };
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${styles[difficulty]}`}>
      {labels[difficulty]}
    </span>
  );
}

export function MasteryBadge({ mastery }: { mastery: StackMastery }) {
  const styles: Record<StackMastery, { color: string; emoji: string }> = {
    Rookie: { color: "text-cyber-dim border-cyber-dim/30", emoji: "◦" },
    Wired: { color: "text-cyber-green border-cyber-green/30", emoji: "◈" },
    Neural: { color: "text-cyber-cyan border-cyber-cyan/30", emoji: "◉" },
    Chrome: { color: "text-rarity-rare border-rarity-rare/30", emoji: "⬡" },
    Ghost: { color: "text-rarity-epic border-rarity-epic/30", emoji: "✦" },
    Legend: { color: "text-rarity-legendary border-rarity-legendary/30", emoji: "★" },
  };
  const s = styles[mastery];
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border bg-cyber-surface/50 ${s.color}`}>
      {s.emoji} {mastery}
    </span>
  );
}
