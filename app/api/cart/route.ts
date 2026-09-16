import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

const isUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("zorenb_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ items: [] });
    }

    const user = JSON.parse(sessionCookie.value);

    if (isSupabaseConfigured && user?.id && isUUID(user.id)) {
      const db = getServiceSupabase();
      const { data, error } = await db
        .from("cart_items")
        .select("quantity, products(*)")
        .eq("user_id", user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const formatted = (data || []).map((row: any) => ({
        product: row.products,
        quantity: row.quantity,
      }));

      return NextResponse.json({ items: formatted });
    }

    return NextResponse.json({ items: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("zorenb_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ success: true, guest: true });
    }

    const user = JSON.parse(sessionCookie.value);
    const { items } = await req.json();

    if (isSupabaseConfigured && user?.id && isUUID(user.id) && items && Array.isArray(items)) {
      const db = getServiceSupabase();
      // Upsert cart items into Supabase
      await db.from("cart_items").delete().eq("user_id", user.id);

      if (items.length > 0) {
        const rows = items.map((item: any) => ({
          user_id: user.id,
          product_id: item.product.id,
          quantity: item.quantity,
        }));
        await db.from("cart_items").insert(rows);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
