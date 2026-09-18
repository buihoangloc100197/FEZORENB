import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp địa chỉ email cần xác thực." },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: "Supabase chưa được cấu hình." },
        { status: 500 }
      );
    }

    const adminClient = getServiceSupabase();
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : req.nextUrl.origin);
    const redirectTo = `${siteUrl}/auth/callback?next=/auth/confirmed`;

    // Find user in auth.users
    const { data: usersData } = await adminClient.auth.admin.listUsers();
    const user = usersData?.users?.find((u) => u.email?.toLowerCase() === email);

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản với email này trong hệ thống." },
        { status: 404 }
      );
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        message: "Tài khoản này đã được xác thực email trước đó. Quý khách có thể đăng nhập ngay.",
      });
    }

    // Generate fresh verification link
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: user.email!,
      options: {
        redirectTo,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      return NextResponse.json(
        { error: "Không thể tạo liên kết xác thực: " + (linkError?.message || "Unknown") },
        { status: 500 }
      );
    }

    const hashedToken = linkData.properties?.hashed_token;
    const directLink = hashedToken
      ? `${siteUrl}/auth/callback?token_hash=${hashedToken}&type=magiclink&next=/auth/confirmed`
      : linkData.properties.action_link;
    const customerName = user.user_metadata?.full_name || email.split("@")[0].toUpperCase();

    // 1. Send via Supabase Auth built-in mailer
    const { supabase } = await import("@/lib/supabase");
    let verificationSent = false;
    const { error: sbResendErr } = await supabase.auth.resend({
      type: "signup",
      email: user.email!,
      options: { emailRedirectTo: redirectTo },
    });
    if (!sbResendErr) {
      verificationSent = true;
    }

    // 2. Also try secondary mailer
    try {
      const { sendVerificationEmail } = await import("@/lib/email-verification");
      const emailRes = await sendVerificationEmail({
        to: email,
        customerName,
        verificationLink: directLink,
      });
      if (emailRes.success) {
        verificationSent = true;
      }
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      verificationSent,
      directLink,
      message: `Đã gửi lại email xác thực thành công đến ${email}. Quý khách vui lòng kiểm tra hộp thư (inbox/spam) hoặc bấm liên kết kích hoạt trực tiếp bên dưới.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống: " + err.message },
      { status: 500 }
    );
  }
}
