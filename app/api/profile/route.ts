import { NextResponse } from "next/server";
import { createRequestSupabase } from "@/lib/db/server";

export async function GET() {
  const supabase = await createRequestSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, pink_coin_balance, selected_character_id")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Unable to load profile" },
      { status: 500 },
    );
  }

  return NextResponse.json(profile);
}
