import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlockCharacter } from "@/lib/db/queries";
import { requireUser } from "@/lib/db/auth";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { characterId } = await request.json();
    if (typeof characterId !== "string")
      return NextResponse.json(
        { error: "A character is required" },
        { status: 400 },
      );

    const result = await unlockCharacter(db, user.id, characterId);
    if (result === "unavailable")
      return NextResponse.json(
        { error: "Character unavailable" },
        { status: 404 },
      );
    if (result === "owned")
      return NextResponse.json(
        { error: "Character already unlocked" },
        { status: 409 },
      );
    if (result === "insufficient")
      return NextResponse.json(
        { error: "Not enough Pink Coins" },
        { status: 402 },
      );
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unlock failed";
    return NextResponse.json(
      { error: message },
      { status: message === "Authentication required" ? 401 : 500 },
    );
  }
}
