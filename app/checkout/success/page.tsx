"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Mail,
  FileText,
  X,
  Loader2,
  Download,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

interface OrderItemDisplay {
  product_name: string;
  quantity: number;
  price: number;
}

function InvoiceModal({
  isOpen,
  onClose,
  orderCode,
  amount,
  customerName,
  customerEmail,
  items,
  orderDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderCode: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  items: OrderItemDisplay[];
  orderDate: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#101015] border border-zinc-800 rounded-2xl shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-[#0d0d10] border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#d4af37]" />
            <span className="text-sm font-semibold uppercase tracking-widest text-zinc-100">
              Hóa Đơn Online
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-zinc-700 hover:border-zinc-500 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invoice Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Brand Header */}
          <div className="text-center border-b border-zinc-800 pb-6">
            <div className="inline-block bg-[#d4af37] text-zinc-950 text-[10px] font-bold tracking-[0.3em] uppercase px-4 py-1.5 rounded-full mb-4">
              FEZORENB • HAUTE HORLOGERIE
            </div>
            <h2
              className="text-2xl font-light uppercase tracking-widest text-zinc-100"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              Hóa Đơn Bán Hàng
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Invoice / Receipt</p>
          </div>

          {/* Order Meta */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                Mã Đơn Hàng
              </p>
              <p className="text-sm font-bold font-mono text-zinc-100">
                #{orderCode}
              </p>
            </div>
            <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                Ngày Thanh Toán
              </p>
              <p className="text-sm font-medium text-zinc-100">{orderDate}</p>
            </div>
            <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                Khách Hàng
              </p>
              <p className="text-sm font-medium text-zinc-100">{customerName || "Quý Khách"}</p>
            </div>
            <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                Email
              </p>
              <p className="text-xs font-mono text-zinc-300 truncate">
                {customerEmail || "—"}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
              Chi Tiết Sản Phẩm
            </h3>
            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-zinc-900/80">
                  <tr>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium uppercase tracking-wider">
                      Sản Phẩm
                    </th>
                    <th className="text-center px-4 py-3 text-zinc-400 font-medium uppercase tracking-wider">
                      SL
                    </th>
                    <th className="text-right px-4 py-3 text-zinc-400 font-medium uppercase tracking-wider">
                      Thành Tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {items.length > 0 ? (
                    items.map((item, idx) => (
                      <tr key={idx} className="bg-zinc-900/30">
                        <td className="px-4 py-3 text-zinc-200 font-medium">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-3 text-center text-zinc-300">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-[#d4af37] font-mono font-semibold">
                          {formatPrice(item.price)} ₫
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-6 text-center text-zinc-500"
                      >
                        Đơn hàng đã được ghi nhận
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-[#1a1200] to-[#241b00] border border-[#d4af37]/60 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#a37d1d] mb-1">
                Tổng Thanh Toán
              </p>
              <p className="text-2xl font-bold font-mono text-[#d4af37]">
                {formatPrice(amount)} ₫
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                Đã bao gồm phí vận chuyển bảo hiểm toàn cầu
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                Trạng Thái
              </p>
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã Thanh Toán
              </span>
            </div>
          </div>

          {/* Services */}
          <div className="grid grid-cols-3 gap-3 text-center text-[10px] text-zinc-400">
            <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60">
              <ShieldCheck className="w-4 h-4 text-[#d4af37] mx-auto mb-1.5" />
              <span>Thẻ NFC Chứng Thực</span>
            </div>
            <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60">
              <span className="text-base block mb-1">📦</span>
              <span>Giao Bọc Thép</span>
            </div>
            <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60">
              <span className="text-base block mb-1">🔧</span>
              <span>Bảo Hành 5 Năm</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center border-t border-zinc-800 pt-4">
            <p className="text-[11px] text-zinc-500">
              FEZORENB — Haute Horlogerie Boutique
            </p>
            <p className="text-[10px] text-zinc-600 mt-1">
              support@fezorenb.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode =
    searchParams.get("orderCode") ||
    "ZNB-" + Math.floor(Math.random() * 90000 + 10000);
  const amount = Number(searchParams.get("amount") || 0);
  const isDemo = searchParams.get("demo") === "true";
  const customerEmail = decodeURIComponent(searchParams.get("email") || "");
  const customerName = decodeURIComponent(searchParams.get("name") || "Quý Khách");

  const { clearCart, items: cartItems } = useCart();

  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const orderDate = new Date().toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Build order items from cart (captured before clearing)
  const [orderItems, setOrderItems] = useState<OrderItemDisplay[]>([]);

  useEffect(() => {
    // Save items before clearing
    const savedItems: OrderItemDisplay[] = cartItems.map(({ product, quantity }) => ({
      product_name: product.name,
      quantity,
      price: Math.round(product.price * 25400 * quantity),
    }));
    setOrderItems(savedItems);
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-send confirmation email if we have the customer email
  useEffect(() => {
    if (!customerEmail || emailSent || emailSending) return;

    const sendEmail = async () => {
      setEmailSending(true);
      try {
        const res = await fetch("/api/email/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: customerEmail,
            customerName,
            orderCode,
            totalAmount: amount,
            items: orderItems,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setEmailSent(true);
        } else {
          setEmailError(data.error || "Lỗi gửi email");
        }
      } catch {
        setEmailError("Không thể kết nối để gửi email.");
      } finally {
        setEmailSending(false);
      }
    };

    // Slight delay so order items are captured first
    const timer = setTimeout(sendEmail, 1000);
    return () => clearTimeout(timer);
  }, [customerEmail, emailSent, emailSending, orderCode, amount, customerName, orderItems]);

  return (
    <>
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        orderCode={orderCode}
        amount={amount}
        customerName={customerName}
        customerEmail={customerEmail}
        items={orderItems}
        orderDate={orderDate}
      />

      <div className="max-w-md w-full p-8 rounded-2xl bg-[#101015] border border-zinc-800 text-center space-y-6 shadow-2xl">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-semibold">
            Cổng Thanh Toán PayOS Thành Công
          </span>
          <h1
            className="text-2xl font-bold uppercase tracking-wide text-zinc-100"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Thanh Toán Hoàn Tất
          </h1>
          <p className="text-xs text-zinc-400 font-light leading-relaxed font-sans">
            Tuyệt tác của Quý khách đã được bảo chứng và tiếp nhận vào lịch
            trình giao nhận chuyên biệt.
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2.5 text-xs text-left font-mono">
          <div className="flex justify-between text-zinc-400">
            <span>Mã Giao Dịch:</span>
            <span className="text-zinc-100 font-bold">#{orderCode}</span>
          </div>
          {amount > 0 && (
            <div className="flex justify-between text-zinc-400">
              <span>Số Tiền PayOS:</span>
              <span className="text-[#d4af37] font-bold">
                {formatPrice(amount)} ₫
              </span>
            </div>
          )}
          <div className="flex justify-between text-zinc-400">
            <span>Hình Thức:</span>
            <span className="text-emerald-400 font-sans">
              PayOS QR / Banking Bảo Mật
            </span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Trạng Thái:</span>
            <span className="text-emerald-400 font-sans font-semibold">
              Giao Dịch Hợp Lệ
            </span>
          </div>
        </div>

        {/* Email Status */}
        {customerEmail && (
          <div
            className={`flex items-center gap-2 text-xs p-3 rounded-xl border ${
              emailSending
                ? "bg-zinc-900/50 border-zinc-700 text-zinc-400"
                : emailSent
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : emailError
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-zinc-900/50 border-zinc-700 text-zinc-400"
            }`}
          >
            {emailSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                <span>Đang gửi email xác nhận đến {customerEmail}...</span>
              </>
            ) : emailSent ? (
              <>
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>
                  Email xác nhận đã gửi đến{" "}
                  <strong>{customerEmail}</strong>
                </span>
              </>
            ) : emailError ? (
              <>
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>
                  Lưu ý: {emailError} — Hóa đơn vẫn có thể xem trực tiếp
                  dưới đây.
                </span>
              </>
            ) : null}
          </div>
        )}

        {isDemo && (
          <p className="text-[11px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-left font-sans">
            * Lưu ý: Đây là phản hồi mô phỏng giao dịch PayOS. Khi bạn cấu
            hình các khóa API PayOS trong file <code>.env.local</code>, hệ
            thống sẽ thực hiện thanh toán qua QR ngân hàng thật.
          </p>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 font-sans">
          <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
          <span>Vận chuyển bọc thép bảo hiểm 100% toàn cầu</span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2.5 font-sans">
          {/* View Invoice Button */}
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-gold-400/20 hover:scale-[1.01] transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Xem Hóa Đơn Online</span>
            <Download className="w-4 h-4" />
          </button>

          <Link
            href="/profile"
            className="w-full py-3 px-6 rounded-full border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <span>Xem Đơn Hàng Tại Hồ Sơ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/"
            className="w-full py-2.5 rounded-full border border-zinc-800 text-zinc-400 hover:text-white text-xs uppercase tracking-wider transition-colors"
          >
            Về Trang Chủ
          </Link>
        </div>
      </div>
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-center justify-center p-6 font-sans pt-24">
      <Suspense
        fallback={
          <div className="text-xs text-zinc-400 font-mono flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang nạp dữ liệu giao dịch PayOS...
          </div>
        }
      >
        <CheckoutSuccessContent />
      </Suspense>
    </div>
  );
}
