import { describe, expect, it, beforeEach } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import { pinkCoinPackages, profiles } from "./schema";
import {
  completeCoinOrder,
  deductPinkCoins,
  ensureProfile,
  getProfile,
  selectCharacter,
  unlockCharacter,
} from "./queries";
import { seedCharacters } from "./seed";

const DDL = `
CREATE TABLE IF NOT EXISTS profiles (
  id text PRIMARY KEY,
  pink_coin_balance integer NOT NULL DEFAULT 0,
  selected_character_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pink_coin_balance_non_negative CHECK (pink_coin_balance >= 0)
);
CREATE TABLE IF NOT EXISTS characters (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  cost integer NOT NULL DEFAULT 0,
  thumbnail_url text,
  model_url text,
  is_default boolean NOT NULL DEFAULT false,
  CONSTRAINT characters_cost_non_negative CHECK (cost >= 0)
);
CREATE TABLE IF NOT EXISTS user_characters (
  user_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  character_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, character_id)
);
CREATE TABLE IF NOT EXISTS pink_coin_packages (
  id text PRIMARY KEY,
  name text NOT NULL,
  pink_coins integer NOT NULL,
  price_minor integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  dodo_product_id text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  CONSTRAINT packages_pink_coins_positive CHECK (pink_coins > 0),
  CONSTRAINT packages_price_minor_positive CHECK (price_minor > 0)
);
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id text NOT NULL REFERENCES pink_coin_packages(id),
  dodo_payment_id text UNIQUE,
  pink_coins integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_pink_coins_positive CHECK (pink_coins > 0)
);
`;

async function createTestDb() {
  const client = new PGlite();
  await client.exec(DDL);
  const db = drizzle(client, { schema });
  await seedCharacters(db);
  await db.insert(pinkCoinPackages).values({
    id: "starter",
    name: "Starter Pack",
    pinkCoins: 100,
    priceMinor: 199,
    currency: "USD",
    dodoProductId: "prod_test_starter",
    active: true,
  });
  return db;
}

describe("drizzle game queries", () => {
  let db: Awaited<ReturnType<typeof createTestDb>>;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it("creates a profile for a Clerk user id", async () => {
    await ensureProfile(db, "user_clerk_1");
    const profile = await getProfile(db, "user_clerk_1");
    expect(profile.id).toBe("user_clerk_1");
    expect(profile.pink_coin_balance).toBe(0);
    expect(profile.owned_character_ids).toEqual([]);
  });

  it("unlocks a paid character when the balance is high enough", async () => {
    await ensureProfile(db, "user_clerk_2");
    await db
      .update(profiles)
      .set({ pinkCoinBalance: 80 })
      .where(eq(profiles.id, "user_clerk_2"));

    expect(await unlockCharacter(db, "user_clerk_2", "girl")).toBe("unlocked");
    const profile = await getProfile(db, "user_clerk_2");
    expect(profile.pink_coin_balance).toBe(30);
    expect(profile.owned_character_ids).toContain("girl");
  });

  it("refuses to unlock when coins are insufficient", async () => {
    await ensureProfile(db, "user_clerk_3");
    expect(await unlockCharacter(db, "user_clerk_3", "modi")).toBe("insufficient");
  });

  it("does not double-unlock the same character", async () => {
    await ensureProfile(db, "user_clerk_4");
    await db
      .update(profiles)
      .set({ pinkCoinBalance: 200 })
      .where(eq(profiles.id, "user_clerk_4"));
    expect(await unlockCharacter(db, "user_clerk_4", "girl")).toBe("unlocked");
    expect(await unlockCharacter(db, "user_clerk_4", "girl")).toBe("owned");
  });

  it("selects only unlocked or default characters", async () => {
    await ensureProfile(db, "user_clerk_5");
    const locked = await selectCharacter(db, "user_clerk_5", "girl");
    expect(locked).toEqual({ ok: false, error: "locked" });

    const agent = await selectCharacter(db, "user_clerk_5", "agent");
    expect(agent).toEqual({ ok: true, characterId: "agent" });
  });

  it("credits coins from a payment exactly once", async () => {
    await ensureProfile(db, "user_clerk_6");
    expect(
      await completeCoinOrder(db, "user_clerk_6", "starter", "pay_1"),
    ).toBe("credited");
    expect(
      await completeCoinOrder(db, "user_clerk_6", "starter", "pay_1"),
    ).toBe("duplicate");

    const profile = await getProfile(db, "user_clerk_6");
    expect(profile.pink_coin_balance).toBe(100);
  });

  it("deducts pink coins successfully when balance is sufficient", async () => {
    await ensureProfile(db, "user_clerk_7");
    await db
      .update(profiles)
      .set({ pinkCoinBalance: 5 })
      .where(eq(profiles.id, "user_clerk_7"));

    const result = await deductPinkCoins(db, "user_clerk_7", 2);
    expect(result).toEqual({ result: "success", newBalance: 3 });

    const profile = await getProfile(db, "user_clerk_7");
    expect(profile.pink_coin_balance).toBe(3);
  });

  it("fails to deduct pink coins when balance is insufficient", async () => {
    await ensureProfile(db, "user_clerk_8");
    await db
      .update(profiles)
      .set({ pinkCoinBalance: 1 })
      .where(eq(profiles.id, "user_clerk_8"));

    const result = await deductPinkCoins(db, "user_clerk_8", 2);
    expect(result).toEqual({ result: "insufficient" });

    const profile = await getProfile(db, "user_clerk_8");
    expect(profile.pink_coin_balance).toBe(1);
  });
});
