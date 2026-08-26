import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/db/queries";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const profile = await getProfile(db, userId);
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(
      { error: "Unable to load profile" },
      { status: 500 },
    );
  }
}
