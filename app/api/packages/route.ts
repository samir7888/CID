import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listActivePackages } from "@/lib/db/queries";

export async function GET() {
  try {
    const packages = await listActivePackages(db);
    return NextResponse.json(packages);
  } catch {
    return NextResponse.json(
      { error: "Unable to load packages" },
      { status: 500 },
    );
  }
}
