import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

const isUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("zorenb_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ orders: [] });
    }

    const user = JSON.parse(sessionCookie.value);

    if (!isSupabaseConfigured || !user?.id || !isUUID(user.id)) {
      return NextResponse.json({ orders: [] });
    }

    const db = getServiceSupabase();

    const { data: orders, error } = await db
      .from("orders")
      .select(`
        id,
        payos_order_id,
        total_amount,
        currency,
        status,
        created_at,
        order_items (
          id,
          product_id,
          product_name,
          unit_price,
          quantity
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedOrders = (orders || []).map((ord: any) => ({
      ...ord,
      order_code: ord.payos_order_id || ord.id.slice(0, 8),
      order_items: (ord.order_items || []).map((item: any) => ({
        ...item,
        price: item.unit_price,
      })),
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
