import {
  collection, getDocs, doc, getDoc, addDoc, query, where, updateDoc, orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { GearItem, InventoryItem, Duck } from "../types";
import { addPoints } from "./users";
import { updateDuck } from "./users";

// ─── Gear Catalog ─────────────────────────────────────────────────────────────

export async function getShopItems(): Promise<GearItem[]> {
  const q = query(
    collection(db, "gearCatalog"),
    where("isActive", "==", true),
    orderBy("basePrice", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as GearItem));
}

export async function getGearItem(itemId: string): Promise<GearItem | null> {
  const snap = await getDoc(doc(db, "gearCatalog", itemId));
  return snap.exists() ? ({ ...snap.data(), id: snap.id } as GearItem) : null;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export async function getInventory(uid: string): Promise<InventoryItem[]> {
  const q = query(
    collection(db, "users", uid, "inventory"),
    orderBy("acquiredAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as InventoryItem);
}

export async function purchaseItem(uid: string, gearItem: GearItem, currentBalance: number): Promise<InventoryItem> {
  if (currentBalance < gearItem.basePrice) {
    throw new Error("Insufficient points");
  }

  const inventoryItem: Omit<InventoryItem, "id"> = {
    userId: uid,
    gearItemId: gearItem.id,
    upgradeLevel: 0,
    acquiredAt: Date.now(),
    isEquipped: false,
    equippedSlot: null,
  };

  const ref = await addDoc(collection(db, "users", uid, "inventory"), inventoryItem);
  await updateDoc(ref, { id: ref.id });

  await addPoints(uid, -gearItem.basePrice, "Purchase", `Purchased: ${gearItem.name}`, ref.id);

  return { ...inventoryItem, id: ref.id };
}

export async function equipItem(uid: string, inventoryItem: InventoryItem, gearItem: GearItem): Promise<void> {
  const slot = gearItem.category;
  const slotKey = `equipped${slot}Id` as keyof Duck;

  const allInventory = await getInventory(uid);
  const previouslyEquipped = allInventory.find(
    (i) => i.equippedSlot === slot && i.id !== inventoryItem.id
  );

  if (previouslyEquipped) {
    await updateDoc(doc(db, "users", uid, "inventory", previouslyEquipped.id), {
      isEquipped: false,
      equippedSlot: null,
    });
  }

  await updateDoc(doc(db, "users", uid, "inventory", inventoryItem.id), {
    isEquipped: true,
    equippedSlot: slot,
  });

  await updateDuck(uid, { [slotKey]: inventoryItem.id });
}

export async function unequipItem(uid: string, inventoryItem: InventoryItem, gearItem: GearItem): Promise<void> {
  const slotKey = `equipped${gearItem.category}Id` as keyof Duck;

  await updateDoc(doc(db, "users", uid, "inventory", inventoryItem.id), {
    isEquipped: false,
    equippedSlot: null,
  });

  await updateDuck(uid, { [slotKey]: null });
}
