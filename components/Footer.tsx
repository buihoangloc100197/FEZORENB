'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Truck, Headphones, Check } from 'lucide-react';
import ZorenbLogo from './ZorenbLogo';


export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setIsSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="bg-[#070708] border-t border-zinc-900 text-zinc-400 pt-20 pb-12 relative overflow-hidden">
      {/* Top Value Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 border-b border-zinc-800/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <div className="w-12 h-12 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase font-serif tracking-widest text-zinc-200 font-semibold">
                Giao Hàng Chuyên Biệt VIP
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Vận chuyển bọc thép, bảo hiểm 100% toàn cầu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <div className="w-12 h-12 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase font-serif tracking-widest text-zinc-200 font-semibold">
                Xác Thực Độc Bản 100%
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Chứng nhận quốc tế COSC, GIA kèm sổ đăng ký
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <div className="w-12 h-12 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase font-serif tracking-widest text-zinc-200 font-semibold">
                Quản Gia Riêng 24/7
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Tư vấn cá nhân hóa và hỗ trợ đặt hẹn phòng kín
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links & VIP Newsletter Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-5">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <ZorenbLogo
              size={36}
              className="group-hover:drop-shadow-[0_0_10px_rgba(212,175,55,0.7)] transition-all duration-300"
            />
            <span
              className="text-2xl font-bold tracking-[0.3em] uppercase bg-gradient-to-r from-amber-200 via-[#d4af37] to-amber-500 bg-clip-text text-transparent group-hover:brightness-125 transition-all"
              style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
            >
              ZORENB
            </span>
          </Link>

          <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm">
            Biểu tượng của lối sống thượng lưu và kỹ nghệ chế tác vượt qua mọi giới hạn thời gian. Dành riêng cho những tâm hồn trân quý vẻ đẹp độc bản.
          </p>

          {/* Newsletter Box */}
          <div className="pt-2">
            <span className="text-[11px] uppercase tracking-widest text-gold-300 block mb-2 font-medium">
              Nhận Lời Mời Tham Gia Câu Lạc Bộ VIP
            </span>
            <form onSubmit={handleSubmit} className="flex max-w-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email của quý khách..."
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-l-full px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-gold-400/60"
              />
              <button
                type="submit"
                className="bg-gold-400 hover:bg-gold-500 text-zinc-950 px-5 rounded-r-full flex items-center justify-center transition-colors text-xs font-semibold"
                aria-label="Đăng ký nhận tin"
              >
                {isSubscribed ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
            {isSubscribed && (
              <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Quý khách đã gia nhập danh sách khách mời độc quyền.
              </p>
            )}
          </div>
        </div>

        {/* Column: Danh mục */}
        <div className="space-y-4">
          <h4 className="text-xs font-serif uppercase tracking-[0.2em] text-zinc-200 font-semibold">
            Bộ Sưu Tập
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/products" className="hover:text-gold-300 transition-colors">Đồng Hồ Cơ Học</Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-gold-300 transition-colors">Trang Sức Độc Bản</Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-gold-300 transition-colors">Đồ Da Thượng Hạng</Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-gold-300 transition-colors">Haute Couture</Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-gold-300 transition-colors">Kính Mắt Nghệ Thuật</Link>
            </li>
          </ul>
        </div>

        {/* Column: Dịch vụ VIP */}
        <div className="space-y-4">
          <h4 className="text-xs font-serif uppercase tracking-[0.2em] text-zinc-200 font-semibold">
            Đặc Quyền Hội Viên
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/login" className="hover:text-gold-300 transition-colors">Đăng Nhập</Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-gold-300 transition-colors">Đăng Ký Tài Khoản</Link>
            </li>
            <li>
              <Link href="/forgot-password" className="hover:text-gold-300 transition-colors">Khôi Phục Mật Khẩu</Link>
            </li>
            <li>
              <Link href="/#brand-story" className="hover:text-gold-300 transition-colors">Bảo Trì Vĩnh Cửu</Link>
            </li>
            <li>
              <a href="#" className="hover:text-gold-300 transition-colors">Đặt Lịch Thử Sản Phẩm</a>
            </li>
          </ul>
        </div>

        {/* Column: Boutique */}
        <div className="space-y-4">
          <h4 className="text-xs font-serif uppercase tracking-[0.2em] text-zinc-200 font-semibold">
            Boutique Toàn Cầu
          </h4>
          <ul className="space-y-2.5 text-xs text-zinc-400">
            <li>Geneva: Rue du Rhône 42</li>
            <li>Paris: Place Vendôme 18</li>
            <li>Milan: Via Montenapoleone 8</li>
            <li>Tokyo: Ginza 6 Chome</li>
            <li className="pt-2 text-gold-300 font-medium font-mono">Concierge: +41 22 819 0000</li>
          </ul>
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-zinc-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
        <p>© 2026 ZORENB Haute Horlogerie. Bảo lưu mọi quyền độc quyền.</p>
        <div className="flex items-center space-x-6">
          <a href="#" className="hover:text-zinc-300 transition-colors">Chính Sách Bảo Mật</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Điều Khoản Phục Vụ</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Chứng Thư Thẩm Định</a>
        </div>
      </div>
    </footer>
  );
}
