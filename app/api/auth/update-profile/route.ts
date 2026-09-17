import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("zorenb_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const currentUser = JSON.parse(sessionCookie.value);
    const { fullName, phone, avatarUrl } = await req.json();

    const updatedUser = {
      ...currentUser,
      fullName: fullName || currentUser.fullName,
      phone: phone !== undefined ? phone : currentUser.phone,
      avatarUrl: avatarUrl || currentUser.avatarUrl,
    };

    if (isSupabaseConfigured && currentUser.id && !currentUser.id.startsWith("usr_admin_master")) {
      const adminClient = getServiceSupabase();
      await adminClient
        .from("profiles")
        .update({
          full_name: updatedUser.fullName,
          phone: updatedUser.phone,
          avatar_url: updatedUser.avatarUrl,
        })
        .eq("id", currentUser.id);
    }

    const response = NextResponse.json({
      message: "Cập nhật thông tin thành công!",
      user: updatedUser,
    });

    response.cookies.set("zorenb_session", JSON.stringify(updatedUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi cập nhật: " + error.message },
      { status: 500 }
    );
  }
}
