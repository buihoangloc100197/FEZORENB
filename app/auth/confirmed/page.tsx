"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Home, LogIn, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import ZorenbLogo from "@/components/ZorenbLogo";
import { supabase } from "@/lib/supabase";

function ConfirmedContent() {
  const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check if user session exists or extract from hash/params
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });

    // Also check url query params
    const emailParam = searchParams.get("email");
    if (emailParam) setUserEmail(emailParam);
  }, [searchParams]);

  return (
    <div className="w-full max-w-lg p-8 sm:p-12 rounded-3xl bg-[#101015] border border-gold-400/30 text-center space-y-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#d4af37]/15 blur-[90px] pointer-events-none" />

      {/* Top Header Navigation buttons */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 font-sans">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4 text-[#d4af37]" />
          <span>Về Trang Chủ</span>
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-gold-400/40 text-[#d4af37] hover:bg-gold-400/10 transition-all"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Đăng Nhập</span>
        </Link>
      </div>

      {/* Center Logo & Icon */}
      <div className="space-y-4">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#121217] border border-[#d4af37]/60 flex items-center justify-center text-[#d4af37]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#d4af37] font-semibold">
            Bảo Chứng Điện Tử Haute Horlogerie
          </span>
          <h1
            className="text-2xl sm:text-3xl font-light uppercase tracking-wide text-zinc-100 mt-2"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Chúc Mừng Bạn Đã Xác Thực Địa Chỉ Email Thành Công!
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed font-sans max-w-md mx-auto">
          Tài khoản thành viên chính chủ của Quý khách tại{" "}
          <strong className="text-zinc-200 font-medium">FEZORENB</strong> đã được kích hoạt hoàn
          tất. Quý khách hiện có thể đăng nhập ngay để tận hưởng toàn bộ quyền lợi VIP, quản lý tủ đồ
          và mua sắm tuyệt tác.
        </p>

        {userEmail && (
          <div className="inline-block px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-400">
            ✓ {userEmail}
          </div>
        )}
      </div>

      {/* Trust guarantees */}
      <div className="grid grid-cols-2 gap-3 text-left p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-[11px] text-zinc-400 font-sans">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
          <span>Tài khoản chính chủ bảo mật</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
          <span>Đặc quyền xem BST độc bản</span>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="space-y-3 pt-2 font-sans">
        <Link
          href="/login"
          className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl shadow-gold-400/20 hover:scale-[1.01] transition-all"
        >
          <LogIn className="w-4 h-4" />
          <span>Đăng Nhập Ngay Vào Tài Khoản</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/"
          className="w-full py-3 rounded-full border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors font-medium"
        >
          <Home className="w-4 h-4" />
          <span>Khám Phá Trang Chủ FEZORENB</span>
        </Link>
      </div>

      {/* Footer Branding */}
      <div className="pt-4 border-t border-zinc-900 flex items-center justify-center gap-2">
        <ZorenbLogo size={18} />
        <span className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 font-serif">
          FEZORENB Haute Horlogerie
        </span>
      </div>
    </div>
  );
}

export default function EmailConfirmedPage() {
  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-center justify-center p-4 sm:p-6 font-sans pt-24 pb-16">
      <Suspense
        fallback={
          <div className="text-xs text-zinc-400 font-mono">
            Đang xác nhận liên kết xác thực email...
          </div>
        }
      >
        <ConfirmedContent />
      </Suspense>
    </div>
  );
}
