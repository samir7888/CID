import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? "postgresql://neondb_owner:npg_nAgirzpSZ9B4@ep-green-darkness-azfbawql-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"; 
  if (!url) throw new Error("DATABASE_URL is not configured");
  return url;
}

const globalForDb = globalThis as unknown as {
  postgres?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.postgres ??
  postgres(getDatabaseUrl(), {
    max: 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgres = client;
}

export const db = drizzle(client, { schema });
export type Database = typeof db;
