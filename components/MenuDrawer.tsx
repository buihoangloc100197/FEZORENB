"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ShoppingBag, Shield, User, ArrowRight, Phone, Award, Compass } from "lucide-react";
import ZorenbLogo from "./ZorenbLogo";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const { openCart, totalCount } = useCart();

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navItems = [
    { number: "01", label: "Trang Chủ", href: "/" },
    { number: "02", label: "Bộ Sưu Tập Tuyệt Tác", href: "/products" },
    { number: "03", label: "Kỹ Nghệ Thủ Công", href: "/#brand-story" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Slide-out Menu Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="absolute top-0 left-0 bottom-0 w-full max-w-md bg-[#0e0e12] border-r border-[#d4af37]/30 shadow-2xl flex flex-col justify-between p-6 sm:p-10 z-10 overflow-y-auto"
          >
            {/* Top Bar inside Menu: Logo + Close Button */}
            <div>
              <div className="flex items-center justify-between pb-8 border-b border-zinc-800/80">
                <Link href="/" onClick={onClose} className="flex items-center gap-3">
                  <ZorenbLogo size={36} />
                  <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-[0.3em] uppercase bg-gradient-to-r from-amber-200 via-[#d4af37] to-amber-500 bg-clip-text text-transparent">
                      ZORENB
                    </span>
                    <span className="text-[9px] tracking-[0.35em] uppercase text-zinc-400 font-light">
                      Haute Horlogerie
                    </span>
                  </div>
                </Link>

                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full border border-zinc-700 hover:border-[#d4af37] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer group"
                  aria-label="Đóng menu"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 text-[#d4af37]" />
                </button>
              </div>

              {/* Main Navigation Links */}
              <nav className="py-8 space-y-4">
                <span className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 font-bold block mb-4">
                  Danh Mục Điều Hướng
                </span>

                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href === "/products" && pathname.startsWith("/products"));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30"
                          : "text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-[#d4af37]/70 group-hover:text-[#d4af37]">
                          {item.number}
                        </span>
                        <span className="text-base sm:text-lg font-light tracking-wider uppercase">
                          {item.label}
                        </span>
                      </div>
                      <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isActive ? "text-[#d4af37]" : "text-zinc-600 group-hover:text-zinc-300"}`} />
                    </Link>
                  );
                })}

                {/* Cart Action in Menu */}
                <button
                  onClick={() => {
                    onClose();
                    openCart();
                  }}
                  className="w-full group flex items-center justify-between p-3.5 rounded-2xl text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-[#d4af37]/70">04</span>
                    <span className="text-base sm:text-lg font-light tracking-wider uppercase">
                      Tủ Đồ / Giỏ Hàng
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#d4af37] text-zinc-950 text-xs font-bold font-mono">
                        {totalCount}
                      </span>
                    )}
                    <ShoppingBag className="w-4 h-4 text-zinc-500 group-hover:text-[#d4af37]" />
                  </div>
                </button>

                {/* Account Link in Menu */}
                <Link
                  href={user ? "/profile" : "/login"}
                  onClick={onClose}
                  className="group flex items-center justify-between p-3.5 rounded-2xl text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-[#d4af37]/70">05</span>
                    <span className="text-base sm:text-lg font-light tracking-wider uppercase">
                      {user ? "Hồ Sơ Hội Viên VIP" : "Đăng Nhập / Đăng Ký"}
                    </span>
                  </div>
                  <User className="w-4 h-4 text-zinc-500 group-hover:text-[#d4af37]" />
                </Link>

                {/* Admin Portal Link */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="group flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-[#d4af37]">06</span>
                      <span className="text-sm font-semibold tracking-wider uppercase">
                        Quản Trị Viên & Thu Ngân
                      </span>
                    </div>
                    <Shield className="w-4 h-4 text-[#d4af37]" />
                  </Link>
                )}
              </nav>
            </div>

            {/* Bottom Footer Info in Drawer */}
            <div className="pt-6 border-t border-zinc-800/80 space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#d4af37] uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Dịch Vụ Concierge Thượng Lưu</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                  Đội ngũ chuyên gia thẩm định và tư vấn độc bản trực tuyến 24/7.
                </p>
                <div className="pt-1 flex items-center gap-2 text-xs font-mono text-zinc-300">
                  <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>+84 (0) 909 888 999</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>© 2026 ZORENB</span>
                <span className="text-[#d4af37]/80">Haute Horlogerie</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
