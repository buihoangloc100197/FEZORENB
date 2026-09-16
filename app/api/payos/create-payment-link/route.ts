import { NextRequest, NextResponse } from "next/server";
import { payOS, isPayOSConfigured } from "@/lib/payos";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

// SQL Injection guard - basic check for payment fields
const SQLI_PATTERN =
  /('|"|--|;|\/\*|\*\/|\b(or|and)\b\s+['"\d\w]+\s*=\s*['"\d\w]+|\bunion\b\s+\bselect\b|\bdrop\b\s+\btable\b)/i;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Dữ liệu yêu cầu không hợp lệ." },
        { status: 400 }
      );
    }

    const {
      items,
      totalAmountUSD,
      customerName,
      customerEmail,
      customerPhone,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Giỏ hàng đang trống." },
        { status: 400 }
      );
    }

    // Sanitize customer inputs
    const cleanEmail =
      typeof customerEmail === "string"
        ? customerEmail.toLowerCase().trim()
        : "";
    const cleanName =
      typeof customerName === "string" ? customerName.trim() : "Quý Khách";
    const cleanPhone =
      typeof customerPhone === "string" ? customerPhone.trim() : "";

    // Security: check for injection in customer fields
    if (
      (cleanEmail && SQLI_PATTERN.test(cleanEmail)) ||
      SQLI_PATTERN.test(cleanName)
    ) {
      return NextResponse.json(
        {
          error: "Cảnh báo bảo mật: Phát hiện ký tự không hợp lệ trong thông tin khách hàng.",
        },
        { status: 400 }
      );
    }

    // Exchange rate USD to VND (approx 25,400 VND/USD for PayOS payment processing)
    const EXCHANGE_RATE = 25400;
    // Calculate total amount in VND, minimum 2000 VND
    const totalAmountVND = Math.max(
      2000,
      Math.round((totalAmountUSD || 1000) * EXCHANGE_RATE)
    );

    // PayOS requires orderCode as integer (max safe integer)
    const orderCode = Number(
      String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000)
    );
    const origin = req.nextUrl.origin;

    const paymentData = {
      orderCode,
      amount: Math.min(totalAmountVND, 50000000), // Cap for standard PayOS sandbox test
      description: `ZORENB #${orderCode}`.slice(0, 25),
      items: items.map((item: {
        product?: { name?: string; price?: number };
        quantity?: number;
      }) => ({
        name: (item.product?.name || "Đồng hồ FEZORENB").slice(0, 50),
        quantity: item.quantity || 1,
        price: Math.min(
          20000000,
          Math.round(
            ((item.product?.price || 1000) * EXCHANGE_RATE) /
              (item.quantity || 1)
          )
        ),
      })),
      returnUrl: `${origin}/checkout/success?orderCode=${orderCode}&amount=${totalAmountVND}&email=${encodeURIComponent(cleanEmail)}&name=${encodeURIComponent(cleanName)}`,
      cancelUrl: `${origin}/checkout/cancel?orderCode=${orderCode}`,
    };

    if (isPayOSConfigured) {
      const paymentLink = await payOS.paymentRequests.create(paymentData);

      // Persist order in Supabase if configured
      if (isSupabaseConfigured) {
        try {
          const db = getServiceSupabase();
          const sessionCookie = req.cookies.get("zorenb_session");
          let userId: string | null = null;
          if (sessionCookie?.value) {
            try {
              const u = JSON.parse(sessionCookie.value);
              if (
                u?.id &&
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                  u.id
                )
              ) {
                userId = u.id;
              }
            } catch {
              // ignore parse errors
            }
          }

          const { data: insertedOrder } = await db
            .from("orders")
            .insert({
              user_id: userId,
              order_code: String(orderCode),
              customer_name: cleanName || "Quý Khách",
              customer_email: cleanEmail || "unknown@fezorenb.com",
              customer_phone: cleanPhone,
              status: "pending",
              total_amount: totalAmountVND,
              currency: "VND",
              payos_payment_link_id: paymentLink.paymentLinkId,
              payos_checkout_url: paymentLink.checkoutUrl,
            })
            .select()
            .single();

          if (insertedOrder?.id) {
            const orderItemsToInsert = items.map((item: {
              product?: { id?: string; name?: string; price?: number };
              quantity?: number;
            }) => ({
              order_id: insertedOrder.id,
              product_id: item.product?.id || "custom-product",
              product_name: item.product?.name || "Đồng hồ FEZORENB",
              quantity: item.quantity || 1,
              price: Math.round(
                ((item.product?.price || 1000) * EXCHANGE_RATE) /
                  (item.quantity || 1)
              ),
              image_url: null,
            }));
            await db.from("order_items").insert(orderItemsToInsert);
          }
        } catch (dbErr) {
          console.error("Failed to persist order to database:", dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        orderCode,
        checkoutUrl: paymentLink.checkoutUrl,
        paymentLinkId: paymentLink.paymentLinkId,
        amountVND: totalAmountVND,
      });
    }

    // Mock PayOS checkout when credentials aren't set yet in .env.local
    const mockCheckoutUrl = `${origin}/checkout/success?orderCode=${orderCode}&amount=${totalAmountVND}&email=${encodeURIComponent(cleanEmail)}&name=${encodeURIComponent(cleanName)}&demo=true`;
    return NextResponse.json({
      success: true,
      orderCode,
      checkoutUrl: mockCheckoutUrl,
      amountVND: totalAmountVND,
      notice:
        "Đang sử dụng chế độ PayOS Test Simulator. Khi bạn cấu hình PAYOS_CLIENT_ID trong .env.local, hệ thống sẽ tự động gọi trực tiếp PayOS Production API.",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Lỗi kết nối cổng thanh toán PayOS: " + msg },
      { status: 500 }
    );
  }
}
