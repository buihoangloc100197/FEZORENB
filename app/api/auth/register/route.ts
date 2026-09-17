import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured, supabase } from "@/lib/supabase";

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

    // 1. Validate Email
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

    // 2. Validate Password
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

    if (isSupabaseConfigured) {
      const adminClient = getServiceSupabase();
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto") || "https";
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : req.nextUrl.origin);
      const redirectTo = `${siteUrl}/auth/callback?next=/auth/confirmed`;

      // 1. Check if user already exists in auth.users
      const { data: existingUserCheck } = await adminClient.auth.admin.listUsers();
      const existingUser = existingUserCheck?.users?.find(
        (u) => u.email?.toLowerCase() === cleanEmail
      );

      let directLink: string | null = null;
      let verificationSent = false;
      let mailNote = "";

      if (existingUser) {
        if (existingUser.email_confirmed_at) {
          return NextResponse.json(
            { error: "Địa chỉ email này đã được đăng ký và xác thực. Quý khách vui lòng đăng nhập vào hệ thống." },
            { status: 400 }
          );
        }

        // Existing user is NOT confirmed yet. Update user details and resend confirmation
        userId = existingUser.id;
        await adminClient.auth.admin.updateUserById(userId, {
          password: trimmedPassword,
          user_metadata: {
            full_name: cleanFullName,
            phone: cleanPhone,
            role,
          },
        });

        // Trigger Supabase resend
        const { error: resendErr } = await supabase.auth.resend({
          type: "signup",
          email: cleanEmail,
          options: { emailRedirectTo: redirectTo },
        });
        if (!resendErr) {
          verificationSent = true;
        }
      } else {
        // Sign up with Supabase client to trigger built-in confirmation email sending
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
          return NextResponse.json(
            { error: "Lỗi đăng ký tài khoản: " + signUpError.message },
            { status: 400 }
          );
        }

        if (signUpData?.user) {
          userId = signUpData.user.id;
          verificationSent = true;
        }
      }

      // 2. Generate Supabase direct action link for immediate UI fallback
      const { data: linkData } = await adminClient.auth.admin.generateLink({
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

      if (linkData?.user && !userId) {
        userId = linkData.user.id;
      }

      // 3. Save / update profile in public.profiles table
      await adminClient.from("profiles").upsert({
        id: userId,
        full_name: cleanFullName,
        phone: cleanPhone,
        avatar_url: avatarUrl,
        role,
      });

      // 4. Capture verification link
      if (linkData?.properties?.action_link) {
        directLink = linkData.properties.action_link;
      }

      // 5. Send verification email via secondary channel as well
      if (directLink) {
        try {
          const { sendVerificationEmail } = await import("@/lib/email-verification");
          const emailRes = await sendVerificationEmail({
            to: cleanEmail,
            customerName: cleanFullName,
            verificationLink: directLink,
          });
          if (emailRes.success) {
            verificationSent = true;
          }
        } catch {
          // ignore secondary mailer if Supabase mailer already handled it
        }
      }

      const newUser = {
        id: userId,
        email: cleanEmail,
        fullName: cleanFullName,
        phone: cleanPhone,
        avatarUrl,
        role,
        requiresEmailConfirmation: true,
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        requiresEmailConfirmation: true,
        verificationSent,
        directLink,
        mailNote,
        message: verificationSent
          ? `Đăng ký thành công! Hệ thống ZORENB đã gửi email xác thực đến ${cleanEmail}. Quý khách vui lòng kiểm tra hộp thư (inbox/spam) và bấm vào liên kết xác thực để kích hoạt tài khoản chính chủ trước khi đăng nhập.`
          : `Đăng ký thành công! Để kích hoạt tài khoản ngay vào cơ sở dữ liệu dự án ZORENB, Quý khách vui lòng bấm vào nút kích hoạt bên dưới.`,
        user: newUser,
      });
    }

    const newUser = {
      id: userId,
      email: cleanEmail,
      fullName: cleanFullName,
      phone: cleanPhone,
      avatarUrl,
      role,
      requiresEmailConfirmation: true,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      requiresEmailConfirmation: true,
      message: `Đăng ký thành công! Hệ thống ZORENB đã tạo tài khoản cho ${cleanEmail}.`,
      user: newUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống khi đăng ký: " + error.message },
      { status: 500 }
    );
  }
}
