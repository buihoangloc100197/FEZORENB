import { NextRequest, NextResponse } from "next/server";
import { payOS, isPayOSConfigured } from "@/lib/payos";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (isPayOSConfigured) {
      let webhookData: {
        orderCode?: number | string;
        [key: string]: unknown;
      } | null = null;

      try {
        webhookData = await payOS.webhooks.verify(body);
      } catch (verifyErr) {
        console.error("PayOS webhook verify error:", verifyErr);
        // Still accept the webhook to avoid PayOS retrying
        return NextResponse.json({ success: true, received: body });
      }

      // Update order status in Supabase if order code is present
      if (isSupabaseConfigured && webhookData?.orderCode) {
        try {
          const db = getServiceSupabase();
          const targetCode = String(webhookData.orderCode);

          // Fetch the order by payos_order_id first, then fallback to order_code
          let { data: order } = await db
            .from("orders")
            .select("*")
            .eq("payos_order_id", targetCode)
            .single();

          if (!order) {
            const fallback = await db
              .from("orders")
              .select("*")
              .eq("order_code", targetCode)
              .single();
            order = fallback.data;
          }

          if (order) {
            // Update order status to paid
            await db
              .from("orders")
              .update({
                status: "paid",
              })
              .eq("id", order.id);

            // Fetch customer email if not on order directly (e.g. from user profile)
            let recipientEmail = order.customer_email;
            let recipientName = order.customer_name || "Quý Khách";

            if (!recipientEmail && order.user_id) {
              const { data: prof } = await db
                .from("profiles")
                .select("full_name")
                .eq("id", order.user_id)
                .single();
              if (prof?.full_name) recipientName = prof.full_name;
            }

            // Send confirmation email with full invoice
            if (recipientEmail && recipientEmail !== "unknown@fezorenb.com") {
              const { data: orderItems } = await db
                .from("order_items")
                .select("product_name, quantity, unit_price")
                .eq("order_id", order.id);

              await sendOrderConfirmationEmail({
                to: recipientEmail,
                customerName: recipientName,
                orderCode: targetCode,
                totalAmount: Number(order.total_amount) || 0,
                items: (orderItems || []).map((item: any) => ({
                  product_name: item.product_name,
                  quantity: item.quantity,
                  price: Number(item.unit_price) || 0,
                })),
              }).catch((emailErr) => {
                console.error("Failed to send confirmation email:", emailErr);
              });
            }
          }
        } catch (dbErr) {
          console.error("Failed to update order status from webhook:", dbErr);
        }
      }

      return NextResponse.json({ success: true, data: webhookData });
    }

    return NextResponse.json({ success: true, received: body });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Lỗi xác thực webhook PayOS: " + msg },
      { status: 400 }
    );
  }
}
