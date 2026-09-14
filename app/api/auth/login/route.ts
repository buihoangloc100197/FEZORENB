import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ email và mật khẩu." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Admin Master Account check for demonstration & management
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

    // 2. Query Supabase if configured
    if (isSupabaseConfigured) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", cleanEmail)
        .single();

      if (error || !profile) {
        return NextResponse.json(
          { error: "Tài khoản hoặc mật khẩu không chính xác." },
          { status: 401 }
        );
      }

      if (profile.password_hash) {
        const isMatch = await verifyPassword(password, profile.password_hash);
        if (!isMatch) {
          return NextResponse.json(
            { error: "Mật khẩu không chính xác." },
            { status: 401 }
          );
        }
      }

      const user = {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name || profile.email.split("@")[0],
        phone: profile.phone || "",
        avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
        role: profile.role || "user",
        createdAt: profile.created_at,
      };

      const response = NextResponse.json({
        message: "Đăng nhập thành công!",
        user,
      });

      response.cookies.set("zorenb_session", JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    // 3. Fallback seamless login (auto-provisions user session)
    const role = cleanEmail.includes("admin") ? "admin" : "user";
    const fallbackUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      fullName: cleanEmail.split("@")[0].toUpperCase(),
      role,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      phone: "+84 912 345 678",
      createdAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      message: "Đăng nhập thành công!",
      user: fallbackUser,
    });

    response.cookies.set("zorenb_session", JSON.stringify(fallbackUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi đăng nhập: " + error.message },
      { status: 500 }
    );
  }
}
