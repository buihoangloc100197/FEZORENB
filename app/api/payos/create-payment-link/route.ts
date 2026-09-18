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

    // Build items with clean names and valid unit prices
    const formattedItems = items.map((item: {
      product?: { id?: string; name?: string; price?: number; currency?: string };
      quantity?: number;
    }) => {
      const isVND = item.product?.currency === "VND" || item.product?.id?.includes("test") || ((item.product?.price ?? 0) <= 50000 && item.product?.currency !== "$");
      const unitPriceVND = isVND
        ? Math.max(2000, Math.round(item.product?.price || 30000))
        : Math.max(2000, Math.round((item.product?.price || 1000) * EXCHANGE_RATE));
      const qty = Math.max(1, Number(item.quantity) || 1);
      const cleanProdName = (item.product?.name || "Đồng hồ FEZORENB")
        .replace(/[^\p{L}\p{N}\s\-]/gu, "")
        .trim()
        .slice(0, 45);

      return {
        name: cleanProdName || "Đồng hồ FEZORENB",
        quantity: qty,
        price: unitPriceVND,
        productId: item.product?.id || "custom-product",
      };
    });

    // Calculate shipping fee if any item requires it (e.g. 50k test product with 30k shipping fee)
    const shippingFeeTotal = items.reduce((acc: number, item: any) => {
      const fee = item.product?.shippingFee || (item.product?.id?.includes('50k') ? 30000 : 0);
      return acc + (Number(fee) || 0) * (Number(item.quantity) || 1);
    }, 0);

    if (shippingFeeTotal > 0) {
      formattedItems.push({
        name: "Phí vận chuyển giao hàng (Ship)",
        quantity: 1,
        price: shippingFeeTotal,
        productId: "shipping-fee-30k",
      });
    }

    const calculatedTotalVND = formattedItems.reduce(
      (acc: number, cur: any) => acc + cur.price * cur.quantity,
      0
    );

    // PayOS requires orderCode as integer (max safe integer, 6-9 digits)
    const orderCode = Number(
      String(Date.now()).slice(-6) + Math.floor(100 + Math.random() * 900)
    );
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const origin = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : req.nextUrl.origin);

    // Standardize PayOS description: Alphanumeric & spaces ONLY, max 25 chars, NO '#'
    const description = `ZORENB ${orderCode}`.slice(0, 25);

    // Ensure sum(item.price * item.quantity) === amount exactly
    let finalAmount = calculatedTotalVND;
    let payosItems = formattedItems.map((it: any) => ({
      name: it.name,
      quantity: it.quantity,
      price: it.price,
    }));

    // If total exceeds 50,000,000 VND (PayOS sandbox test cap), scale down proportionally
    if (finalAmount > 50000000) {
      finalAmount = 50000000;
      let runningSum = 0;
      payosItems = formattedItems.map((it: any, idx: number) => {
        if (idx === formattedItems.length - 1) {
          const rem = Math.max(1000, finalAmount - runningSum);
          const uPrice = Math.floor(rem / it.quantity);
          runningSum += uPrice * it.quantity;
          return { name: it.name, quantity: it.quantity, price: uPrice };
        }
        const ratio = (it.price * it.quantity) / calculatedTotalVND;
        const itTotal = Math.floor((50000000 * ratio) / it.quantity) * it.quantity;
        const uPrice = Math.max(1000, Math.floor(itTotal / it.quantity));
        runningSum += uPrice * it.quantity;
        return { name: it.name, quantity: it.quantity, price: uPrice };
      });
      const diff = finalAmount - runningSum;
      if (payosItems.length > 0 && diff !== 0) {
        payosItems[payosItems.length - 1].price += Math.floor(
          diff / payosItems[payosItems.length - 1].quantity
        );
      }
      finalAmount = payosItems.reduce(
        (acc: number, it: any) => acc + it.price * it.quantity,
        0
      );
    }

    const returnUrl = `${origin}/checkout/success?orderCode=${orderCode}&amount=${calculatedTotalVND}&email=${encodeURIComponent(cleanEmail)}&name=${encodeURIComponent(cleanName)}`;
    const cancelUrl = `${origin}/checkout/cancel?orderCode=${orderCode}`;

    const paymentData = {
      orderCode,
      amount: finalAmount,
      description,
      items: payosItems,
      returnUrl,
      cancelUrl,
    };

    if (isPayOSConfigured) {
      const paymentLink = await payOS.paymentRequests.create(paymentData);

      // Note: As requested, orders are ONLY recorded into the system once payment is successfully completed.
      // Unpaid / abandoned checkouts are not recorded into the database.

      return NextResponse.json({
        success: true,
        orderCode,
        checkoutUrl: paymentLink.checkoutUrl,
        paymentLinkId: paymentLink.paymentLinkId,
        amountVND: calculatedTotalVND,
      });
    }

    // Mock PayOS checkout when credentials aren't set yet in .env.local
    const mockCheckoutUrl = `${origin}/checkout/success?orderCode=${orderCode}&amount=${calculatedTotalVND}&email=${encodeURIComponent(cleanEmail)}&name=${encodeURIComponent(cleanName)}&demo=true`;
    return NextResponse.json({
      success: true,
      orderCode,
      checkoutUrl: mockCheckoutUrl,
      amountVND: calculatedTotalVND,
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
