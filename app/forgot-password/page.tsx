"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Check, Shield, Sparkles, AlertCircle, KeyRound, Copy, CheckCircle2 } from "lucide-react";
import ZorenbLogo from "@/components/ZorenbLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [directLink, setDirectLink] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setDirectLink(data.directLink || null);
        setEmailSent(!!data.emailSent);
        setIsSubmitted(true);
      } else {
        setErrorMessage(data.error || "Không thể gửi yêu cầu khôi phục mật khẩu. Vui lòng thử lại.");
      }
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ. Vui lòng kiểm tra lại mạng.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!directLink) return;
    navigator.clipboard.writeText(directLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-center justify-center p-6 pt-28 pb-16 font-sans">
      <div className="w-full max-w-md space-y-7 bg-[#121216] border border-zinc-800/80 p-8 sm:p-10 rounded-2xl shadow-2xl relative">
        {/* Decorative Top Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent rounded-t-2xl" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
            <ZorenbLogo size={32} />
            <span
              className="text-xl font-bold tracking-[0.3em] uppercase bg-gradient-to-r from-amber-200 via-[#d4af37] to-amber-500 bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              ZORENB
            </span>
          </Link>

          <h1 className="font-serif text-2xl font-light uppercase tracking-wide text-zinc-100">
            Khôi Phục Mật Khẩu
          </h1>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            Hệ thống an ninh sẽ khởi tạo đường dẫn mã hóa khôi phục quyền truy cập vào tài khoản của Quý khách.
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-5 py-2">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                <Check className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#121217] border border-[#d4af37]/60 flex items-center justify-center text-[#d4af37]">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-lg uppercase text-zinc-100">
                Đã Khởi Tạo Liên Kết Bảo Mật
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                Hệ thống ZORENB đã tạo liên kết khôi phục cho địa chỉ email:
              </p>
              <div className="inline-block px-3.5 py-1 rounded-full bg-black/60 border border-zinc-800 text-xs font-mono text-emerald-400 mt-1">
                {email}
              </div>
            </div>

            {/* Direct Reset Password Action */}
            {directLink && (
              <div className="pt-2 space-y-3">
                <a
                  href={directLink}
                  className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs uppercase tracking-widest shadow-xl shadow-gold-400/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Đặt Lại Mật Khẩu Ngay Lập Tức</span>
                </a>

                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-2 text-[11px] text-zinc-400 hover:text-white px-3 py-1.5 rounded-full border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Đã sao chép liên kết vào bộ nhớ tạm!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Sao chép liên kết đặt lại mật khẩu</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-zinc-500 font-light leading-relaxed">
                  (Nếu hộp thư Gmail bị trễ hoặc thư rơi vào mục Spam/Quảng cáo, Quý khách có thể bấm trực tiếp nút trên để thiết lập mật khẩu mới ngay)
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setDirectLink(null);
                }}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                &larr; Thử email khác
              </button>

              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-[#d4af37] hover:underline font-semibold"
              >
                <span>Đăng nhập</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
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
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-semibold block">
                  Địa Chỉ Email Đăng Ký Tài Khoản
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full bg-[#0b0b0c] border border-zinc-800 rounded-xl px-4 py-3 pl-11 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-500 bg-zinc-950/60 p-3 rounded-lg border border-zinc-850">
                <Shield className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                <span>Đường dẫn khôi phục mật khẩu được mã hóa an toàn theo tiêu chuẩn SHA-256.</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs tracking-widest uppercase shadow-lg shadow-gold-400/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? "Đang Khởi Tạo Liên Kết..." : "Gửi Liên Kết Khôi Phục"}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại trang Đăng nhập</span>
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
