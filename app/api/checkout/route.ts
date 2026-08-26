import { NextResponse } from "next/server";
import { requireServiceSupabase, requireUser } from "@/lib/db/server";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { packageId } = await request.json();
    if (typeof packageId !== "string") {
      return NextResponse.json({ error: "A package is required" }, { status: 400 });
    }

    const db = requireServiceSupabase();
    const { data: pkg, error } = await db.from("pink_coin_packages")
      .select("id, dodo_product_id, pink_coins, price_minor, currency")
      .eq("id", packageId).eq("active", true).single();
    if (error || !pkg) return NextResponse.json({ error: "Package unavailable" }, { status: 404 });

    const response = await fetch("https://api.dodopayments.com/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [{ product_id: pkg.dodo_product_id, quantity: 1 }],
        customer: { email: user.email },
        metadata: { userId: user.id, packageId: pkg.id },
        return_url: process.env.DODO_PAYMENTS_RETURN_URL,
      }),
    });
    if (!response.ok) return NextResponse.json({ error: "Unable to start checkout" }, { status: 502 });
    const checkout = await response.json() as { checkout_url?: string };
    if (!checkout.checkout_url) return NextResponse.json({ error: "Checkout URL missing" }, { status: 502 });
    return NextResponse.json({ url: checkout.checkout_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: message === "Authentication required" ? 401 : 500 });
  }
}