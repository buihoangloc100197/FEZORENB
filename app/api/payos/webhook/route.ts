import { NextRequest, NextResponse } from "next/server";
import { payOS, isPayOSConfigured } from "@/lib/payos";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (isPayOSConfigured) {
      const webhookData = await payOS.webhooks.verify(body);
      // Process order status update
      return NextResponse.json({ success: true, data: webhookData });
    }

    return NextResponse.json({ success: true, received: body });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi xác thực webhook PayOS: " + error.message },
      { status: 400 }
    );
  }
}
