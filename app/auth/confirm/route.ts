import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import {
  createAuthClient,
  getSafeRedirect,
  loginErrorUrl,
} from "../auth-redirect";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const validTypes = new Set<EmailOtpType>([
    "email",
    "invite",
    "magiclink",
    "recovery",
    "email_change",
    "signup",
  ]);

  if (!tokenHash || !type || !validTypes.has(type as EmailOtpType)) {
    return NextResponse.redirect(
      loginErrorUrl(
        request,
        "The confirmation link is invalid or has expired.",
      ),
    );
  }

  const destination = new URL(getSafeRedirect(request), request.url);
  const { response, supabase } = createAuthClient(request, destination);
  const { error } = await supabase.auth.verifyOtp({
    type: type as EmailOtpType,
    token_hash: tokenHash,
  });

  if (error) {
    return NextResponse.redirect(
      loginErrorUrl(
        request,
        "This confirmation link is invalid or has expired.",
      ),
    );
  }

  return response;
}
