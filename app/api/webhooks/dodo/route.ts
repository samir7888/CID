import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { db } from "@/lib/db";
import { completeCoinOrder } from "@/lib/db/queries";

export async function POST(request: Request) {
  const body = await request.text();
  try {
    const webhook = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_SECRET!);
    webhook.verify(body, Object.fromEntries(request.headers));
    const event = JSON.parse(body) as {
      type?: string;
      data?: {
        payment_id?: string;
        metadata?: { userId?: string; packageId?: string };
      };
    };
    if (event.type !== "payment.completed" || !event.data?.payment_id)
      return NextResponse.json({ received: true });
    const metadata = event.data.metadata;
    if (!metadata?.userId || !metadata.packageId)
      return NextResponse.json(
        { error: "Invalid payment metadata" },
        { status: 400 },
      );
    const result = await completeCoinOrder(
      db,
      metadata.userId,
      metadata.packageId,
      event.data.payment_id,
    );
    if (result === "unavailable")
      return NextResponse.json(
        { error: "Package unavailable" },
        { status: 400 },
      );
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
