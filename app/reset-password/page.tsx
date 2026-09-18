"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Check, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import ZorenbLogo from "@/components/ZorenbLogo";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token_hash = searchParams.get("token_hash");
  const emailParam = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp với mật khẩu mới.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token_hash,
          email: emailParam,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(data.error || "Không thể cập nhật mật khẩu. Vui lòng thử lại.");
      }
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ. Vui lòng kiểm tra lại mạng.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 bg-[#121216] border border-zinc-800/80 p-8 sm:p-10 rounded-2xl shadow-2xl relative">
      {/* Top Accent Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent rounded-t-2xl" />

      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
          <ZorenbLogo size={32} />
          <span className="font-serif text-xl tracking-[0.25em] uppercase text-zinc-100 font-semibold">
            ZORENB
          </span>
        </Link>

        <h1 className="font-serif text-2xl font-light uppercase tracking-wide text-zinc-100">
          Thiết Lập Mật Khẩu Mới
        </h1>
        <p className="text-xs text-zinc-400 font-light leading-relaxed">
          Khởi tạo mật khẩu bảo mật mới cho tài khoản hội viên{" "}
          {emailParam && <span className="text-[#d4af37] font-mono">{emailParam}</span>}
        </p>
      </div>

      {isSuccess ? (
        <div className="text-center space-y-5 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Check className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-lg uppercase text-zinc-100">
              Đổi Mật Khẩu Thành Công!
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Mật khẩu mới đã được đồng bộ an toàn vào cơ sở dữ liệu ZORENB. Quý khách có thể đăng nhập ngay để tiếp tục sử dụng.
            </p>
          </div>

          <div className="pt-3">
            <Link
              href="/login"
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs uppercase tracking-widest shadow-xl shadow-gold-400/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <span>Đăng Nhập Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-zinc-400 font-medium block">
                Mật Khẩu Mới
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự..."
                  className="w-full bg-[#0b0b0c] border border-zinc-800 rounded-xl px-4 py-3 pl-11 pr-11 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-zinc-400 font-medium block">
                Xác Nhận Mật Khẩu Mới
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  className="w-full bg-[#0b0b0c] border border-zinc-800 rounded-xl px-4 py-3 pl-11 pr-11 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500 bg-zinc-950/60 p-3 rounded-lg border border-zinc-850">
              <ShieldCheck className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
              <span>Mật khẩu được băm và mã hóa bằng thuật toán Bcrypt chuẩn quân sự.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs uppercase tracking-widest shadow-lg shadow-gold-400/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? "Đang Cập Nhật..." : "Xác Nhận Mật Khẩu Mới"}
            </button>
          </form>
        </>
      )}

      <div className="text-center pt-2 border-t border-zinc-900">
        <Link
          href="/login"
          className="text-xs text-zinc-500 hover:text-[#d4af37] transition-colors"
        >
          &larr; Quay lại trang Đăng nhập
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-center justify-center p-6 pt-28 pb-16 font-sans">
      <Suspense
        fallback={
          <div className="text-xs text-zinc-400 font-mono">
            Đang tải dữ liệu bảo mật...
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
