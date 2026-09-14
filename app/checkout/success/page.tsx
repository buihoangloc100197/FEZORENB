"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode") || "ZNB-" + Math.floor(Math.random() * 90000 + 10000);
  const amount = searchParams.get("amount");
  const isDemo = searchParams.get("demo") === "true";
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="max-w-md w-full p-8 rounded-2xl bg-[#101015] border border-zinc-800 text-center space-y-6 shadow-2xl">
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
          Tuyệt tác của Quý khách đã được bảo chứng và tiếp nhận vào lịch trình giao nhận chuyên biệt.
        </p>
      </div>

      {/* Transaction Summary Card */}
      <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2.5 text-xs text-left font-mono">
        <div className="flex justify-between text-zinc-400">
          <span>Mã Giao Dịch:</span>
          <span className="text-zinc-100 font-bold">#{orderCode}</span>
        </div>
        {amount && (
          <div className="flex justify-between text-zinc-400">
            <span>Số Tiền PayOS:</span>
            <span className="text-[#d4af37] font-bold">
              {formatPrice(Number(amount))} ₫
            </span>
          </div>
        )}
        <div className="flex justify-between text-zinc-400">
          <span>Hình Thức:</span>
          <span className="text-emerald-400 font-sans">PayOS QR / Banking Bảo Mật</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Trạng Thái:</span>
          <span className="text-emerald-400 font-sans font-semibold">Giao Dịch Hợp Lệ</span>
        </div>
      </div>

      {isDemo && (
        <p className="text-[11px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-left font-sans">
          * Lưu ý: Đây là phản hồi mô phỏng giao dịch PayOS. Khi bạn cấu hình các khóa API PayOS trong file <code>.env.local</code>, hệ thống sẽ thực hiện thanh toán qua QR ngân hàng thật.
        </p>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 font-sans">
        <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
        <span>Vận chuyển bọc thép bảo hiểm 100% toàn cầu</span>
      </div>

      <div className="pt-2 flex flex-col gap-2.5 font-sans">
        <Link
          href="/profile"
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-gold-400/20"
        >
          <span>Xem Đơn Hàng Tại Hồ Sơ Cá Nhân</span>
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
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-center justify-center p-6 font-sans pt-24">
      <Suspense fallback={<div className="text-xs text-zinc-400 font-mono">Đang nạp dữ liệu giao dịch PayOS...</div>}>
        <CheckoutSuccessContent />
      </Suspense>
    </div>
  );
}
