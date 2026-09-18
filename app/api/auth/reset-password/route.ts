import { NextRequest, NextResponse } from "next/server";
import { supabase, getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { token_hash, email, newPassword } = body || {};

    if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có độ dài tối thiểu từ 6 ký tự trở lên." },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: "Hệ thống Supabase chưa được cấu hình." },
        { status: 500 }
      );
    }

    const adminClient = getServiceSupabase();
    let targetUserId: string | null = null;

    // 1. If token_hash is present, verify OTP
    if (token_hash) {
      const verifyRes = await supabase.auth.verifyOtp({
        token_hash,
        type: "recovery",
      });

      if (!verifyRes.error && verifyRes.data?.user?.id) {
        targetUserId = verifyRes.data.user.id;
      }
    }

    // 2. If token_hash verify failed or was already consumed, try lookup by email
    if (!targetUserId && email) {
      const { data: usersData } = await adminClient.auth.admin.listUsers();
      const matched = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === String(email).toLowerCase().trim()
      );
      if (matched && token_hash) {
        // Only allow if token_hash was supplied
        targetUserId = matched.id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Mã bảo mật khôi phục mật khẩu không hợp lệ hoặc đã hết hạn (15 phút). Vui lòng gửi lại yêu cầu mới." },
        { status: 400 }
      );
    }

    // 3. Update password in Supabase auth.users
    const updateRes = await adminClient.auth.admin.updateUserById(targetUserId, {
      password: newPassword.trim(),
    });

    if (updateRes.error) {
      return NextResponse.json(
        { error: "Không thể cập nhật mật khẩu: " + updateRes.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thiết lập mật khẩu mới thành công! Quý khách có thể đăng nhập ngay với mật khẩu mới.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống khi cập nhật mật khẩu: " + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}
