"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User, Phone, Check, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";
import ZorenbLogo from "@/components/ZorenbLogo";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [directLink, setDirectLink] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { register } = useAuth();
  const router = useRouter();

  const handleResend = async () => {
    if (!registeredEmail) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.directLink) setDirectLink(data.directLink);
        setResendStatus(data.message || "Đã gửi lại email xác thực thành công.");
      } else {
        setResendStatus(data.error || "Gửi lại email thất bại.");
      }
    } catch {
      setResendStatus("Lỗi kết nối máy chủ khi gửi lại.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    if (result.success) {
      setRegisteredEmail(formData.email);
      setDirectLink(result.directLink || null);
      setVerificationSent(!!result.verificationSent);
      setSuccessInfo(
        result.message ||
        `Chúng tôi đã khởi tạo tài khoản cho ${formData.email}. Quý khách vui lòng kiểm tra hộp thư (inbox/spam) hoặc bấm nút kích hoạt trực tiếp bên dưới.`
      );
    } else {
      setErrorMessage(result.error || "Đăng ký không thành công.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-stretch font-sans">
      {/* ── Left Column: Video and Brand ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-black flex-col justify-between p-12">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[0.45] contrast-[1.1]"
        >
          <source
            src="https://videos.pexels.com/video-files/5532765/5532765-hd_1920_1080_30fps.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <ZorenbLogo size={36} />
            <span
              className="text-xl font-bold tracking-[0.3em] uppercase bg-gradient-to-r from-amber-200 via-[#d4af37] to-amber-500 bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              ZORENB
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-4 max-w-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-400/40 bg-black/60 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold-300 font-medium">
              Đặc Quyền Thành Viên
            </span>
          </div>

          <h2
            className="text-2xl font-light uppercase text-zinc-100 leading-snug"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Đặc Quyền Hội Viên <br />
            <span className="italic text-[#d4af37]">Độc Quyền Toàn Cầu</span>
          </h2>

          <ul className="space-y-2 text-xs text-zinc-300 font-light">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Lưu vĩnh viễn danh mục yêu thích và giỏ hàng cá nhân</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Theo dõi lịch sử đơn hàng và chứng thư bảo hành điện tử</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Quản lý hồ sơ cá nhân và avatar riêng tư</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-[11px] text-zinc-500 font-mono">
          © 2026 ZORENB Haute Horlogerie
        </div>
      </div>

      {/* ── Right Column: Register Form ── */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-16 pt-28 lg:pt-16">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center sm:text-left space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-2 lg:hidden">
              <ZorenbLogo size={32} />
              <span
                className="text-xl font-bold tracking-[0.3em] uppercase bg-gradient-to-r from-amber-200 via-[#d4af37] to-amber-500 bg-clip-text text-transparent"
                style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
              >
                ZORENB
              </span>
            </Link>

            <h1
              className="text-2xl sm:text-3xl font-light uppercase tracking-wide text-zinc-100"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              Đăng Ký Tài Khoản
            </h1>
            <p className="text-xs text-zinc-400 font-light">
              Khởi tạo danh tính hội viên để lưu giữ tủ đồ và lịch sử mua sắm độc bản.
            </p>
          </div>

          {successInfo ? (
            <div className="p-6 bg-zinc-900/60 border border-gold-400/30 rounded-3xl text-center space-y-5 shadow-2xl backdrop-blur-md">
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <Mail className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#121217] border border-[#d4af37]/60 flex items-center justify-center text-[#d4af37]">
                  <Sparkles className="w-3 h-3" />
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-semibold">
                  Bảo Chứng Điện Tử ZORENB
                </span>
                <h3 className="text-xl font-light uppercase tracking-wider text-zinc-100 mt-1 font-serif">
                  Xác Thực Tài Khoản Thành Viên
                </h3>
              </div>

              <div className="text-xs text-zinc-300 leading-relaxed font-light space-y-2">
                <p>{successInfo}</p>
                {registeredEmail && (
                  <div className="inline-block px-3.5 py-1 rounded-full bg-black/60 border border-zinc-800 text-[11px] font-mono text-emerald-400">
                    {registeredEmail}
                  </div>
                )}
              </div>

              {/* Direct Activation Button */}
              {directLink && (
                <div className="pt-2 space-y-2">
                  <a
                    href={directLink}
                    className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-gold-400/25 hover:scale-[1.01] transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Kích Hoạt Tài Khoản Ngay Lập Tức</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <p className="text-[11px] text-zinc-400 font-light">
                    (Bấm nút trên để kích hoạt tài khoản và lưu trực tiếp vào cơ sở dữ liệu ZORENB)
                  </p>
                </div>
              )}

              {/* Resend status message */}
              {resendStatus && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-amber-300">
                  {resendStatus}
                </div>
              )}

              {/* Secondary actions: Resend or Login */}
              <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-300 hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                  <span>{isResending ? "Đang gửi lại..." : "Gửi lại email xác thực"}</span>
                </button>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-gold-400/40 text-gold-300 hover:bg-gold-400/10 text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  <span>Đến Trang Đăng Nhập</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-zinc-400 font-semibold block">
                Họ và Tên
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full bg-[#121216] border border-zinc-800 rounded-xl px-4 py-3 pl-11 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                />
                <User className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-zinc-400 font-semibold block">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@domain.com"
                  required
                  className="w-full bg-[#121216] border border-zinc-800 rounded-xl px-4 py-3 pl-11 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-zinc-400 font-semibold block">
                Số Điện Thoại
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+84 909 000 000"
                  className="w-full bg-[#121216] border border-zinc-800 rounded-xl px-4 py-3 pl-11 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                />
                <Phone className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-zinc-400 font-semibold block">
                Mật Khẩu (Bảo Mật Bcrypt)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Ít nhất 6 ký tự..."
                  required
                  minLength={6}
                  className="w-full bg-[#121216] border border-zinc-800 rounded-xl px-4 py-3 pl-11 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs tracking-widest uppercase shadow-lg shadow-[#d4af37]/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Đang Khởi Tạo...</span>
              ) : (
                <>
                  <span>Đăng Ký Tài Khoản</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          </>
          )}

          <div className="text-center pt-3 border-t border-zinc-900">
            <p className="text-xs text-zinc-400">
              Đã có tài khoản định danh?{" "}
              <Link href="/login" className="text-[#d4af37] hover:underline font-semibold">
                Đăng nhập ngay &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
