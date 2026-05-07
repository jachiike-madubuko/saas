/**
 * Seed the gearCatalog collection using Firebase Admin SDK (bypasses security rules).
 * Run with: npx tsx scripts/seed-gear.ts
 * Requires: ../../service-account.json  (gitignored)
 */

import * as admin from "firebase-admin";
import { readFileSync } from "fs";
import { join } from "path";
import type { GearItem } from "../src/lib/types";

const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, "../../service-account.json"), "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const GEAR_CATALOG: Omit<GearItem, "id">[] = [
  // ── Common ──────────────────────────────────────────────────────────────────
  {
    name: "Street Visor",
    category: "Headgear",
    rarity: "Common",
    basePrice: 120,
    loreText: "Standard issue for runners who don't want to be seen. Wren approves.",
    emoji: "🥽",
    stats: { attack: 0, defense: 4, speed: 2, focus: 3, discipline: 0, resilience: 0, charisma: 0, energy: 0, luck: 1 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },
  {
    name: "Worn Corp Jacket",
    category: "Armor",
    rarity: "Common",
    basePrice: 150,
    loreText: "Ex-corporate issue, now street-modified. Gets the job done.",
    emoji: "🧥",
    stats: { attack: 0, defense: 6, speed: 0, focus: 0, discipline: 2, resilience: 3, charisma: 0, energy: 0, luck: 0 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },
  {
    name: "Grip Boots",
    category: "Boots",
    rarity: "Common",
    basePrice: 100,
    loreText: "Magnetic soles for when the city tries to shake you off.",
    emoji: "👟",
    stats: { attack: 0, defense: 1, speed: 5, focus: 0, discipline: 1, resilience: 0, charisma: 0, energy: 3, luck: 0 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },
  {
    name: "Data Spike",
    category: "Weapon",
    rarity: "Common",
    basePrice: 130,
    loreText: "Entry-level offensive tool. Enough to leave a mark.",
    emoji: "🔱",
    stats: { attack: 6, defense: 0, speed: 1, focus: 2, discipline: 0, resilience: 0, charisma: 0, energy: 0, luck: 1 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },
  {
    name: "Signal Jammer",
    category: "Gadget",
    rarity: "Common",
    basePrice: 110,
    loreText: "Cuts through the noise. Clears your head and the frequencies.",
    emoji: "📡",
    stats: { attack: 0, defense: 2, speed: 0, focus: 5, discipline: 3, resilience: 0, charisma: 0, energy: 0, luck: 0 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },
  {
    name: "Chrome Shades",
    category: "Accessory",
    rarity: "Common",
    basePrice: 90,
    loreText: "Don't need to see to look cool. Charisma standard.",
    emoji: "🕶️",
    stats: { attack: 0, defense: 0, speed: 0, focus: 0, discipline: 0, resilience: 0, charisma: 5, energy: 0, luck: 3 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },

  // ── Uncommon ─────────────────────────────────────────────────────────────────
  {
    name: "Neural Visor",
    category: "Headgear",
    rarity: "Uncommon",
    basePrice: 450,
    loreText: "AR overlay with threat analysis. Makes habits feel like missions.",
    emoji: "🥽",
    stats: { attack: 0, defense: 5, speed: 3, focus: 10, discipline: 5, resilience: 0, charisma: 0, energy: 2, luck: 0 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },
  {
    name: "Shock Baton",
    category: "Weapon",
    rarity: "Uncommon",
    basePrice: 500,
    loreText: "Non-lethal. For runners who prefer options.",
    emoji: "⚡",
    stats: { attack: 12, defense: 2, speed: 3, focus: 0, discipline: 0, resilience: 0, charisma: 0, energy: 5, luck: 0 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },
  {
    name: "Sprint Implant",
    category: "Implant",
    rarity: "Uncommon",
    basePrice: 600,
    loreText: "Leg enhancement. First step is always faster now.",
    emoji: "⚙️",
    stats: { attack: 0, defense: 0, speed: 12, focus: 0, discipline: 0, resilience: 3, charisma: 0, energy: 8, luck: 0 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },
  {
    name: "Neon Trench",
    category: "Armor",
    rarity: "Uncommon",
    basePrice: 550,
    loreText: "Reactive fabric changes color with your mood. Or your cover story.",
    emoji: "🧥",
    stats: { attack: 0, defense: 10, speed: 2, focus: 0, discipline: 3, resilience: 5, charisma: 5, energy: 0, luck: 0 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },

  // ── Rare ────────────────────────────────────────────────────────────────────
  {
    name: "Reflex Chip",
    category: "Implant",
    rarity: "Rare",
    basePrice: 1200,
    loreText: "Military-grade neural mod. Makes everything feel slower. In a good way.",
    emoji: "💠",
    stats: { attack: 5, defense: 5, speed: 20, focus: 10, discipline: 0, resilience: 0, charisma: 0, energy: 5, luck: 5 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },
  {
    name: "Plasma Blade",
    category: "Weapon",
    rarity: "Rare",
    basePrice: 1500,
    loreText: "Cuts through excuses. And most materials.",
    emoji: "🗡️",
    stats: { attack: 25, defense: 3, speed: 5, focus: 5, discipline: 0, resilience: 0, charisma: 0, energy: 0, luck: 2 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },
  {
    name: "Hacker Hood",
    category: "Headgear",
    rarity: "Rare",
    basePrice: 1300,
    loreText: "Full sensory isolation. Find your signal in the static.",
    emoji: "🪖",
    stats: { attack: 0, defense: 8, speed: 0, focus: 20, discipline: 10, resilience: 5, charisma: 0, energy: 0, luck: 0 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },

  // ── Epic ────────────────────────────────────────────────────────────────────
  {
    name: "Adrenaline Shunt",
    category: "Implant",
    rarity: "Epic",
    basePrice: 4000,
    loreText: "Controlled chemical push. For when good habits aren't enough. They always are, but still.",
    emoji: "💉",
    stats: { attack: 10, defense: 10, speed: 15, focus: 10, discipline: 10, resilience: 10, charisma: 5, energy: 20, luck: 5 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },
  {
    name: "Graphene Vest",
    category: "Armor",
    rarity: "Epic",
    basePrice: 3500,
    loreText: "Stops bullets. More importantly, stops the excuses.",
    emoji: "🦺",
    stats: { attack: 5, defense: 35, speed: 0, focus: 5, discipline: 15, resilience: 20, charisma: 0, energy: 0, luck: 5 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },

  // ── Legendary ────────────────────────────────────────────────────────────────
  {
    name: "Memory Core",
    category: "Implant",
    rarity: "Legendary",
    basePrice: 9000,
    loreText: "Total recall. You remember every rep, every session, every step. The city can't take that from you.",
    emoji: "🧠",
    stats: { attack: 10, defense: 10, speed: 10, focus: 30, discipline: 30, resilience: 20, charisma: 15, energy: 10, luck: 10 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },
  {
    name: "Chrome Legend Jacket",
    category: "Armor",
    rarity: "Legendary",
    basePrice: 11000,
    loreText: "You earn this. 100 days in, the city knows your name.",
    emoji: "🥼",
    stats: { attack: 15, defense: 40, speed: 10, focus: 15, discipline: 20, resilience: 25, charisma: 20, energy: 10, luck: 15 },
    maxUpgradeLevel: 3,
    isActive: true,
    availableFrom: null,
    availableUntil: null,
  },
];

async function seed() {
  console.log(`Seeding ${GEAR_CATALOG.length} gear items to habbyquacks/gearCatalog…`);
  const batch = db.batch();
  for (const item of GEAR_CATALOG) {
    const ref = db.collection("gearCatalog").doc();
    batch.set(ref, { ...item, id: ref.id });
    console.log(`  queued: ${item.name} (${item.rarity})`);
  }
  await batch.commit();
  console.log(`\n✓ All ${GEAR_CATALOG.length} items written successfully.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
