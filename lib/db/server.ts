import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceSupabase } from "./supabase";

export async function createRequestSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // API routes only need to read the existing auth session.
        },
      },
    },
  );
}

export async function requireUser() {
  const supabase = await createRequestSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Authentication required");
  return user;
}

export function requireServiceSupabase() {
  return createServiceSupabase();
}