import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, phone } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp email và mật khẩu." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(password);
    const userId = "usr_" + Math.random().toString(36).substring(2, 11);
    const role = email.toLowerCase().includes("admin") ? "admin" : "user";

    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      fullName: fullName || email.split("@")[0],
      phone: phone || "",
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      role,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { error: dbError } = await supabase.from("profiles").insert({
        id: userId,
        email: newUser.email,
        full_name: newUser.fullName,
        phone: newUser.phone,
        avatar_url: newUser.avatarUrl,
        role: newUser.role,
        password_hash: hashedPassword,
      });

      if (dbError) {
        return NextResponse.json(
          { error: "Lỗi lưu dữ liệu: " + dbError.message },
          { status: 500 }
        );
      }
    }

    const response = NextResponse.json({
      message: "Đăng ký thành công!",
      user: newUser,
    });

    response.cookies.set("zorenb_session", JSON.stringify(newUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống: " + error.message },
      { status: 500 }
    );
  }
}
