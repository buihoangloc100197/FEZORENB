import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ email." },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured) {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.nextUrl.origin}/reset-password`,
      });
    }

    return NextResponse.json({
      message: "Liên kết khôi phục mật khẩu bảo mật đã được gửi tới email của Quý khách. Vui lòng kiểm tra hộp thư.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể xử lý yêu cầu: " + error.message },
      { status: 500 }
    );
  }
}
