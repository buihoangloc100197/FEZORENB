import { NextRequest, NextResponse } from "next/server";
import { supabase, getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

// Handles email verification token from Supabase
// GET /auth/callback?token_hash=...&type=signup&next=/auth/confirmed
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : new URL(req.url).origin);

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/auth/confirmed";

  let verifiedUser: any = null;

  // 1. Verify OTP with token_hash (email link)
  if (token_hash && type && isSupabaseConfigured) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (!error && data?.user) {
      verifiedUser = data.user;
    } else if (error) {
      console.error("Token hash verification error:", error);
    }
  }

  // 2. Exchange code for session if OAuth/PKCE code flow
  if (!verifiedUser && code && isSupabaseConfigured) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      verifiedUser = data.user;
    } else if (error) {
      console.error("Exchange code for session error:", error);
    }
  }

  // If user was verified, ensure activation, save profile into project database, and set session
  if (verifiedUser) {
    const adminClient = getServiceSupabase();

    // 1. Explicitly confirm email in auth.users if not already confirmed
    try {
      await adminClient.auth.admin.updateUserById(verifiedUser.id, {
        email_confirm: true,
      });
    } catch (e) {
      console.warn("Notice: User already confirmed or error updating auth.users:", e);
    }

    // 2. Fetch or prepare profile metadata
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id, full_name, phone, avatar_url, role, created_at")
      .eq("id", verifiedUser.id)
      .maybeSingle();

    const fullName =
      existingProfile?.full_name ||
      verifiedUser.user_metadata?.full_name ||
      verifiedUser.email?.split("@")[0].toUpperCase() ||
      "Thành viên";
    const phone =
      existingProfile?.phone ||
      verifiedUser.user_metadata?.phone ||
      "";
    const role =
      existingProfile?.role ||
      verifiedUser.user_metadata?.role ||
      (verifiedUser.email?.includes("admin") ? "admin" : "user");
    const avatarUrl =
      existingProfile?.avatar_url ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(verifiedUser.email || "")}`;

    // 3. Save / Upsert activated profile into project database table `profiles`
    await adminClient.from("profiles").upsert({
      id: verifiedUser.id,
      full_name: fullName,
      phone: phone,
      avatar_url: avatarUrl,
      role: role,
    });

    const userSession = {
      id: verifiedUser.id,
      email: verifiedUser.email,
      fullName,
      phone,
      avatarUrl,
      role,
      createdAt: existingProfile?.created_at || verifiedUser.created_at,
    };

    const targetUrl = `${siteUrl}${next}?email=${encodeURIComponent(verifiedUser.email || "")}`;
    const response = NextResponse.redirect(targetUrl);
    response.cookies.set("zorenb_session", JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }

  // Fallback redirect
  return NextResponse.redirect(`${siteUrl}/auth/confirmed`);
}
