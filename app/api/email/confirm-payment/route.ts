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
