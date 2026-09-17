import { NextRequest, NextResponse } from "next/server";
import { supabase, getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

// Handles email verification token from Supabase
// GET /auth/callback?token_hash=...&type=signup&next=/auth/confirmed
// Or hash params handled client side
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/auth/confirmed";

  // 1. Verify OTP with token_hash (PKCE / email link)
  if (token_hash && type) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      });

      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error("Token hash verification error:", error);
    }
  }

  // 2. Exchange code for session if Supabase Auth uses OAuth/PKCE code flow
  if (code && isSupabaseConfigured) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("Exchange code for session error:", error);
  }

  // Redirect to confirmed page or fallback
  return NextResponse.redirect(`${origin}/auth/confirmed`);
}
