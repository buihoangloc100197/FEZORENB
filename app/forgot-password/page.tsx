'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Mail, Check, Shield } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-center justify-center p-6 pt-28">
      <div className="w-full max-w-md space-y-8 bg-[#121216] border border-zinc-800/80 p-8 sm:p-10 rounded-2xl shadow-2xl relative">
        {/* Decorative Top Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent rounded-t-2xl" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="font-serif text-xl tracking-[0.25em] uppercase text-zinc-100 font-semibold">
              FEZORENB
            </span>
          </Link>

          <h1 className="font-serif text-2xl font-light uppercase tracking-wide text-zinc-100">
            Khôi Phục Mật Khẩu
          </h1>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            Hệ thống an ninh sẽ gửi đường dẫn mã hóa khôi phục quyền truy cập vào hòm thư bảo mật của quý khách.
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-base uppercase text-zinc-200">
              Đã Gửi Liên Kết Bảo Mật
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Vui lòng kiểm tra hộp thư <span className="text-gold-300 font-mono">{email}</span> và làm theo chỉ dẫn trong vòng 15 phút.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold-400 hover:text-gold-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại Đăng nhập</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-zinc-400 font-medium block">
                Địa Chỉ Email Đăng Ký VIP
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vip.client@fezorenb.com"
                  className="w-full bg-[#0b0b0c] border border-zinc-800 rounded-xl px-4 py-3 pl-11 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-gold-400 transition-colors"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500 bg-zinc-950/60 p-3 rounded-lg border border-zinc-850">
              <Shield className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <span>Dữ liệu khôi phục được bảo vệ bởi tiêu chuẩn mã hóa SHA-256.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-gold-400 via-[#f3e3a3] to-gold-500 text-zinc-950 font-semibold text-xs tracking-widest uppercase shadow-lg shadow-gold-400/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? 'Đang Xử Lý Gửi Mã...' : 'Gửi Liên Kết Khôi Phục'}
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
        )}
      </div>
    </div>
  );
}
