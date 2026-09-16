import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { ALL_WATCHES } from "@/data/watches";

// GET /api/products/[id] — Returns a single product detail
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/products/[id]">
) {
  try {
    const { id } = await ctx.params;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return NextResponse.json(
        { error: "ID sản phẩm không hợp lệ." },
        { status: 400 }
      );
    }

    // Try Supabase first
    if (isSupabaseConfigured) {
      const db = getServiceSupabase();
      const { data, error } = await db
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        return NextResponse.json({ product: data, source: "supabase" });
      }
    }

    // Local fallback
    const watch = ALL_WATCHES.find((w) => w.id === id);
    if (!watch) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm." },
        { status: 404 }
      );
    }

    return NextResponse.json({ product: watch, source: "local" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Lỗi lấy sản phẩm: " + msg },
      { status: 500 }
    );
  }
}
