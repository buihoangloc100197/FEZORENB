'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Sparkles, Search, ArrowUpDown, Watch as WatchIcon } from 'lucide-react';
import { ALL_WATCHES, WATCH_BRANDS, WATCH_COMPLICATIONS, Watch } from '@/data/watches';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import Footer from '@/components/Footer';

export default function ProductsPage() {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedComplication, setSelectedComplication] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-desc' | 'price-asc' | 'rating'>('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  const handleBrandChange = (brandId: string) => {
    if (brandId === selectedBrand) return;
    setIsLoading(true);
    startTransition(() => {
      setSelectedBrand(brandId);
      setTimeout(() => {
        setIsLoading(false);
      }, 350);
    });
  };

  // Filter & Sort
  let watches = [...ALL_WATCHES];

  if (selectedBrand !== 'all') {
    const brandObj = WATCH_BRANDS.find((b) => b.id === selectedBrand);
    if (brandObj) {
      watches = watches.filter((w) => w.brand === brandObj.name);
    }
  }

  if (selectedComplication !== 'all') {
    const compObj = WATCH_COMPLICATIONS.find((c) => c.id === selectedComplication);
    if (compObj && compObj.value !== 'all') {
      watches = watches.filter((w) => w.complications.includes(compObj.value as any));
    }
  }

  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    watches = watches.filter(
      (w) =>
        w.name.toLowerCase().includes(term) ||
        w.brand.toLowerCase().includes(term) ||
        w.reference.toLowerCase().includes(term) ||
        w.caliber.toLowerCase().includes(term) ||
        w.subtitle.toLowerCase().includes(term)
    );
  }

  if (sortBy === 'price-desc') {
    watches.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'price-asc') {
    watches.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'rating') {
    watches.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 pt-28 pb-16 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* Page Banner Header */}
        <div className="text-center py-12 border-b border-zinc-800/60 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-400/30 bg-zinc-900/60 mb-3">
            <WatchIcon className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold-300 font-medium">
              Sàn Giao Dịch Đồng Hồ Haute Horlogerie
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-wide uppercase text-zinc-100">
            Tuyển Tập <span className="italic font-serif text-gold-400">Đồng Hồ Xa Xỉ</span>
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            Dữ liệu tuyển chọn chính hãng từ Rolex, Patek Philippe, Audemars Piguet, Richard Mille, Vacheron Constantin, Cartier và Omega kèm sổ đăng ký bảo hành toàn cầu.
          </p>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-zinc-800/40">
          {/* Brand Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {WATCH_BRANDS.map((b) => (
              <button
                key={b.id}
                onClick={() => handleBrandChange(b.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase whitespace-nowrap transition-all ${
                  selectedBrand === b.id
                    ? 'bg-gold-400 text-zinc-950 font-semibold shadow-md shadow-gold-400/20'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã Ref, Hãng, Calibre..."
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-full pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-gold-400/60"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-full px-4 py-2 pr-8 appearance-none focus:outline-none focus:border-gold-400/60 cursor-pointer"
              >
                <option value="featured">Nổi Bật Nhất</option>
                <option value="price-desc">Giá: Cao Đến Thấp</option>
                <option value="price-asc">Giá: Thấp Đến Cao</option>
                <option value="rating">Đánh Giá Cao Nhất</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Product Grid / Shimmer Loading Screen */}
        <div className="py-12">
          {isLoading ? (
            <ProductSkeleton count={8} theme="dark" />
          ) : watches.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/40 rounded-2xl border border-zinc-800 p-8">
              <p className="text-base text-zinc-400 font-serif">
                Không tìm thấy tuyệt tác nào phù hợp với từ khóa &ldquo;{searchTerm}&rdquo;
              </p>
              <button
                onClick={() => {
                  setSelectedBrand('all');
                  setSelectedComplication('all');
                  setSearchTerm('');
                }}
                className="mt-4 text-xs uppercase tracking-widest text-gold-400 underline"
              >
                Đặt lại toàn bộ bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {watches.map((watch) => (
                <ProductCard key={watch.id} product={watch} theme="dark" />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
