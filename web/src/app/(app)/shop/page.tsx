"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getShopItems, getInventory, purchaseItem, equipItem } from "@/lib/firestore/shop";
import { RarityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { GearItem, InventoryItem, GearCategory } from "@/lib/types";

const CATEGORY_FILTERS: { id: GearCategory | "All"; label: string }[] = [
  { id: "All", label: "All" },
  { id: "Weapon", label: "Weapon" },
  { id: "Headgear", label: "Head" },
  { id: "Armor", label: "Body" },
  { id: "Boots", label: "Boots" },
  { id: "Gadget", label: "Gadget" },
  { id: "Implant", label: "Implant" },
  { id: "Accessory", label: "Access." },
  { id: "Cosmetic", label: "Skin" },
];

export default function ShopPage() {
  const { appUser, firebaseUser, refreshAppUser } = useAuth();
  const [items, setItems] = useState<GearItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<GearCategory | "All">("All");
  const [selected, setSelected] = useState<GearItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    Promise.all([getShopItems(), getInventory(firebaseUser.uid)])
      .then(([shopItems, inv]) => {
        setItems(shopItems);
        setInventory(inv);
      })
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const alreadyOwned = (itemId: string) => inventory.some((i) => i.gearItemId === itemId);

  const handlePurchase = async () => {
    if (!firebaseUser || !appUser || !selected) return;
    setPurchasing(true);
    try {
      const newItem = await purchaseItem(firebaseUser.uid, selected, appUser.pointsBalance);
      setInventory((prev) => [...prev, newItem]);
      await refreshAppUser();
      showToast(`${selected.name} acquired!`, "success");
      setSelected(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Purchase failed";
      showToast(msg, "error");
    } finally {
      setPurchasing(false);
    }
  };

  const handleEquip = async (invItem: InventoryItem, gearItem: GearItem) => {
    if (!firebaseUser) return;
    await equipItem(firebaseUser.uid, invItem, gearItem);
    setInventory((prev) => prev.map((i) =>
      i.equippedSlot === gearItem.category && i.id !== invItem.id
        ? { ...i, isEquipped: false, equippedSlot: null }
        : i.id === invItem.id
        ? { ...i, isEquipped: true, equippedSlot: gearItem.category }
        : i
    ));
    showToast(`${gearItem.name} equipped!`, "success");
    setSelected(null);
  };

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

  const rarityOrder = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 4 };
  const sorted = [...filtered].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);

  return (
    <div className="min-h-full bg-cyber-bg grid-bg">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto px-4 py-3 rounded-xl text-sm font-medium text-center animate-slide-up
          ${toast.type === "success" ? "bg-cyber-green/20 border border-cyber-green/40 text-cyber-green" : "bg-cyber-red/20 border border-cyber-red/40 text-cyber-red"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-cyber-bg/90 backdrop-blur-md border-b border-cyber-border px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-bold text-xl text-cyber-text">Night Market</h1>
          <div className="flex items-center gap-1.5 bg-cyber-surface border border-cyber-border rounded-full px-3 py-1.5">
            <span className="text-cyber-amber text-xs">◈</span>
            <span className="text-cyber-text font-mono font-bold text-sm">{appUser?.pointsBalance ?? 0}</span>
          </div>
        </div>
        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0
                ${filter === cat.id
                  ? "border-cyber-cyan/60 bg-cyber-cyan/10 text-cyber-cyan"
                  : "border-cyber-border text-cyber-dim hover:text-cyber-text"}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {loading ? (
          <div className="text-center py-16">
            <div className="text-4xl animate-float mb-3">◈</div>
            <p className="text-cyber-dim text-sm">Loading inventory…</p>
          </div>
        ) : sorted.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-cyber-dim">No items in this category yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sorted.map((item) => {
              const owned = alreadyOwned(item.id);
              const canAfford = (appUser?.pointsBalance ?? 0) >= item.basePrice;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`p-4 rounded-2xl border text-left transition-all active:scale-95
                    ${owned ? "border-cyber-green/30 bg-cyber-green/5" : "border-cyber-border bg-cyber-card hover:border-cyber-cyan/30"}
                    ${selected?.id === item.id ? "ring-1 ring-cyber-cyan" : ""}`}
                >
                  <div className="text-4xl mb-2 text-center">{item.emoji}</div>
                  <p className="text-cyber-text text-xs font-bold mb-1 truncate">{item.name}</p>
                  <RarityBadge rarity={item.rarity} />
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs font-mono font-bold ${owned ? "text-cyber-green" : canAfford ? "text-cyber-amber" : "text-cyber-dim"}`}>
                      {owned ? "Owned" : `${item.basePrice} pts`}
                    </span>
                    <span className="text-xs text-cyber-dim">{item.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Item detail modal */}
      {selected && (() => {
        const owned = alreadyOwned(selected.id);
        const invItem = inventory.find((i) => i.gearItemId === selected.id);
        const canAfford = (appUser?.pointsBalance ?? 0) >= selected.basePrice;
        const totalStats = Object.values(selected.stats).reduce((a, b) => a + b, 0);

        return (
          <div className="fixed inset-0 z-40 flex items-end justify-center" onClick={() => setSelected(null)}>
            <div className="absolute inset-0 bg-cyber-bg/80 backdrop-blur-sm" />
            <div
              className="relative z-50 w-full max-w-lg bg-cyber-card border-t border-cyber-border rounded-t-3xl p-6 animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-6xl">{selected.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-cyber-text text-lg">{selected.name}</h2>
                  </div>
                  <RarityBadge rarity={selected.rarity} />
                  <p className="text-cyber-dim text-xs mt-2 italic">{selected.loreText}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {(Object.entries(selected.stats) as [keyof typeof selected.stats, number][])
                  .filter(([, v]) => v > 0)
                  .map(([k, v]) => (
                    <div key={k} className="text-center p-2 bg-cyber-surface rounded-xl">
                      <p className="text-cyber-dim text-xs capitalize">{k}</p>
                      <p className="text-cyber-cyan font-mono font-bold">+{v}</p>
                    </div>
                  ))}
              </div>
              <p className="text-cyber-dim text-xs text-center mb-4">Total power: {totalStats} pts</p>

              {owned && invItem ? (
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleEquip(invItem, selected)}
                    disabled={invItem.isEquipped}
                  >
                    {invItem.isEquipped ? "Equipped ✓" : "Equip"}
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={handlePurchase}
                  loading={purchasing}
                  disabled={!canAfford}
                >
                  {canAfford
                    ? `Purchase — ${selected.basePrice} pts`
                    : `Need ${selected.basePrice - (appUser?.pointsBalance ?? 0)} more pts`}
                </Button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
