import { NextResponse, type NextRequest } from "next/server";
import {
  createAuthClient,
  getSafeRedirect,
  loginErrorUrl,
} from "../auth-redirect";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      loginErrorUrl(request, "The sign-in link is missing its code."),
    );
  }

  const destination = new URL(getSafeRedirect(request), request.url);
  const { response, supabase } = createAuthClient(request, destination);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      loginErrorUrl(request, "This sign-in link is invalid or has expired."),
    );
  }

  return response;
}
