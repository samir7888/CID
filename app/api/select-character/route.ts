import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { selectCharacter } from "@/lib/db/queries";
import { requireUser } from "@/lib/db/auth";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { characterId } = await request.json();
    if (typeof characterId !== "string") {
      return NextResponse.json({ error: "A character is required" }, { status: 400 });
    }

    const result = await selectCharacter(db, user.id, characterId);
    if (!result.ok) {
      if (result.error === "unavailable") {
        return NextResponse.json({ error: "Character unavailable" }, { status: 404 });
      }
      return NextResponse.json({ error: "Unlock this character first" }, { status: 403 });
    }

    return NextResponse.json({ ok: true, characterId: result.characterId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to select character";
    return NextResponse.json({ error: message }, { status: message === "Authentication required" ? 401 : 500 });
  }
}
