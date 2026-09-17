"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart, Star, Check, Watch as WatchIcon } from "lucide-react";
import { Watch } from "@/data/watches/types";
import { useCart } from "@/context/CartContext";
import { formatPrice, formatVND } from "@/lib/utils";

interface ProductCardProps {
  product: Watch;
  theme?: "dark" | "light";
}

export default function ProductCard({ product, theme = "dark" }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-2xl overflow-hidden border border-[#22222a] bg-[#121216] hover:border-[#d4af37]/40 hover:shadow-2xl hover:shadow-[#d4af37]/5 transition-all duration-500 flex flex-col justify-between font-sans"
    >
      {/* ── Top Image Container (Clean luxury aspect ratio like photo 2) ── */}
      <div className="relative w-full aspect-[4/4.5] overflow-hidden bg-[#0c0c0f]">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          {/* Primary Image */}
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
            className={`object-cover transition-all duration-700 ease-out ${
              isHovered && product.images[1] ? "opacity-0 scale-105" : "opacity-100 scale-100"
            }`}
          />

          {/* Secondary Hover Angle Image */}
          {product.images[1] && (
            <Image
              src={product.images[1]}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
              className={`object-cover transition-all duration-700 ease-out ${
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
              }`}
            />
          )}
        </Link>

        {/* Top Badges: Brand & Case Size on the Left, Wishlist on the Right (Like photo 2) */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest uppercase bg-black/85 backdrop-blur-md text-[#d4af37] border border-[#d4af37]/40">
              {product.brand}
            </span>
            {product.caseSize && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wide bg-zinc-900/90 text-zinc-300 border border-zinc-700/80">
                {product.caseSize}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
              isLiked
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/50"
                : "bg-black/50 text-zinc-300 hover:text-white border border-white/15 hover:border-white/40"
            }`}
            aria-label="Thêm vào danh sách yêu thích"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Quick Add To Cart Button (Prominent pill on image as in photo 2) */}
        <div className="absolute bottom-3 inset-x-3 z-10">
          <button
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-3 rounded-xl text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl backdrop-blur-md transition-all duration-300 ${
              isAdded
                ? "bg-emerald-500 text-zinc-950 font-bold"
                : "bg-zinc-900/85 hover:bg-[#d4af37] text-zinc-200 hover:text-zinc-950 border border-zinc-700/70 hover:border-[#d4af37]"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã Thêm Vào Tủ Đồ</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Thêm Vào Giỏ Hàng</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Card Details Area (Exact Layout from Photo 2) ── */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Row 1: Reference ID in Gold + Star Rating (Photo 2) */}
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#d4af37] font-semibold tracking-wider">
              {product.reference}
            </span>
            <div className="flex items-center gap-1 text-[#d4af37]">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-zinc-300 font-bold text-[10px]">{product.rating}</span>
            </div>
          </div>

          {/* Row 2: Product Name in Bold Uppercase */}
          <Link href={`/products/${product.id}`} className="block group/link mt-1.5">
            <h3 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-zinc-100 group-hover/link:text-[#d4af37] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Row 3: Subtitle / Material / Reference */}
          <p className="text-[11px] text-zinc-400 tracking-normal line-clamp-1 mt-1 font-light">
            {product.subtitle || `Ref. ${product.reference} • ${product.brand}`}
          </p>

          {/* Row 4: Caliber / Movement with Watch Gear Icon */}
          {product.caliber && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
              <WatchIcon className="w-3 h-3 text-[#d4af37]/80 flex-shrink-0" />
              <span className="truncate">{product.caliber}</span>
            </div>
          )}
        </div>

        {/* Row 5: Price in VND + Original Price + "CHI TIẾT →" */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold font-mono tracking-tight text-[#d4af37]">
              {formatVND(product.price, product.currency)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] font-mono text-zinc-500 line-through">
                {formatVND(product.originalPrice, product.currency)}
              </span>
            )}
            {product.shippingFee && product.shippingFee > 0 ? (
              <span className="text-[9px] font-mono text-zinc-400">
                + {formatVND(product.shippingFee, product.currency)} ship
              </span>
            ) : null}
          </div>

          <Link
            href={`/products/${product.id}`}
            className="text-[11px] uppercase tracking-wider text-zinc-400 hover:text-[#d4af37] font-semibold transition-colors flex items-center gap-1"
          >
            <span>Chi Tiết</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
