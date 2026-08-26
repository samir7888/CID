import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ensureProfile } from "@/lib/db/queries";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request);
    if (event.type === "user.created" && event.data.id) {
      await ensureProfile(db, event.data.id);
    }
    if (event.type === "user.deleted" && event.data.id) {
      await db.delete(profiles).where(eq(profiles.id, event.data.id));
    }
    return new Response("ok", { status: 200 });
  } catch {
    return new Response("Invalid webhook", { status: 400 });
  }
}
