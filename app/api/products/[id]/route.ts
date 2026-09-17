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

    const localWatch = ALL_WATCHES.find((w) => w.id === id);

    // Try Supabase first
    if (isSupabaseConfigured) {
      const db = getServiceSupabase();
      const { data, error } = await db
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        const mergedProduct = {
          ...(localWatch || {}),
          ...data,
          images: (data.images && data.images.length > 0) ? data.images : localWatch?.images || [],
          specs: localWatch?.specs || {},
          details: localWatch?.details || [],
          caseSize: data.case_size || localWatch?.caseSize || "40mm",
          caliber: data.caliber || localWatch?.caliber || "In-house Calibre",
          complications: (data.complications && data.complications.length > 0) ? data.complications : localWatch?.complications || [],
        };
        return NextResponse.json({ product: mergedProduct, source: "supabase" });
      }
    }

    // Local fallback
    if (!localWatch) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm." },
        { status: 404 }
      );
    }

    return NextResponse.json({ product: localWatch, source: "local" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Lỗi lấy sản phẩm: " + msg },
      { status: 500 }
    );
  }
}
