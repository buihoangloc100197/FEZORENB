"use client";

import React, { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Watch as WatchIcon, Menu, ArrowDown, Check, Sparkles } from "lucide-react";
import { ALL_WATCHES, WATCH_BRANDS, WATCH_COMPLICATIONS } from "@/data/watches";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import ThreeScrollPortal from "./ThreeScrollPortal";
import BrandSidebar from "./BrandSidebar";

export default function ProductSection() {
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedComplication, setSelectedComplication] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Filter products by Brand and Complication
  let filteredWatches = ALL_WATCHES;

  if (selectedBrand !== "all") {
    const brandObj = WATCH_BRANDS.find((b) => b.id === selectedBrand);
    if (brandObj) {
      filteredWatches = filteredWatches.filter((w) => w.brand.toLowerCase() === brandObj.name.toLowerCase());
    }
  }

  if (selectedComplication !== "all") {
    const compObj = WATCH_COMPLICATIONS.find((c) => c.id === selectedComplication);
    if (compObj && compObj.value !== "all") {
      filteredWatches = filteredWatches.filter((w) =>
        w.complications.includes(compObj.value as any)
      );
    }
  }

  const displayedWatches = filteredWatches.slice(0, visibleCount);
  const hasMore = visibleCount < filteredWatches.length;

  const handleBrandChange = (brandId: string) => {
    if (brandId === selectedBrand) return;
    setIsLoading(true);
    startTransition(() => {
      setSelectedBrand(brandId);
      setVisibleCount(8);
      setTimeout(() => {
        setIsLoading(false);
      }, 350);
    });
  };

  const handleComplicationChange = (compId: string) => {
    if (compId === selectedComplication) return;
    setIsLoading(true);
    startTransition(() => {
      setSelectedComplication(compId);
      setVisibleCount(8);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    });
  };

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 4);
      setIsLoading(false);
    }, 400);
  };

  return (
    <section id="collection" className="py-20 sm:py-28 bg-[#0b0b0c] relative overflow-hidden font-sans">
      {/* 3D Three.js Expanding Tunnel / Scroll Portal */}
      <ThreeScrollPortal />

      {/* Decorative Subtle Gold Glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gold-400/5 blur-[140px] pointer-events-none" />

      {/* ── Floating Left Menu Button (Con cái Menu sẽ nằm ở bên trái) ── */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-30 hidden lg:block">
        <button
          onClick={() => setIsLeftMenuOpen(true)}
          className="group flex flex-col items-center gap-2 py-4 px-2.5 rounded-2xl bg-[#121217]/90 hover:bg-[#1a1a22] border border-[#2a2a36] hover:border-[#d4af37]/60 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105"
          aria-label="Mở Menu Danh Sách Các Hãng Đồng Hồ"
        >
          <div className="w-8 h-8 rounded-full bg-gold-400/15 border border-gold-400/30 flex items-center justify-center text-[#d4af37]">
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37] [writing-mode:vertical-lr] rotate-180">
            HÃNG ĐỒNG HỒ
          </span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-gold-400/30 bg-[#121215] mb-4">
            <WatchIcon className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold-300 font-medium">
              Bảo Tàng Đồng Hồ Haute Horlogerie
            </span>
          </div>

          <h2
            className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[0.06em] text-zinc-100 uppercase"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Kiệt Tác Đồng Hồ <span className="italic text-[#d4af37]">Độc Bản Thụy Sĩ</span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-zinc-400 font-light max-w-2xl leading-relaxed font-sans">
            Tuyển tập 10 biểu tượng cơ học huyền thoại thế giới với độ hoàn thiện thủ công đỉnh cao.
          </p>

          {/* ── Brand Pills Row (Exact Design like Photo 2) ── */}
          <div className="mt-8 flex items-center justify-center flex-wrap gap-2 sm:gap-2.5 max-w-5xl">
            {/* Quick Button to open Left Brand Sidebar on mobile/desktop */}
            <button
              onClick={() => setIsLeftMenuOpen(true)}
              className="px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#181820] border border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37] hover:text-zinc-950 flex items-center gap-1.5 transition-all shadow-md"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Menu Hãng</span>
            </button>

            {WATCH_BRANDS.map((brand) => {
              const isActive = selectedBrand === brand.id;
              return (
                <button
                  key={brand.id}
                  onClick={() => handleBrandChange(brand.id)}
                  className={`px-4 sm:px-4.5 py-2 rounded-full text-xs tracking-wider uppercase font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 shadow-lg shadow-gold-400/20 scale-105"
                      : "bg-[#141418] border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700"
                  }`}
                >
                  <span>{brand.label}</span>
                  <span className={`text-[10px] font-mono ${isActive ? "text-zinc-950 font-bold" : "text-zinc-500"}`}>
                    ({brand.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Secondary Filter: Complications (Exact Format from Photo 2) ── */}
          <div className="mt-5 flex items-center justify-center flex-wrap gap-2 pt-4 border-t border-zinc-900/80">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4af37]" /> CỖ MÁY:
            </span>
            {WATCH_COMPLICATIONS.map((comp) => {
              const isCompActive = selectedComplication === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => handleComplicationChange(comp.id)}
                  className={`px-3 py-1 rounded-lg text-xs tracking-wide transition-all ${
                    isCompActive
                      ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/50 font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70 border border-transparent"
                  }`}
                >
                  {comp.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Watches Grid Area (Photo 2 Layout) ── */}
        {isLoading ? (
          <ProductSkeleton count={4} theme="dark" />
        ) : displayedWatches.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800/60 p-8">
            <p className="text-base text-zinc-300 font-serif">
              Chưa có phiên bản đồng hồ nào phù hợp với bộ lọc đã chọn.
            </p>
            <button
              onClick={() => {
                setSelectedBrand("all");
                setSelectedComplication("all");
              }}
              className="mt-4 text-xs uppercase tracking-widest px-6 py-2.5 rounded-full border border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors font-semibold"
            >
              Hiển thị toàn bộ tuyệt tác
            </button>
          </div>
        ) : (
          <motion.div
            key={selectedBrand + selectedComplication + visibleCount}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7"
          >
            {displayedWatches.map((watch) => (
              <motion.div
                key={watch.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.88, y: 40, filter: "blur(6px)" },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              >
                <ProductCard product={watch} theme="dark" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Infinite Scroll / Load More Action */}
        {hasMore && (
          <div className="mt-14 sm:mt-18 flex flex-col items-center justify-center space-y-3">
            <p className="text-xs text-zinc-500 tracking-wider font-mono">
              Hiển thị {displayedWatches.length} / {filteredWatches.length} tuyệt tác đồng hồ
            </p>
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="group px-8 py-3.5 rounded-full border border-zinc-700 hover:border-[#d4af37] bg-zinc-900/80 hover:bg-[#d4af37]/10 text-xs uppercase tracking-[0.2em] font-semibold text-zinc-200 hover:text-[#d4af37] transition-all flex items-center gap-2"
            >
              <span>Xem Thêm Đồng Hồ</span>
              <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* ── Brand Sidebar Drawer (Con cái Menu sẽ nằm ở bên trái) ── */}
      <BrandSidebar
        isOpen={isLeftMenuOpen}
        onClose={() => setIsLeftMenuOpen(false)}
        onSelectBrand={(brandId) => {
          handleBrandChange(brandId);
          setIsLeftMenuOpen(false);
          const el = document.getElementById("collection");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </section>
  );
}
