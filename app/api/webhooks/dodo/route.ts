import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { db } from "@/lib/db";
import { completeCoinOrder } from "@/lib/db/queries";

export async function POST(request: Request) {
  const body = await request.text();
  try {
    const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
    if (!secret) {
      console.error("Dodo webhook secret is not configured");
      return NextResponse.json(
        { error: "Webhook is not configured" },
        { status: 503 },
      );
    }

    const webhook = new Webhook(secret);
    webhook.verify(body, Object.fromEntries(request.headers));
    const event = JSON.parse(body) as {
      type?: string;
      data?: {
        payment_id?: string;
        metadata?: { userId?: string; packageId?: string };
      };
    };

    console.log("Dodo webhook received", event.type);
    if (
      event.type !== "payment.succeeded" &&
      event.type !== "payment.completed"
    ) {
      return NextResponse.json({ received: true });
    }

    if (!event.data?.payment_id) {
      console.error("Dodo payment webhook is missing payment_id");
      return NextResponse.json(
        { error: "Invalid payment webhook" },
        { status: 400 },
      );
    }

    const metadata = event.data.metadata;

    if (!metadata?.userId || !metadata.packageId) {
      console.error("Dodo payment webhook is missing metadata", {
        paymentId: event.data.payment_id,
        metadata,
      });
      return NextResponse.json(
        { error: "Invalid payment metadata" },
        { status: 400 },
      );
    }

    const result = await completeCoinOrder(
      db,
      metadata.userId,
      metadata.packageId,
      event.data.payment_id,
    );
    console.log("Dodo payment order processed", {
      paymentId: event.data.payment_id,
      packageId: metadata.packageId,
      result,
    });
    if (result === "unavailable")
      return NextResponse.json(
        { error: "Package unavailable" },
        { status: 400 },
      );
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Dodo webhook failed", error);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
