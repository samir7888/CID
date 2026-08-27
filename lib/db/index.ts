import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  postgres?: ReturnType<typeof postgres>;
};

let database: Database | undefined;

function getDatabase(): Database {
  if (database) return database;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");

  const client =
    globalForDb.postgres ??
    postgres(url, {
      max: 10,
      prepare: false,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.postgres = client;
  }

  database = drizzle(client, { schema });
  return database;
}

// Connects on first use so builds and tooling do not require DATABASE_URL.
export const db = new Proxy({} as Database, {
  get(_target, property) {
    const instance = getDatabase();
    const value = Reflect.get(instance, property);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
