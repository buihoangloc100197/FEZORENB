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

          // Fetch the order to get customer info for email
          const { data: order } = await db
            .from("orders")
            .select(
              "id, customer_name, customer_email, total_amount, order_code"
            )
            .eq("order_code", String(webhookData.orderCode))
            .single();

          // Update order status to paid
          await db
            .from("orders")
            .update({
              status: "paid",
              updated_at: new Date().toISOString(),
            })
            .eq("order_code", String(webhookData.orderCode));

          // Send confirmation email if we have customer info
          if (order?.customer_email) {
            const { data: orderItems } = await db
              .from("order_items")
              .select("product_name, quantity, price")
              .eq("order_id", order.id);

            await sendOrderConfirmationEmail({
              to: order.customer_email,
              customerName: order.customer_name || "Quý Khách",
              orderCode: webhookData.orderCode,
              totalAmount: order.total_amount || 0,
              items: (orderItems || []).map((item) => ({
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price,
              })),
            }).catch((emailErr) => {
              // Log but don't fail the webhook
              console.error("Failed to send confirmation email:", emailErr);
            });
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
