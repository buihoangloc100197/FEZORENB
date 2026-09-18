import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

// Verify admin or staff session
function getAuthorizedRole(req: NextRequest): "admin" | "staff" | null {
  const sessionCookie = req.cookies.get("zorenb_session");
  if (!sessionCookie?.value) return null;
  try {
    const user = JSON.parse(sessionCookie.value);
    if (user.role === "admin" || user.role === "staff") {
      return user.role;
    }
  } catch {
    return null;
  }
  return null;
}

// GET /api/admin/orders — Returns all orders, order items, and revenue analytics
export async function GET(req: NextRequest) {
  try {
    const role = getAuthorizedRole(req);
    if (!role) {
      return NextResponse.json(
        { error: "Truy cập bị từ chối. Chỉ dành cho Quản trị viên và Nhân viên trực quầy." },
        { status: 403 }
      );
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({
        orders: [],
        analytics: {
          totalOrders: 0,
          totalRevenueVND: 0,
          totalRevenueUSD: 0,
          paidOrdersCount: 0,
          pendingOrdersCount: 0,
          cancelledOrdersCount: 0,
          averageOrderValueVND: 0,
        },
      });
    }

    const db = getServiceSupabase();

    // Fetch only successfully paid orders (paid, shipping, completed) — uncompleted/cancelled checkouts are not displayed
    const { data: orders, error } = await db
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price
        )
      `)
      .in("status", ["paid", "shipping", "completed"])
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const EXCHANGE_RATE = 25400;

    // Calculate real revenue statistics from database
    let totalRevenueVND = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    const formattedOrders = (orders || []).map((ord: any) => {
      const amt = Number(ord.total_amount) || 0;
      const isPaid = ord.status === "paid";
      const isPending = ord.status === "pending";
      const isCancelled = ord.status === "cancelled";

      if (isPaid) {
        totalRevenueVND += amt;
        paidCount++;
      } else if (isPending) {
        pendingCount++;
      } else if (isCancelled) {
        cancelledCount++;
      }

      return {
        id: ord.id,
        order_code: ord.payos_order_id || ord.order_code || ord.id.slice(0, 8),
        customer_name: ord.customer_name || "Khách Hàng Quý Tộc",
        customer_email: ord.customer_email || "Chưa cập nhật email",
        customer_phone: ord.customer_phone || "",
        total_amount: amt,
        currency: ord.currency || "VND",
        status: ord.status || "pending",
        created_at: ord.created_at,
        items: (ord.order_items || []).map((it: any) => ({
          id: it.id,
          product_id: it.product_id,
          product_name: it.product_name,
          quantity: it.quantity,
          price: it.unit_price || 0,
        })),
      };
    });

    const totalOrders = formattedOrders.length;
    const totalRevenueUSD = Math.round(totalRevenueVND / EXCHANGE_RATE);
    const averageOrderValueVND = paidCount > 0 ? Math.round(totalRevenueVND / paidCount) : 0;

    return NextResponse.json({
      orders: formattedOrders,
      analytics: {
        totalOrders,
        totalRevenueVND,
        totalRevenueUSD,
        paidOrdersCount: paidCount,
        pendingOrdersCount: pendingCount,
        cancelledOrdersCount: cancelledCount,
        averageOrderValueVND,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/orders — Update order status
export async function PATCH(req: NextRequest) {
  try {
    const role = getAuthorizedRole(req);
    if (!role) {
      return NextResponse.json({ error: "Không có quyền thực hiện." }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.orderId || !body.status) {
      return NextResponse.json({ error: "Thiếu orderId hoặc status." }, { status: 400 });
    }

    const allowedStatuses = ["pending", "paid", "cancelled", "shipping", "completed"];
    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Trạng thái không hợp lệ." }, { status: 400 });
    }

    const db = getServiceSupabase();
    const { data, error } = await db
      .from("orders")
      .update({ status: body.status })
      .eq("id", body.orderId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
