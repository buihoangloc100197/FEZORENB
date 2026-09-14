"use client";

import React from "react";
import Link from "next/link";
import { XCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import ZorenbLogo from "@/components/ZorenbLogo";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-center justify-center p-6 font-sans pt-24">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#101015] border border-zinc-800 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-semibold">
            Cổng Thanh Toán PayOS
          </span>
          <h1
            className="text-2xl font-bold uppercase tracking-wide text-zinc-100"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Giao Dịch Đã Tạm Hủy
          </h1>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            Quý khách đã hủy phiên thanh toán. Các sản phẩm trong tủ đồ của Quý khách vẫn được bảo lưu nguyên vẹn.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5 font-sans">
          <Link
            href="/"
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-gold-400/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Quay Lại Tủ Đồ &amp; Mua Hàng</span>
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 rounded-full border border-zinc-800 text-zinc-400 hover:text-white text-xs uppercase tracking-wider transition-colors"
          >
            Về Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
