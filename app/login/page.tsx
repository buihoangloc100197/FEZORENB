"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import ZorenbLogo from "@/components/ZorenbLogo";
import { useAuth } from "@/context/AuthContext";

function LoginFormContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedMessage, setConfirmedMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("confirmed") === "true") {
      setConfirmedMessage("Chúc mừng bạn đã xác thực địa chỉ Email thành công! Vui lòng đăng nhập.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await login(email, password);

    if (result.success) {
      router.push("/");
    } else {
      setErrorMessage(result.error || "Đăng nhập không thành công.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-stretch font-sans">
      {/* ── Left Column: Luxury Watch Video ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[0.55] contrast-[1.1]"
          poster="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1400&q=85"
        >
          <source
            src="https://videos.pexels.com/video-files/3196394/3196394-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />

        <div className="relative z-10 flex flex-col justify-end p-12 pb-16 space-y-3">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37] font-semibold font-sans">
            Haute Horlogerie · ZORENB
          </p>
          <h2
            className="text-3xl font-light tracking-wide uppercase text-zinc-100 leading-snug"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Mỗi giây trôi qua<br />
            <span className="italic text-[#d4af37]">là một kiệt tác</span>
          </h2>
          <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm font-sans">
            Đăng nhập để xem lịch sử mua hàng, quản lý tủ đồ cá nhân và nhận đặc quyền độc bản.
          </p>
        </div>
      </div>

      {/* ── Right Column: Login Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 pt-28 lg:pt-16">
        <div className="w-full max-w-md space-y-7">
          {/* Header */}
          <div className="text-center sm:text-left space-y-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-3 group">
              <ZorenbLogo size={36} className="group-hover:drop-shadow-[0_0_10px_rgba(212,175,55,0.7)] transition-all" />
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
              Đăng Nhập
            </h1>
            <p className="text-xs text-zinc-400 font-light font-sans">
              Nhập thư điện tử và mật khẩu đã mã hóa của Quý khách.
            </p>
          </div>

          {confirmedMessage && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{confirmedMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-zinc-400 font-semibold block">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@zorenb.com"
                  required
                  className="w-full bg-[#121216] border border-zinc-800 rounded-xl px-4 py-3 pl-11 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                  Mật Khẩu
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-[#d4af37]/80 hover:text-[#d4af37] transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#121216] border border-zinc-800 rounded-xl px-4 py-3 pl-11 pr-11 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-500 hover:text-zinc-300 absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f3e3a3] to-[#c59b27] text-zinc-950 font-bold text-xs tracking-widest uppercase shadow-lg shadow-[#d4af37]/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Đang Xác Thực...</span>
              ) : (
                <>
                  <span>Xác Nhận Đăng Nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="text-center pt-3 border-t border-zinc-900 font-sans">
            <p className="text-xs text-zinc-400">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-[#d4af37] hover:underline font-semibold">
                Đăng ký tài khoản mới &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070708]" />}>
      <LoginFormContent />
    </Suspense>
  );
}

