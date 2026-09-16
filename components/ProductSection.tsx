"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowRight, Sparkles } from "lucide-react";
import { ALL_WATCHES, Watch } from "@/data/watches";
import { formatPrice } from "@/lib/utils";

// 10 Iconic Watches representing 10 world-class luxury brands
const HOT_DROPS_WATCHES: (Watch & { origin: string })[] = [
  {
    ...ALL_WATCHES.find((w) => w.id === "patek-philippe-nautilus-5711-1r") || ALL_WATCHES[0],
    origin: "Geneva (Thụy Sĩ)",
  },
  {
    ...ALL_WATCHES.find((w) => w.id === "rolex-cosmograph-daytona-126500ln") || ALL_WATCHES[1],
    origin: "Geneva (Thụy Sĩ)",
  },
  {
    ...ALL_WATCHES.find((w) => w.id === "audemars-piguet-royal-oak-jumbo-16202st") || ALL_WATCHES[2],
    origin: "Le Brassus (Thụy Sĩ)",
  },
  {
    ...ALL_WATCHES.find((w) => w.id === "richard-mille-rm-011") || ALL_WATCHES[3],
    origin: "Les Breuleux (Thụy Sĩ)",
  },
  {
    ...ALL_WATCHES.find((w) => w.id === "vacheron-constantin-overseas-4500v") || ALL_WATCHES[4],
    origin: "Geneva (Thụy Sĩ)",
  },
  {
    ...ALL_WATCHES.find((w) => w.id === "a-lange-sohne-lange-1") || ALL_WATCHES[5],
    origin: "Glashütte (Đức)",
  },
  {
    ...ALL_WATCHES.find((w) => w.id === "cartier-santos-wssa0029") || ALL_WATCHES[6],
    origin: "Paris (Pháp)",
  },
  {
    ...ALL_WATCHES.find((w) => w.id === "jaeger-lecoultre-reverso-classic") || ALL_WATCHES[7],
    origin: "Le Sentier (Thụy Sĩ)",
  },
  {
    ...ALL_WATCHES.find((w) => w.id === "omega-speedmaster-moonwatch-professional") || ALL_WATCHES[8],
    origin: "Biel/Bienne (Thụy Sĩ)",
  },
  {
    ...ALL_WATCHES.find((w) => w.id === "iwc-portugieser-chronograph") || ALL_WATCHES[9],
    origin: "Schaffhausen (Thụy Sĩ)",
  },
];


export default function ProductSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const total = HOT_DROPS_WATCHES.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  return (
    <section id="collection" className="py-24 sm:py-32 bg-[#0b0b0c] relative overflow-hidden font-sans">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-r from-amber-500/10 via-[#d4af37]/15 to-amber-600/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header matching Image 4 style */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-gold-400/30 bg-gold-400/10 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold-300 font-semibold">
              Bộ Sưu Tập Huyền Thoại
            </span>
          </div>

          <h2
            className="text-3xl sm:text-5xl font-serif font-bold text-zinc-100 tracking-tight"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Bản Tin Hot Drops • <span className="text-[#d4af37]">10 Thương Hiệu</span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
            Chiêm ngưỡng 10 siêu phẩm đại diện đỉnh cao đến từ 10 thương hiệu hàng đầu thế giới tại FEZORENB.
          </p>
        </div>

        {/* ── 3D Fan / Coverflow Carousel ── */}
        <div className="relative w-full h-[480px] sm:h-[530px] flex items-center justify-center overflow-visible">
          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 z-30 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer"
            aria-label="Previous watch"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 z-30 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer"
            aria-label="Next watch"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Cards Stack */}
          <div className="relative w-[290px] sm:w-[340px] h-[430px] sm:h-[470px] flex items-center justify-center [perspective:1200px]">
            {HOT_DROPS_WATCHES.map((watch, index) => {
              // Calculate circular offset relative to activeIndex
              let offset = index - activeIndex;
              if (offset > total / 2) offset -= total;
              if (offset < -total / 2) offset += total;

              const isCurrent = offset === 0;
              const isVisible = Math.abs(offset) <= 2;

              if (!isVisible) return null;

              // 3D positioning
              const xTranslation = offset * 140; // Horizontal fan spacing
              const yTranslation = Math.abs(offset) * 12; // Slight downward fan arc
              const zIndex = 20 - Math.abs(offset) * 5;
              const rotateY = offset * -16; // 3D Y-axis rotation
              const scale = isCurrent ? 1.04 : 1 - Math.abs(offset) * 0.12;
              const opacity = isCurrent ? 1 : 0.65 - Math.abs(offset) * 0.2;

              return (
                <motion.div
                  key={watch.id}
                  onClick={() => setActiveIndex(index)}
                  animate={{
                    x: xTranslation,
                    y: yTranslation,
                    scale,
                    rotateY,
                    opacity,
                    zIndex,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 24,
                  }}
                  className={`absolute inset-0 rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-shadow select-none ${
                    isCurrent
                      ? "bg-gradient-to-b from-[#18181f] via-[#121217] to-[#0d0d10] border-2 border-[#d4af37] shadow-[0_20px_50px_rgba(212,175,55,0.25)]"
                      : "bg-[#141419]/90 border border-zinc-800/80 shadow-2xl"
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Top Bar: Brand & Origin Tag (Matching Image 4) */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-zinc-100">
                      {watch.brand}
                    </span>
                    <span className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 font-medium whitespace-nowrap">
                      {watch.origin}
                    </span>
                  </div>

                  {/* Center: Watch Photo */}
                  <div className="relative w-full h-[200px] sm:h-[230px] my-auto flex items-center justify-center group">
                    <Image
                      src={watch.images[0]}
                      alt={watch.name}
                      fill
                      sizes="(max-width: 640px) 260px, 320px"
                      className="object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>

                  {/* Bottom Bar: Title, Price & Action Button */}
                  <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
                        {watch.name}
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">
                        Ref. {watch.reference} • {watch.caliber}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm sm:text-base font-extrabold text-[#d4af37] tracking-tight">
                        ${watch.price.toLocaleString()}
                        <span className="text-[10px] text-zinc-400 font-normal ml-1">
                          (~{formatPrice(watch.price * 25400)} ₫)
                        </span>
                      </div>

                      <Link
                        href={`/products/${watch.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-full bg-[#d4af37] hover:bg-[#f7e4a4] text-zinc-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                        title="Xem chi tiết tuyệt tác"
                      >
                        <ArrowUpRight className="w-4 h-4 font-bold" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom CTA: "Xem toàn bộ sản phẩm" Button (Matching Image 4) ── */}
        <div className="mt-8 sm:mt-12 flex justify-center">
          <Link
            href="/products"
            className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs sm:text-sm uppercase tracking-widest hover:scale-105 transition-all duration-300 shadow-xl shadow-gold-400/25 flex items-center gap-2.5"
          >
            <span>Xem Toàn Bộ Sản Phẩm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
