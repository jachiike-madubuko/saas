"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getDuck } from "@/lib/firestore/users";
import { getInventory, getGearItem, unequipItem } from "@/lib/firestore/shop";
import { DuckAvatar } from "@/components/duck/DuckAvatar";
import { RarityBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Duck, InventoryItem, GearItem, GearCategory, DuckStats } from "@/lib/types";

const GEAR_SLOTS: { category: GearCategory; label: string; emoji: string }[] = [
  { category: "Headgear", label: "Head", emoji: "🎭" },
  { category: "Armor", label: "Body", emoji: "🧥" },
  { category: "Weapon", label: "Weapon", emoji: "⚔️" },
  { category: "Boots", label: "Boots", emoji: "👢" },
  { category: "Gadget", label: "Gadget", emoji: "📡" },
  { category: "Implant", label: "Implant", emoji: "⚡" },
  { category: "Accessory", label: "Accessory", emoji: "✦" },
  { category: "Cosmetic", label: "Skin", emoji: "◈" },
];

const STAT_LABELS: (keyof DuckStats)[] = [
  "attack", "defense", "speed", "focus", "discipline", "resilience", "charisma", "energy", "luck"
];

const STAT_COLORS: Record<keyof DuckStats, string> = {
  attack: "bg-cyber-magenta",
  defense: "bg-cyber-cyan",
  speed: "bg-cyber-green",
  focus: "bg-rarity-rare",
  discipline: "bg-cyber-violet",
  resilience: "bg-cat-rest",
  charisma: "bg-cyber-amber",
  energy: "bg-cyber-green",
  luck: "bg-rarity-legendary",
};

function StatBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const color = STAT_COLORS[label as keyof DuckStats] ?? "bg-cyber-cyan";
  return (
    <div className="flex items-center gap-3">
      <span className="text-cyber-dim text-xs capitalize w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-cyber-surface rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
      <span className="text-cyber-dim text-xs font-mono w-6 text-right">{value}</span>
    </div>
  );
}

export default function DuckPage() {
  const { firebaseUser, appUser } = useAuth();
  const router = useRouter();
  const [duck, setDuck] = useState<Duck | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [gearDetails, setGearDetails] = useState<Record<string, GearItem>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<GearCategory | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    Promise.all([getDuck(firebaseUser.uid), getInventory(firebaseUser.uid)])
      .then(async ([d, inv]) => {
        setDuck(d);
        setInventory(inv);
        const details: Record<string, GearItem> = {};
        for (const item of inv) {
          const gear = await getGearItem(item.gearItemId);
          if (gear) details[item.id] = gear;
        }
        setGearDetails(details);
      })
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  const equippedGear = inventory.filter((i) => i.isEquipped);

  const totalStats: DuckStats = equippedGear.reduce(
    (acc, item) => {
      const gear = gearDetails[item.id];
      if (!gear) return acc;
      return {
        attack: acc.attack + gear.stats.attack,
        defense: acc.defense + gear.stats.defense,
        speed: acc.speed + gear.stats.speed,
        focus: acc.focus + gear.stats.focus,
        discipline: acc.discipline + gear.stats.discipline,
        resilience: acc.resilience + gear.stats.resilience,
        charisma: acc.charisma + gear.stats.charisma,
        energy: acc.energy + gear.stats.energy,
        luck: acc.luck + gear.stats.luck,
      };
    },
    { attack: 0, defense: 0, speed: 0, focus: 0, discipline: 0, resilience: 0, charisma: 0, energy: 0, luck: 0 }
  );

  const maxStat = Math.max(1, ...Object.values(totalStats));

  const handleUnequip = async (item: InventoryItem) => {
    if (!firebaseUser || !duck) return;
    const gear = gearDetails[item.id];
    if (!gear) return;
    await unequipItem(firebaseUser.uid, item, gear);
    setInventory((prev) => prev.map((i) => i.id === item.id ? { ...i, isEquipped: false, equippedSlot: null } : i));
    setDuck((prev) => prev ? { ...prev, [`equipped${gear.category}Id`]: null } : prev);
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-cyber-bg">
      <div className="text-4xl animate-float">🦆</div>
    </div>
  );

  if (!duck) return null;

  return (
    <div className="min-h-full bg-cyber-bg grid-bg">
      <div className="px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto">
        {/* Duck hero */}
        <div className="text-center">
          <DuckAvatar duck={duck} size="xl" />
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-cyber-text">{duck.name}</h1>
            <p className="text-cyber-dim text-sm">Level {duck.duckLevel} companion</p>
            {appUser && (
              <p className="text-cyber-cyan text-xs font-mono mt-1">
                {appUser.pointsBalance.toLocaleString()} pts available
              </p>
            )}
          </div>
        </div>

        {/* Gear slots */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-cyber-text">Loadout</h2>
            <button onClick={() => router.push("/shop")} className="text-cyber-cyan text-xs hover:underline">
              Shop →
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {GEAR_SLOTS.map((slot) => {
              const equippedItem = inventory.find((i) => i.equippedSlot === slot.category);
              const equippedGear = equippedItem ? gearDetails[equippedItem.id] : null;
              return (
                <button
                  key={slot.category}
                  onClick={() => setSelectedSlot(selectedSlot === slot.category ? null : slot.category)}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 text-xs transition-all
                    ${equippedGear
                      ? "border-cyber-cyan/40 bg-cyber-cyan/5"
                      : "border-cyber-border bg-cyber-surface border-dashed"
                    }
                    ${selectedSlot === slot.category ? "ring-1 ring-cyber-cyan" : ""}
                    hover:border-cyber-cyan/40 active:scale-95`}
                >
                  <span className="text-xl">{equippedGear?.emoji ?? slot.emoji}</span>
                  <span className={`font-mono ${equippedGear ? "text-cyber-cyan" : "text-cyber-dim"}`}>
                    {equippedGear ? equippedGear.name.split(" ")[0] : slot.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Slot detail */}
          {selectedSlot && (() => {
            const equippedItem = inventory.find((i) => i.equippedSlot === selectedSlot);
            const gear = equippedItem ? gearDetails[equippedItem.id] : null;
            return (
              <div className="mt-3 p-4 bg-cyber-card border border-cyber-border rounded-2xl animate-slide-up">
                {gear && equippedItem ? (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{gear.emoji}</span>
                          <p className="font-bold text-cyber-text">{gear.name}</p>
                        </div>
                        <RarityBadge rarity={gear.rarity} />
                      </div>
                      <button
                        onClick={() => handleUnequip(equippedItem)}
                        className="text-cyber-dim text-xs hover:text-cyber-red transition-colors"
                      >
                        Unequip
                      </button>
                    </div>
                    <p className="text-cyber-dim text-xs italic mb-3">{gear.loreText}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {STAT_LABELS.filter((s) => gear.stats[s] > 0).map((s) => (
                        <div key={s} className="text-center">
                          <p className="text-cyber-dim text-xs capitalize">{s}</p>
                          <p className="text-cyber-cyan font-mono font-bold">+{gear.stats[s]}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => router.push("/inventory")}
                      className="mt-3 w-full text-center text-xs text-cyber-cyan hover:underline"
                    >
                      View inventory to swap →
                    </button>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-cyber-dim text-sm mb-2">No {selectedSlot} equipped</p>
                    <button onClick={() => router.push("/shop")} className="text-cyber-cyan text-sm hover:underline">
                      Visit shop →
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </section>

        {/* Stats */}
        <section>
          <h2 className="font-bold text-cyber-text mb-3">Operative Stats</h2>
          <Card className="p-4">
            <div className="flex flex-col gap-2.5">
              {STAT_LABELS.map((stat) => (
                <StatBar key={stat} label={stat} value={totalStats[stat]} max={Math.max(maxStat, 10)} />
              ))}
            </div>
            {equippedGear.length === 0 && (
              <p className="text-cyber-dim text-xs text-center mt-3">
                Equip gear to boost stats. Stats fuel V2 combat.
              </p>
            )}
          </Card>
        </section>

        {/* Duck XP */}
        <section>
          <Card className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-cyber-dim text-xs font-mono mb-1">Companion Bond</p>
              <p className="font-bold text-cyber-text">Level {duck.duckLevel}</p>
              <div className="h-1.5 bg-cyber-surface rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-cyber-amber rounded-full"
                  style={{ width: `${(duck.duckXp % 100)}%` }}
                />
              </div>
              <p className="text-cyber-dim text-xs mt-1">{duck.duckXp} bond XP</p>
            </div>
            <div className="text-center">
              <p className="text-3xl">{equippedGear.length}</p>
              <p className="text-cyber-dim text-xs">gear equipped</p>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
