"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ZorenbLogo from "./ZorenbLogo";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalCount, openCart } = useCart();
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 font-sans ${
          isScrolled
            ? "py-3 bg-[#0b0b0c]/90 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl shadow-black/60"
            : "py-5 bg-gradient-to-b from-black/85 via-black/50 to-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* ── Left Side: Brand Identity ── */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Brand Logo & Name 'ZORENB' */}
            <Link
              href="/"
              className="group flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]"
            >
              <ZorenbLogo size={40} className="drop-shadow-[0_0_8px_rgba(212,175,55,0.5)] group-hover:drop-shadow-[0_0_14px_rgba(212,175,55,0.8)] transition-all duration-300" />
              <div className="flex flex-col">
                <span
                  className="text-xl sm:text-2xl font-bold tracking-[0.3em] uppercase bg-gradient-to-r from-amber-200 via-[#d4af37] to-amber-500 bg-clip-text text-transparent group-hover:brightness-125 transition-all"
                  style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
                >
                  ZORENB
                </span>
                <span className="text-[8px] tracking-[0.4em] uppercase text-zinc-400 font-light -mt-1 group-hover:text-amber-200 transition-colors">
                  Haute Horlogerie
                </span>
              </div>
            </Link>
          </div>

          {/* ── Center Navigation Links ── */}
          <nav className="hidden md:flex items-center space-x-10 text-xs uppercase tracking-[0.25em] text-zinc-300 font-medium">
            <Link
              href="/products"
              className={`hover:text-[#d4af37] transition-colors py-1 relative ${
                pathname === "/products" ? "text-[#d4af37] font-semibold" : ""
              }`}
            >
              Bộ Sưu Tập
              {pathname === "/products" && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#d4af37]" />
              )}
            </Link>

            <Link
              href="/#brand-story"
              className="hover:text-[#d4af37] transition-colors py-1"
            >
              Kỹ Nghệ Thủ Công
            </Link>
          </nav>

          {/* ── Right Action Controls ── */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Admin Badge link if admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="px-2.5 py-1 rounded-full bg-gold-400/20 text-[#d4af37] border border-[#d4af37]/40 text-[10px] font-bold uppercase tracking-wider hidden sm:flex items-center gap-1 hover:bg-[#d4af37] hover:text-zinc-950 transition-all"
              >
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </Link>
            )}

            {/* Cart Icon with Live Badge */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full text-zinc-200 hover:text-[#d4af37] hover:bg-white/5 transition-all group"
              aria-label="Xem tủ đồ"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-[#d4af37] text-zinc-950 text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
                  {totalCount}
                </span>
              )}
            </button>

            {/* User Profile or Login Button */}
            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-[#d4af37]/50 text-xs text-zinc-200 hover:text-white transition-all group"
              >
                <div className="w-6 h-6 rounded-full bg-gold-400/20 text-[#d4af37] border border-[#d4af37]/40 flex items-center justify-center font-bold text-[10px]">
                  {user.fullName?.charAt(0) || "U"}
                </div>
                <span className="max-w-[80px] sm:max-w-[120px] truncate font-medium text-zinc-300">
                  {user.fullName || "Tài Khoản"}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-full font-medium text-xs tracking-widest uppercase transition-all duration-300 group"
              >
                <span className="w-full h-full bg-gradient-to-br from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] group-hover:from-[#f7e4a4] group-hover:to-[#d4af37] absolute" />
                <span className="relative px-4 sm:px-5 py-2 transition-all ease-out bg-[#0b0b0c] rounded-full group-hover:bg-opacity-0 text-zinc-100 group-hover:text-zinc-950 font-semibold">
                  Đăng Nhập
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
