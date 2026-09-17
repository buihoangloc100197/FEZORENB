import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

function checkIsAdmin(req: NextRequest): boolean {
  const sessionCookie = req.cookies.get("zorenb_session");
  if (!sessionCookie?.value) return false;
  try {
    const user = JSON.parse(sessionCookie.value);
    return user.role === "admin";
  } catch {
    return false;
  }
}

// GET /api/admin/users — List profiles & staff
export async function GET(req: NextRequest) {
  try {
    if (!checkIsAdmin(req)) {
      return NextResponse.json(
        { error: "Chỉ Quản trị viên (Admin) mới có quyền xem danh sách nhân sự & người dùng." },
        { status: 403 }
      );
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ users: [] });
    }

    const db = getServiceSupabase();
    const { data: profiles, error } = await db
      .from("profiles")
      .select("id, full_name, phone, avatar_url, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: profiles || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/users — Update role (admin, staff, user)
export async function PATCH(req: NextRequest) {
  try {
    if (!checkIsAdmin(req)) {
      return NextResponse.json(
        { error: "Chỉ Quản trị viên (Admin) mới có quyền phân quyền." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.userId || !body.role) {
      return NextResponse.json({ error: "Thiếu userId hoặc role." }, { status: 400 });
    }

    const allowedRoles = ["admin", "staff", "user"];
    if (!allowedRoles.includes(body.role)) {
      return NextResponse.json({ error: "Vai trò không hợp lệ." }, { status: 400 });
    }

    const db = getServiceSupabase();
    const { data, error } = await db
      .from("profiles")
      .update({ role: body.role })
      .eq("id", body.userId)
      .select("id, full_name, phone, avatar_url, role")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
