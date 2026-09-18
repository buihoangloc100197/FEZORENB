import { NextRequest, NextResponse } from "next/server";
import { sendOrderConfirmationEmail, OrderItem } from "@/lib/email";

// POST /api/email/confirm-payment
// Body: { to, customerName, orderCode, totalAmount, items }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Dữ liệu yêu cầu không hợp lệ." },
        { status: 400 }
      );
    }

    const { to, customerName, orderCode, totalAmount, items } = body;

    // Validate required fields
    if (!to || typeof to !== "string" || !to.includes("@")) {
      return NextResponse.json(
        { error: "Email người nhận không hợp lệ." },
        { status: 400 }
      );
    }

    if (!orderCode) {
      return NextResponse.json(
        { error: "Thiếu mã đơn hàng." },
        { status: 400 }
      );
    }

    if (!totalAmount || typeof totalAmount !== "number") {
      return NextResponse.json(
        { error: "Thiếu tổng tiền đơn hàng." },
        { status: 400 }
      );
    }

    const orderItems: OrderItem[] = Array.isArray(items)
      ? items.map((item: OrderItem) => ({
          product_name:
            typeof item.product_name === "string"
              ? item.product_name
              : "Đồng hồ FEZORENB",
          quantity:
            typeof item.quantity === "number" && item.quantity > 0
              ? item.quantity
              : 1,
          price: typeof item.price === "number" ? item.price : 0,
          image_url:
            typeof item.image_url === "string" ? item.image_url : undefined,
        }))
      : [];

    const result = await sendOrderConfirmationEmail({
      to: to.toLowerCase().trim(),
      customerName:
        typeof customerName === "string" && customerName.trim()
          ? customerName.trim()
          : "Quý Khách",
      orderCode,
      totalAmount,
      items: orderItems,
      orderDate: new Date().toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    // Persist paid order into Supabase database upon successful payment
    try {
      const { getServiceSupabase, isSupabaseConfigured } = await import("@/lib/supabase");
      if (isSupabaseConfigured && orderCode) {
        const db = getServiceSupabase();
        const codeStr = String(orderCode);

        // Check if order already recorded
        const { data: existing } = await db
          .from("orders")
          .select("id")
          .eq("payos_order_id", codeStr)
          .single();

        let insertedOrderId = existing?.id;

        if (!existing) {
          const { data: newOrd } = await db
            .from("orders")
            .insert({
              payos_order_id: codeStr,
              order_code: codeStr,
              customer_name: typeof customerName === "string" && customerName.trim() ? customerName.trim() : "Quý Khách",
              customer_email: to.toLowerCase().trim(),
              status: "paid",
              total_amount: totalAmount,
              currency: "VND",
            })
            .select("id")
            .single();

          if (newOrd?.id) {
            insertedOrderId = newOrd.id;
          }
        } else {
          await db.from("orders").update({ status: "paid" }).eq("id", existing.id);
        }

        // Insert order items if new order
        if (insertedOrderId && !existing && orderItems.length > 0) {
          for (const item of orderItems) {
            try {
              await db.from("order_items").insert({
                order_id: insertedOrderId,
                product_id: "watch-item",
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: item.price,
              });
            } catch {
              // ignore
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to record paid order:", e);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      emailId: result.emailId,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Lỗi gửi email xác nhận: " + msg },
      { status: 500 }
    );
  }
}
