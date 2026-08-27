import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getActivePackage } from "@/lib/db/queries";
import { requireUser } from "@/lib/db/auth";
import { getDodoApiBaseUrl, getDodoProductId } from "@/lib/payments/dodo";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const returnUrl = process.env.DODO_PAYMENTS_RETURN_URL;
    if (!apiKey || !returnUrl) {
      return NextResponse.json(
        {
          error:
            "Dodo Payments is not configured. Set DODO_PAYMENTS_API_KEY and DODO_PAYMENTS_RETURN_URL.",
        },
        { status: 503 },
      );
    }

    const user = await requireUser();
    if (!user.email) {
      return NextResponse.json(
        { error: "Your account needs a verified email before checkout." },
        { status: 400 },
      );
    }

    const { packageId } = await request.json();
    if (typeof packageId !== "string") {
      return NextResponse.json(
        { error: "A package is required" },
        { status: 400 },
      );
    }

    const pkg = await getActivePackage(db, packageId);
    if (!pkg) {
      return NextResponse.json(
        { error: "Package unavailable" },
        { status: 404 },
      );
    }

    const productId = getDodoProductId(pkg.id);

    const response = await fetch(`${getDodoApiBaseUrl()}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { email: user.email },
        metadata: { userId: user.id, packageId: pkg.id },
        return_url: returnUrl,
      }),
    });
    if (!response.ok) {
      const details = await response.text();
      console.error("Dodo checkout failed", response.status, details);
      return NextResponse.json(
        {
          error:
            "Unable to start checkout. Check the Dodo product configuration.",
        },
        { status: 502 },
      );
    }
    const checkout = (await response.json()) as { checkout_url?: string };
    if (!checkout.checkout_url)
      return NextResponse.json(
        { error: "Checkout URL missing" },
        { status: 502 },
      );
    return NextResponse.json({ url: checkout.checkout_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json(
      { error: message },
      { status: message === "Authentication required" ? 401 : 500 },
    );
  }
}
