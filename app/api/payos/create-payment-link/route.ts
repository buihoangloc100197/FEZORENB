import { NextRequest, NextResponse } from "next/server";
import { payOS, isPayOSConfigured } from "@/lib/payos";

export async function POST(req: NextRequest) {
  try {
    const { items, totalAmountUSD, customerName, customerEmail, customerPhone } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Giỏ hàng đang trống." },
        { status: 400 }
      );
    }

    // Exchange rate USD to VND (approx 25,400 VND/USD for PayOS payment processing)
    const EXCHANGE_RATE = 25400;
    // Calculate total amount in VND, minimum 2000 VND
    const totalAmountVND = Math.max(2000, Math.round((totalAmountUSD || 1000) * EXCHANGE_RATE));

    // PayOS requires orderCode as integer (max safe integer)
    const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));
    const origin = req.nextUrl.origin;

    const paymentData = {
      orderCode,
      amount: Math.min(totalAmountVND, 50000000), // Cap for standard PayOS sandbox test
      description: `ZORENB #${orderCode}`.slice(0, 25),
      items: items.map((item: any) => ({
        name: (item.product?.name || "Đồng hồ ZORENB").slice(0, 50),
        quantity: item.quantity || 1,
        price: Math.min(20000000, Math.round(((item.product?.price || 1000) * EXCHANGE_RATE) / (item.quantity || 1))),
      })),
      returnUrl: `${origin}/checkout/success?orderCode=${orderCode}&amount=${totalAmountVND}`,
      cancelUrl: `${origin}/checkout/cancel?orderCode=${orderCode}`,
    };

    if (isPayOSConfigured) {
      const paymentLink = await payOS.paymentRequests.create(paymentData);
      return NextResponse.json({
        success: true,
        orderCode,
        checkoutUrl: paymentLink.checkoutUrl,
        paymentLinkId: paymentLink.paymentLinkId,
        amountVND: totalAmountVND,
      });
    }

    // Mock PayOS checkout when credentials aren't set yet in .env.local
    const mockCheckoutUrl = `${origin}/checkout/success?orderCode=${orderCode}&amount=${totalAmountVND}&demo=true`;
    return NextResponse.json({
      success: true,
      orderCode,
      checkoutUrl: mockCheckoutUrl,
      amountVND: totalAmountVND,
      notice: "Đang sử dụng chế độ PayOS Test Simulator. Khi bạn cấu hình PAYOS_CLIENT_ID trong .env.local, hệ thống sẽ tự động gọi trực tiếp PayOS Production API.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi kết nối cổng thanh toán PayOS: " + error.message },
      { status: 500 }
    );
  }
}
