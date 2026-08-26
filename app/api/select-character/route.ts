import { NextResponse } from "next/server";
import { requireServiceSupabase, requireUser } from "@/lib/db/server";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { characterId } = await request.json();
    if (typeof characterId !== "string") {
      return NextResponse.json({ error: "A character is required" }, { status: 400 });
    }

    const db = requireServiceSupabase();
    const { data: character } = await db
      .from("characters")
      .select("id, is_default")
      .eq("id", characterId)
      .single();
    if (!character) return NextResponse.json({ error: "Character unavailable" }, { status: 404 });

    if (!character.is_default) {
      const { data: owned } = await db
        .from("user_characters")
        .select("character_id")
        .eq("user_id", user.id)
        .eq("character_id", characterId)
        .maybeSingle();
      if (!owned) return NextResponse.json({ error: "Unlock this character first" }, { status: 403 });
    }

    const { error } = await db
      .from("profiles")
      .update({ selected_character_id: characterId })
      .eq("id", user.id);
    if (error) throw error;

    return NextResponse.json({ ok: true, characterId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to select character";
    return NextResponse.json({ error: message }, { status: message === "Authentication required" ? 401 : 500 });
  }
}
