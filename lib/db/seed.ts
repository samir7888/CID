import { characters, pinkCoinPackages } from "./schema";
import type { AppDatabase } from "./queries";
import { eq } from "drizzle-orm";

export const CHARACTER_SEED = [
  {
    id: "agent",
    name: "THE AGENT",
    description: "The original escape specialist.",
    cost: 0,
    thumbnailUrl: null as string | null,
    modelUrl: null as string | null,
    isDefault: true,
  },
  {
    id: "girl",
    name: "THE RUNNER",
    description:
      "A new recruit with a fearless stride and a clean getaway record.",
    cost: 50,
    thumbnailUrl: null,
    modelUrl: "/models/girl.glb",
    isDefault: false,
  },
  {
    id: "modi",
    name: "MODI",
    description: "A determined operative with one more mission to outrun.",
    cost: 100,
    thumbnailUrl: null,
    modelUrl: "/models/modi.glb",
    isDefault: false,
  },
];



export const PINK_COIN_PACKAGE_SEED = [
  {
    id: "pink-coins-100",
    name: "100 PINK COINS",
    pinkCoins: 100,
    priceMinor: 399,
    currency: "USD",
    dodoProductId: "REPLACE_WITH_DODO_100_PRODUCT_ID",
    active: true,
  },
  {
    id: "pink-coins-1000",
    name: "1,000 PINK COINS",
    pinkCoins: 1000,
    priceMinor: 699,
    currency: "USD",
    dodoProductId: "REPLACE_WITH_DODO_1000_PRODUCT_ID",
    active: true,
  },
];

export async function seedPackages(db: AppDatabase) {
  for (const pkg of PINK_COIN_PACKAGE_SEED) {
    await db
      .insert(pinkCoinPackages)
      .values(pkg)
      .onConflictDoUpdate({
        target: pinkCoinPackages.id,
        set: {
          name: pkg.name,
          pinkCoins: pkg.pinkCoins,
          priceMinor: pkg.priceMinor,
          currency: pkg.currency,
          dodoProductId: pkg.dodoProductId,
          active: pkg.active,
        },
      });
  }
}

export async function seedCharacters(db: AppDatabase) {
  for (const character of CHARACTER_SEED) {
    await db
      .insert(characters)
      .values(character)
      .onConflictDoUpdate({
        target: characters.id,
        set: {
          name: character.name,
          description: character.description,
          cost: character.cost,
          modelUrl: character.modelUrl,
          isDefault: character.isDefault,
        },
      });
  }

  await db
    .update(characters)
    .set({ isDefault: true, cost: 0 })
    .where(eq(characters.id, "agent"));
}
