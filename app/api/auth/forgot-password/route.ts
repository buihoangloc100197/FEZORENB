import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendPasswordResetEmail } from "@/lib/email-recovery";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ email của Quý khách." },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: "Cơ sở dữ liệu Supabase chưa được cấu hình." },
        { status: 500 }
      );
    }

    const adminClient = getServiceSupabase();
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : req.nextUrl.origin);
    const redirectTo = `${siteUrl}/reset-password`;

    // 1. Check if user exists in auth.users
    const { data: usersData } = await adminClient.auth.admin.listUsers();
    const user = usersData?.users?.find((u) => u.email?.toLowerCase() === email);

    if (!user) {
      return NextResponse.json(
        { error: `Không tìm thấy tài khoản với email "${email}" trong hệ thống ZORENB. Vui lòng kiểm tra lại chính xác email đã đăng ký.` },
        { status: 404 }
      );
    }

    const customerName = user.user_metadata?.full_name || email.split("@")[0].toUpperCase();

    // 2. Generate secure recovery link using admin client (bypasses Supabase built-in SMTP rate limits!)
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email: user.email!,
      options: {
        redirectTo,
      },
    });

    if (linkError || !linkData?.properties) {
      return NextResponse.json(
        { error: "Không thể tạo liên kết khôi phục mật khẩu: " + (linkError?.message || "Lỗi không xác định") },
        { status: 500 }
      );
    }

    const hashedToken = linkData.properties.hashed_token;
    const directLink = hashedToken
      ? `${siteUrl}/reset-password?token_hash=${hashedToken}&type=recovery&email=${encodeURIComponent(email)}`
      : linkData.properties.action_link;

    // 3. Dispatch recovery email via SMTP / Resend
    let emailSent = false;
    let emailStatusMessage = "";

    try {
      const emailRes = await sendPasswordResetEmail({
        to: email,
        customerName,
        resetLink: directLink,
      });
      emailSent = emailRes.success;
      emailStatusMessage = emailRes.message;
    } catch (e: any) {
      emailStatusMessage = e?.message || "Lỗi gửi email";
    }

    return NextResponse.json({
      success: true,
      emailSent,
      emailStatusMessage,
      directLink,
      message: emailSent
        ? `Đã gửi liên kết khôi phục mật khẩu tới ${email}. Quý khách vui lòng kiểm tra hộp thư (inbox/spam) hoặc có thể bấm đặt lại mật khẩu trực tiếp bên dưới.`
        : `Đã khởi tạo liên kết bảo mật khôi phục mật khẩu cho ${email}. Quý khách vui lòng bấm nút đặt lại mật khẩu bên dưới để thiết lập mật khẩu mới ngay lập tức.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi máy chủ khi xử lý yêu cầu: " + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}
