import {
  boolean,
  check,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const profiles = pgTable(
  "profiles",
  {
    id: text("id").primaryKey(),
    pinkCoinBalance: integer("pink_coin_balance").notNull().default(0),
    selectedCharacterId: text("selected_character_id").notNull().default("agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("profiles_pink_coin_balance_non_negative", sql`${table.pinkCoinBalance} >= 0`),
  ],
);

export const characters = pgTable(
  "characters",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    cost: integer("cost").notNull().default(0),
    thumbnailUrl: text("thumbnail_url"),
    modelUrl: text("model_url"),
    isDefault: boolean("is_default").notNull().default(false),
  },
  (table) => [check("characters_cost_non_negative", sql`${table.cost} >= 0`)],
);

export const userCharacters = pgTable(
  "user_characters",
  {
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    characterId: text("character_id")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.characterId] })],
);

export const pinkCoinPackages = pgTable(
  "pink_coin_packages",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    pinkCoins: integer("pink_coins").notNull(),
    priceMinor: integer("price_minor").notNull(),
    currency: text("currency").notNull().default("USD"),
    dodoProductId: text("dodo_product_id").notNull().unique(),
    active: boolean("active").notNull().default(true),
  },
  (table) => [
    check("packages_pink_coins_positive", sql`${table.pinkCoins} > 0`),
    check("packages_price_minor_positive", sql`${table.priceMinor} > 0`),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    packageId: text("package_id")
      .notNull()
      .references(() => pinkCoinPackages.id),
    dodoPaymentId: text("dodo_payment_id").unique(),
    pinkCoins: integer("pink_coins").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [check("orders_pink_coins_positive", sql`${table.pinkCoins} > 0`)],
);

export type Profile = typeof profiles.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type UserCharacter = typeof userCharacters.$inferSelect;
export type PinkCoinPackage = typeof pinkCoinPackages.$inferSelect;
export type Order = typeof orders.$inferSelect;
