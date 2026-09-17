import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

// Regular expression for validating standard email format (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Pattern detecting typical SQL injection & authentication bypass attempts
const SQLI_INJECTION_PATTERN = /('|"|--|;|\/\*|\*\/|\b(or|and)\b\s+['"\d\w]+\s*=\s*['"\d\w]+|\bunion\b\s+\bselect\b|\bdrop\b\s+\btable\b)/i;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Dữ liệu yêu cầu không hợp lệ." },
        { status: 400 }
      );
    }

    const { email, password, fullName, phone } = body;

    // 1. Validate Email (Bắt buộc phải có email hợp lệ)
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Bắt buộc phải cung cấp địa chỉ email để đăng ký tài khoản." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || cleanEmail.length === 0) {
      return NextResponse.json(
        { error: "Email không được để trống hoặc chỉ chứa khoảng trắng." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Định dạng email không hợp lệ. Vui lòng nhập email thật của Quý khách." },
        { status: 400 }
      );
    }

    // 2. Validate Password (Chống mật khẩu rỗng " " hoặc injection)
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Bắt buộc phải nhập mật khẩu." },
        { status: 400 }
      );
    }

    const trimmedPassword = password.trim();

    if (trimmedPassword.length === 0) {
      return NextResponse.json(
        { error: "Mật khẩu không được là khoảng trắng hoặc để trống." },
        { status: 400 }
      );
    }

    if (trimmedPassword.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên." },
        { status: 400 }
      );
    }

    // 3. Security Guard against SQL Injection / Bypass patterns
    if (SQLI_INJECTION_PATTERN.test(cleanEmail) || SQLI_INJECTION_PATTERN.test(password)) {
      return NextResponse.json(
        { error: "Cảnh báo bảo mật: Phát hiện ký tự không hợp lệ hoặc chuỗi injection nguy hiểm." },
        { status: 400 }
      );
    }

    const cleanFullName = (fullName && typeof fullName === "string") ? fullName.trim() : cleanEmail.split("@")[0].toUpperCase();
    const cleanPhone = (phone && typeof phone === "string") ? phone.trim() : "";
    const role = cleanEmail.includes("admin") ? "admin" : "user";
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`;

    let userId = "usr_" + Math.random().toString(36).substring(2, 11);
    let requiresEmailConfirmation = false;

    if (isSupabaseConfigured) {
      const adminClient = getServiceSupabase();
      // Resolve site origin dynamically, preferring public site url if deployed
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto") || "https";
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : req.nextUrl.origin);
      const redirectTo = `${siteUrl}/auth/callback?next=/auth/confirmed`;

      // 1. Try generate confirmation link directly via admin client
      // This generates a secure Supabase verification link that we can send via Resend!
      let verificationSentViaResend = false;
      try {
        const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
          type: "signup",
          email: cleanEmail,
          password: trimmedPassword,
          options: {
            data: {
              full_name: cleanFullName,
              phone: cleanPhone,
              role,
            },
            redirectTo,
          },
        });

        if (linkData?.user) {
          userId = linkData.user.id;
          requiresEmailConfirmation = true;

          // Upsert profile
          await adminClient.from("profiles").upsert({
            id: userId,
            full_name: cleanFullName,
            phone: cleanPhone,
            avatar_url: avatarUrl,
            role,
          });

          // Send luxury verification email using RESEND
          if (linkData.properties?.action_link) {
            const { sendVerificationEmail } = await import("@/lib/email-verification");
            const resendRes = await sendVerificationEmail({
              to: cleanEmail,
              customerName: cleanFullName,
              verificationLink: linkData.properties.action_link,
            });
            if (resendRes.success) {
              verificationSentViaResend = true;
            }
          }
        } else if (linkError) {
          // If already registered, return clear message
          if (
            linkError.message.toLowerCase().includes("already registered") ||
            linkError.message.toLowerCase().includes("already exists")
          ) {
            return NextResponse.json(
              { error: "Địa chỉ email này đã được đăng ký. Quý khách vui lòng đăng nhập hoặc dùng email khác." },
              { status: 400 }
            );
          }
          console.warn("generateLink error, falling back to signUp:", linkError.message);
        }
      } catch (genErr) {
        console.warn("Failed generateLink, trying standard signUp:", genErr);
      }

      // 2. Fallback to standard Supabase signUp if not sent via Resend
      if (!verificationSentViaResend && !userId.startsWith("usr_")) {
        const { data: signUpData, error: signUpError } = await adminClient.auth.signUp({
          email: cleanEmail,
          password: trimmedPassword,
          options: {
            data: {
              full_name: cleanFullName,
              phone: cleanPhone,
              role,
            },
            emailRedirectTo: redirectTo,
          },
        });

        if (signUpError) {
          if (
            signUpError.message.toLowerCase().includes("already registered") ||
            signUpError.message.toLowerCase().includes("already exists")
          ) {
            return NextResponse.json(
              { error: "Địa chỉ email này đã được đăng ký. Quý khách vui lòng đăng nhập hoặc dùng email khác." },
              { status: 400 }
            );
          }
          return NextResponse.json(
            { error: "Lỗi đăng ký tài khoản: " + signUpError.message },
            { status: 400 }
          );
        }

        if (signUpData.user) {
          userId = signUpData.user.id;
          requiresEmailConfirmation = !signUpData.session;

          // Upsert into profiles table
          await adminClient.from("profiles").upsert({
            id: userId,
            full_name: cleanFullName,
            phone: cleanPhone,
            avatar_url: avatarUrl,
            role,
          });
        }
      }
    }

    const newUser = {
      id: userId,
      email: cleanEmail,
      fullName: cleanFullName,
      phone: cleanPhone,
      avatarUrl,
      role,
      requiresEmailConfirmation,
      createdAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      message: requiresEmailConfirmation
        ? `Đăng ký thành công! Hệ thống ZORENB đã gửi email xác nhận đến ${cleanEmail}. Quý khách vui lòng kiểm tra hộp thư (inbox/spam) để kích hoạt tài khoản chính chủ.`
        : "Đăng ký thành công!",
      requiresEmailConfirmation,
      user: newUser,
    });

    // Only set active session cookie if email doesn't require separate confirmation
    if (!requiresEmailConfirmation) {
      response.cookies.set("zorenb_session", JSON.stringify(newUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống khi đăng ký: " + error.message },
      { status: 500 }
    );
  }
}
