import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./index";
import { ensureProfile } from "./queries";

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Authentication required");
  await ensureProfile(db, userId);
  const user = await currentUser();
  return {
    id: userId,
    email: user?.primaryEmailAddress?.emailAddress,
  };
}
