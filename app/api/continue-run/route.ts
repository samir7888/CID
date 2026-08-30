import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deductPinkCoins } from "@/lib/db/queries";
import { requireUser } from "@/lib/db/auth";

const REVIVE_COST = 2;

export async function POST() {
  try {
    const user = await requireUser();
    const result = await deductPinkCoins(db, user.id, REVIVE_COST);
    if (result.result === "insufficient") {
      return NextResponse.json(
        { error: "Insufficient Pink Coins", cost: REVIVE_COST },
        { status: 402 },
      );
    }
    return NextResponse.json({
      ok: true,
      newBalance: result.newBalance,
      cost: REVIVE_COST,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to continue run";
    return NextResponse.json(
      { error: message },
      { status: message === "Authentication required" ? 401 : 500 },
    );
  }
}
