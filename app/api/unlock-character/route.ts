import { NextResponse } from "next/server";
import { requireServiceSupabase, requireUser } from "@/lib/db/server";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { characterId } = await request.json();
    if (typeof characterId !== "string")
      return NextResponse.json(
        { error: "A character is required" },
        { status: 400 },
      );
    const db = requireServiceSupabase();
    const { data: result, error } = await db.rpc("unlock_character", {
      p_user_id: user.id,
      p_character_id: characterId,
    });
    if (error) throw error;
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
