import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { ALL_WATCHES } from "@/data/watches";

// GET /api/products — Returns products from Supabase DB (with local fallback)
// Query params: brand, search, sort (price-desc | price-asc | rating | featured)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand") || "all";
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "featured";

    // Try to fetch from Supabase first
    if (isSupabaseConfigured) {
      const db = getServiceSupabase();

      // Select core columns — optional columns (caliber, case_size, complications, original_price)
      // may not exist yet in older DB schemas; we gracefully handle their absence
      let query = db.from("products").select(
        "id, name, brand, reference, price, original_price, images, caliber, complications, description, rating"
      );

      // Filter by brand
      if (brand && brand !== "all") {
        // Map slug → brand name
        const brandMap: Record<string, string> = {
          rolex: "Rolex",
          "patek-philippe": "Patek Philippe",
          "audemars-piguet": "Audemars Piguet",
          "richard-mille": "Richard Mille",
          "vacheron-constantin": "Vacheron Constantin",
          "a-lange-sohne": "A. Lange & Söhne",
          "jaeger-lecoultre": "Jaeger-LeCoultre",
          cartier: "Cartier",
          omega: "Omega",
          "iwc-schaffhausen": "IWC Schaffhausen",
        };
        const brandName = brandMap[brand];
        if (brandName) {
          query = query.eq("brand", brandName);
        }
      }

      // Search by name/reference
      if (search.trim()) {
        query = query.or(
          `name.ilike.%${search}%,brand.ilike.%${search}%,reference.ilike.%${search}%`
        );
      }

      // Sort
      if (sort === "price-desc") {
        query = query.order("price", { ascending: false });
      } else if (sort === "price-asc") {
        query = query.order("price", { ascending: true });
      } else if (sort === "rating") {
        query = query.order("rating", { ascending: false });
      } else {
        // featured: default insertion order (by brand hierarchy)
        query = query.order("brand", { ascending: true });
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          products: data,
          source: "supabase",
          count: data.length,
        });
      }

      // Supabase returned empty — fall through to local fallback
      console.warn(
        "Supabase products table empty or error, falling back to local data."
      );
    }

    // Local fallback: serve from data/watches
    let watches = [...ALL_WATCHES];

    if (brand && brand !== "all") {
      const brandMap: Record<string, string> = {
        rolex: "Rolex",
        "patek-philippe": "Patek Philippe",
        "audemars-piguet": "Audemars Piguet",
        "richard-mille": "Richard Mille",
        "vacheron-constantin": "Vacheron Constantin",
        "a-lange-sohne": "A. Lange & Söhne",
        "jaeger-lecoultre": "Jaeger-LeCoultre",
        cartier: "Cartier",
        omega: "Omega",
        "iwc-schaffhausen": "IWC Schaffhausen",
      };
      const brandName = brandMap[brand];
      if (brandName) {
        watches = watches.filter((w) => w.brand === brandName);
      }
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      watches = watches.filter(
        (w) =>
          w.name.toLowerCase().includes(term) ||
          w.brand.toLowerCase().includes(term) ||
          w.reference.toLowerCase().includes(term)
      );
    }

    if (sort === "price-desc") {
      watches.sort((a, b) => b.price - a.price);
    } else if (sort === "price-asc") {
      watches.sort((a, b) => a.price - b.price);
    } else if (sort === "rating") {
      watches.sort((a, b) => b.rating - a.rating);
    }

    return NextResponse.json({
      products: watches.map((w) => ({
        id: w.id,
        name: w.name,
        brand: w.brand,
        reference: w.reference,
        price: w.price,
        original_price: w.originalPrice,
        images: w.images,
        caliber: w.caliber,
        case_size: w.caseSize,
        complications: w.complications,
        description: w.description,
        rating: w.rating,
      })),
      source: "local",
      count: watches.length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Lỗi lấy danh sách sản phẩm: " + msg },
      { status: 500 }
    );
  }
}
