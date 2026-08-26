import { and, eq, sql } from "drizzle-orm";
import {
  characters,
  orders,
  pinkCoinPackages,
  profiles,
  userCharacters,
  type PinkCoinPackage,
} from "./schema";

export type AppDatabase = any;

export async function ensureProfile(db: AppDatabase, userId: string) {
  await db
    .insert(profiles)
    .values({ id: userId })
    .onConflictDoNothing({ target: profiles.id });
}

export async function getProfile(db: AppDatabase, userId: string) {
  await ensureProfile(db, userId);
  const [profile] = await db
    .select({
      id: profiles.id,
      pinkCoinBalance: profiles.pinkCoinBalance,
      selectedCharacterId: profiles.selectedCharacterId,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  const owned = await db
    .select({ characterId: userCharacters.characterId })
    .from(userCharacters)
    .where(eq(userCharacters.userId, userId));

  let selectedCharacter: { id: string; modelUrl: string | null } | null = null;
  if (profile?.selectedCharacterId) {
    const [character] = await db
      .select({
        id: characters.id,
        modelUrl: characters.modelUrl,
      })
      .from(characters)
      .where(eq(characters.id, profile.selectedCharacterId))
      .limit(1);
    selectedCharacter = character ?? null;
  }

  return {
    id: profile!.id,
    pink_coin_balance: profile!.pinkCoinBalance,
    selected_character_id: profile!.selectedCharacterId,
    owned_character_ids: owned.map((row: { characterId: string }) => row.characterId),
    selected_character: selectedCharacter
      ? { id: selectedCharacter.id, model_url: selectedCharacter.modelUrl }
      : null,
  };
}

export async function listActivePackages(db: AppDatabase) {
  const rows = (await db
    .select()
    .from(pinkCoinPackages)
    .where(eq(pinkCoinPackages.active, true))) as PinkCoinPackage[];
  return rows
    .slice()
    .sort((a: PinkCoinPackage, b: PinkCoinPackage) => a.priceMinor - b.priceMinor)
    .map((pkg: PinkCoinPackage) => ({
      id: pkg.id,
      name: pkg.name,
      pink_coins: pkg.pinkCoins,
      price_minor: pkg.priceMinor,
      currency: pkg.currency,
      dodo_product_id: pkg.dodoProductId,
      active: pkg.active,
    }));
}

export async function getActivePackage(db: AppDatabase, packageId: string) {
  const [pkg] = await db
    .select()
    .from(pinkCoinPackages)
    .where(
      and(eq(pinkCoinPackages.id, packageId), eq(pinkCoinPackages.active, true)),
    )
    .limit(1);
  return pkg ?? null;
}

export type UnlockResult = "unlocked" | "unavailable" | "owned" | "insufficient";

export async function unlockCharacter(
  db: AppDatabase,
  userId: string,
  characterId: string,
): Promise<UnlockResult> {
  return db.transaction(async (tx: AppDatabase) => {
    await ensureProfile(tx, userId);
    const [character] = await tx
      .select()
      .from(characters)
      .where(eq(characters.id, characterId))
      .limit(1);
    if (!character) return "unavailable";

    const [owned] = await tx
      .select({ characterId: userCharacters.characterId })
      .from(userCharacters)
      .where(
        and(
          eq(userCharacters.userId, userId),
          eq(userCharacters.characterId, characterId),
        ),
      )
      .limit(1);
    if (owned) return "owned";

    if (character.cost === 0) {
      await tx
        .insert(userCharacters)
        .values({ userId, characterId })
        .onConflictDoNothing();
      return "unlocked";
    }

    const spent = await tx
      .update(profiles)
      .set({
        pinkCoinBalance: sql`${profiles.pinkCoinBalance} - ${character.cost}`,
      })
      .where(
        and(
          eq(profiles.id, userId),
          sql`${profiles.pinkCoinBalance} >= ${character.cost}`,
        ),
      )
      .returning({ id: profiles.id });
    if (spent.length === 0) return "insufficient";

    await tx.insert(userCharacters).values({ userId, characterId });
    return "unlocked";
  });
}

export async function selectCharacter(
  db: AppDatabase,
  userId: string,
  characterId: string,
) {
  await ensureProfile(db, userId);
  const [character] = await db
    .select({
      id: characters.id,
      isDefault: characters.isDefault,
    })
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1);
  if (!character) return { ok: false as const, error: "unavailable" as const };

  if (!character.isDefault) {
    const [owned] = await db
      .select({ characterId: userCharacters.characterId })
      .from(userCharacters)
      .where(
        and(
          eq(userCharacters.userId, userId),
          eq(userCharacters.characterId, characterId),
        ),
      )
      .limit(1);
    if (!owned) return { ok: false as const, error: "locked" as const };
  }

  await db
    .update(profiles)
    .set({ selectedCharacterId: characterId })
    .where(eq(profiles.id, userId));
  return { ok: true as const, characterId };
}

export type CompleteOrderResult = "credited" | "unavailable" | "duplicate";

export async function completeCoinOrder(
  db: AppDatabase,
  userId: string,
  packageId: string,
  paymentId: string,
): Promise<CompleteOrderResult> {
  return db.transaction(async (tx: AppDatabase) => {
    await ensureProfile(tx, userId);
    const [pkg] = await tx
      .select()
      .from(pinkCoinPackages)
      .where(
        and(eq(pinkCoinPackages.id, packageId), eq(pinkCoinPackages.active, true)),
      )
      .limit(1);
    if (!pkg) return "unavailable";

    const [existing] = await tx
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.dodoPaymentId, paymentId))
      .limit(1);
    if (existing) return "duplicate";

    try {
      await tx.insert(orders).values({
        userId,
        packageId,
        dodoPaymentId: paymentId,
        pinkCoins: pkg.pinkCoins,
        status: "completed",
      });
    } catch (error) {
      if (isUniqueViolation(error)) return "duplicate";
      throw error;
    }

    const credited = await tx
      .update(profiles)
      .set({
        pinkCoinBalance: sql`${profiles.pinkCoinBalance} + ${pkg.pinkCoins}`,
      })
      .where(eq(profiles.id, userId))
      .returning({ id: profiles.id });
    if (credited.length === 0) {
      throw new Error("Profile unavailable");
    }
    return "credited";
  });
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  );
}
