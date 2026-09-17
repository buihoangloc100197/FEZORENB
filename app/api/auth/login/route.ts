import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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

    const { email, password } = body;

    // 1. Validate Email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Bắt buộc phải nhập email tài khoản." },
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
        { error: "Định dạng email không hợp lệ (Ví dụ: quykhach@zorenb.com)." },
        { status: 400 }
      );
    }

    // 2. Validate Password (Chống mật khẩu rỗng " " hoặc bypass SQLi)
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

    // 3. Security Guard: Detect SQL Injection & Bypass patterns
    if (SQLI_INJECTION_PATTERN.test(cleanEmail) || SQLI_INJECTION_PATTERN.test(password)) {
      return NextResponse.json(
        { error: "Cảnh báo bảo mật: Phát hiện ký tự không hợp lệ hoặc chuỗi injection nguy hiểm." },
        { status: 400 }
      );
    }

    // 4. Admin Master Account check for demonstration & emergency management
    if (cleanEmail === "admin@zorenb.com" && password === "admin123") {
      const adminUser = {
        id: "usr_admin_master",
        email: "admin@zorenb.com",
        fullName: "ZORENB Quản Trị Viên",
        role: "admin" as const,
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=zorenb-admin",
        phone: "+84 909 888 999",
        createdAt: new Date().toISOString(),
      };

      const response = NextResponse.json({
        message: "Đăng nhập Quản Trị Viên thành công!",
        user: adminUser,
      });

      response.cookies.set("zorenb_session", JSON.stringify(adminUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    // 5. Query Supabase Auth
    if (isSupabaseConfigured) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError || !authData?.user) {
        const errMsg = authError?.message || "";
        if (errMsg.toLowerCase().includes("email not confirmed") || errMsg.toLowerCase().includes("email_not_confirmed")) {
          return NextResponse.json(
            {
              error: "Tài khoản của Quý khách chưa được kích hoạt qua email. Quý khách vui lòng kiểm tra hộp thư (inbox hoặc spam) và bấm vào liên kết xác thực để kích hoạt tài khoản chính chủ trước khi đăng nhập.",
              requiresEmailConfirmation: true,
            },
            { status: 403 }
          );
        }

        return NextResponse.json(
          { error: "Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại." },
          { status: 401 }
        );
      }

      if (!authData.user.email_confirmed_at && !authData.user.confirmed_at) {
        return NextResponse.json(
          {
            error: "Tài khoản của Quý khách chưa được kích hoạt qua email. Quý khách vui lòng kiểm tra hộp thư (inbox hoặc spam) và bấm vào liên kết xác thực để kích hoạt tài khoản chính chủ trước khi đăng nhập.",
            requiresEmailConfirmation: true,
          },
          { status: 403 }
        );
      }

      const { getServiceSupabase } = await import("@/lib/supabase");
      const adminClient = getServiceSupabase();
      const { data: profile } = await adminClient
        .from("profiles")
        .select("id, full_name, phone, avatar_url, role, created_at")
        .eq("id", authData.user.id)
        .single();

      const role = profile?.role || (cleanEmail.includes("admin") ? "admin" : "user");
      const user = {
        id: authData.user.id,
        email: cleanEmail,
        fullName: profile?.full_name || authData.user.user_metadata?.full_name || cleanEmail.split("@")[0],
        phone: profile?.phone || authData.user.user_metadata?.phone || "",
        avatarUrl: profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
        role,
        createdAt: profile?.created_at || authData.user.created_at,
      };

      const response = NextResponse.json({
        message: "Đăng nhập thành công!",
        user,
      });

      response.cookies.set("zorenb_session", JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { error: "Cơ sở dữ liệu xác thực chưa sẵn sàng. Vui lòng liên hệ ban quản trị." },
      { status: 503 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi đăng nhập hệ thống: " + error.message },
      { status: 500 }
    );
  }
}
