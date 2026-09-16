import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { ALL_WATCHES } from "@/data/watches";

// Admin-only API: Seed ALL_WATCHES data into Supabase products table
// Call via: POST /api/admin/seed-products
// Header: Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
export async function POST(req: NextRequest) {
  try {
    // Simple security: require a secret header to prevent unauthorized access
    const authHeader = req.headers.get("x-admin-secret");
    const expectedSecret =
      process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-12) ||
      process.env.ADMIN_SEED_SECRET;

    if (!authHeader || authHeader !== expectedSecret) {
      return NextResponse.json(
        { error: "Không được phép. Thiếu hoặc sai Admin Secret Header." },
        { status: 403 }
      );
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: "Supabase chưa được cấu hình." },
        { status: 503 }
      );
    }

    const db = getServiceSupabase();

    // First attempt: upsert with all columns (including optional ones)
    const fullProducts = ALL_WATCHES.map((w) => ({
      id: w.id,
      name: w.name,
      brand: w.brand,
      reference: w.reference,
      price: w.price,
      original_price: w.originalPrice ?? null,
      images: w.images,
      caliber: w.caliber ?? null,
      case_size: w.caseSize ?? null,
      complications: w.complications ?? [],
      description: w.description,
      rating: w.rating,
    }));

    let { data, error } = await db
      .from("products")
      .upsert(fullProducts, { onConflict: "id" })
      .select("id, name, brand");

    // If columns don't exist, fall back to core-only columns
    if (error && error.message.includes("column")) {
      console.warn("Optional columns missing, falling back to core columns:", error.message);
      const coreProducts = ALL_WATCHES.map((w) => ({
        id: w.id,
        name: w.name,
        brand: w.brand,
        reference: w.reference,
        price: w.price,
        images: w.images,
        description: w.description,
        rating: w.rating,
      }));
      const fallback = await db
        .from("products")
        .upsert(coreProducts, { onConflict: "id" })
        .select("id, name, brand");
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error("Seed error:", error);
      return NextResponse.json(
        { error: "Lỗi upsert sản phẩm: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã seed thành công ${data?.length || 0} sản phẩm vào Supabase.`,
      count: data?.length || 0,
      products: data,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Lỗi hệ thống khi seed: " + msg },
      { status: 500 }
    );
  }
}
