'use client';

import React, { useState, useTransition, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, ArrowUpDown, Watch as WatchIcon, ChevronDown, Check, Loader2 } from 'lucide-react';
import { ALL_WATCHES } from '@/data/watches';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import Footer from '@/components/Footer';

// All 10 luxury brands matching data/watches/index.ts
const ALL_BRANDS = [
  { id: 'all', name: 'Tất Cả Thương Hiệu' },
  { id: 'patek-philippe', name: 'Patek Philippe' },
  { id: 'rolex', name: 'Rolex' },
  { id: 'audemars-piguet', name: 'Audemars Piguet' },
  { id: 'vacheron-constantin', name: 'Vacheron Constantin' },
  { id: 'a-lange-sohne', name: 'A. Lange & Söhne' },
  { id: 'richard-mille', name: 'Richard Mille' },
  { id: 'jaeger-lecoultre', name: 'Jaeger-LeCoultre' },
  { id: 'cartier', name: 'Cartier' },
  { id: 'omega', name: 'Omega' },
  { id: 'iwc-schaffhausen', name: 'IWC Schaffhausen' },
];

interface ApiProduct {
  id: string;
  name: string;
  brand: string;
  reference: string;
  price: number;
  original_price?: number;
  images: string[];
  caliber?: string;
  case_size?: string;
  complications?: string[];
  description?: string;
  rating?: number;
}

export default function ProductsPage() {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-desc' | 'price-asc' | 'rating'>('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [apiProducts, setApiProducts] = useState<ApiProduct[] | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'local' | null>(null);
  const [, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch products from API (Supabase-first, local fallback)
  const fetchProducts = useCallback(async (brand: string, search: string, sort: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (brand && brand !== 'all') params.set('brand', brand);
      if (search.trim()) params.set('search', search.trim());
      if (sort) params.set('sort', sort);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      setApiProducts(data.products || []);
      setDataSource(data.source || 'local');
    } catch {
      // Fallback to static local data on API failure
      setApiProducts(null);
      setDataSource('local');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts('all', '', 'featured');
  }, [fetchProducts]);

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId);
    setIsDropdownOpen(false);
    startTransition(() => {
      fetchProducts(brandId, searchTerm, sortBy);
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Debounce search
    const timer = setTimeout(() => {
      fetchProducts(selectedBrand, value, sortBy);
    }, 400);
    return () => clearTimeout(timer);
  };

  const handleSortChange = (value: string) => {
    const newSort = value as 'featured' | 'price-desc' | 'price-asc' | 'rating';
    setSortBy(newSort);
    fetchProducts(selectedBrand, searchTerm, newSort);
  };

  // Use API products if available, otherwise fall back to static local data
  let displayWatches = apiProducts
    ? ALL_WATCHES.filter((w) => apiProducts.some((p) => p.id === w.id))
    : [...ALL_WATCHES];

  // If API filtered results, apply same filter to local data for proper display
  if (apiProducts === null) {
    // Local fallback filtering
    if (selectedBrand !== 'all') {
      const brandObj = ALL_BRANDS.find((b) => b.id === selectedBrand);
      if (brandObj && brandObj.id !== 'all') {
        displayWatches = displayWatches.filter(
          (w) => w.brand.toLowerCase() === brandObj.name.toLowerCase()
        );
      }
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      displayWatches = displayWatches.filter(
        (w) =>
          w.name.toLowerCase().includes(term) ||
          w.brand.toLowerCase().includes(term) ||
          w.reference.toLowerCase().includes(term) ||
          w.caliber.toLowerCase().includes(term)
      );
    }
    if (sortBy === 'price-desc') {
      displayWatches.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'price-asc') {
      displayWatches.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'rating') {
      displayWatches.sort((a, b) => b.rating - a.rating);
    }
  } else {
    // API gave us ordered IDs; preserve order
    const orderMap = new Map(apiProducts.map((p, i) => [p.id, i]));
    displayWatches.sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999));
  }

  const currentBrandName =
    ALL_BRANDS.find((b) => b.id === selectedBrand)?.name || 'Tất Cả Thương Hiệu';

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 pt-28 pb-16 flex flex-col justify-between font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* Page Banner Header */}
        <div className="text-center py-12 border-b border-zinc-800/60 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-gold-400/30 bg-zinc-900/60 mb-3">
            <WatchIcon className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold-300 font-semibold">
              Bảo Tàng Đồng Hồ Haute Horlogerie
            </span>
          </div>

          <h1
            className="text-3xl sm:text-5xl font-serif font-light tracking-wide uppercase text-zinc-100"
            style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
          >
            BỘ SƯU TẬP <span className="italic text-[#d4af37]">TUYỆT TÁC ĐỘC BẢN</span>
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            Tuyển chọn đỉnh cao từ 10 thương hiệu đồng hồ lớn nhất thế giới, kèm sổ bảo hành và chứng thư NFC quốc tế.
          </p>

          {/* Data source badge */}
          {dataSource && (
            <div className="mt-3">
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border font-mono ${
                  dataSource === 'supabase'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-zinc-800/60 border-zinc-700 text-zinc-500'
                }`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                {dataSource === 'supabase' ? 'Live từ Supabase Database' : 'Dữ liệu cục bộ (Local)'}
              </span>
            </div>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-zinc-800/40 relative z-30">
          {/* Brand Dropdown — All 10 brands */}
          <div className="relative w-full md:w-auto" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-80 px-5 py-3 rounded-2xl bg-[#141419] border border-[#d4af37]/40 hover:border-[#d4af37] text-zinc-100 flex items-center justify-between gap-3 shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Hãng:</span>
                <span className="text-xs font-bold text-[#d4af37] tracking-wider uppercase truncate">
                  {currentBrandName}
                </span>
              </div>
              <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown className="w-4 h-4 text-[#d4af37]" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-full mt-2 w-full sm:w-80 rounded-2xl bg-[#131318]/95 border border-[#d4af37]/30 backdrop-blur-2xl shadow-2xl py-2 z-50 overflow-hidden divide-y divide-zinc-800/40"
                >
                  {ALL_BRANDS.map((brand) => {
                    const isSelected = selectedBrand === brand.id;
                    return (
                      <li key={brand.id}>
                        <button
                          type="button"
                          onClick={() => handleBrandSelect(brand.id)}
                          className={`w-full text-left px-5 py-3 text-xs tracking-wider uppercase transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#d4af37]/15 text-[#d4af37] font-bold'
                              : 'text-zinc-300 hover:text-white hover:bg-white/5 font-medium'
                          }`}
                        >
                          <span>{brand.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#d4af37]" />}
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm mã Ref, Calibre, tên..."
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-full pl-9 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-full px-4 py-2.5 pr-8 appearance-none focus:outline-none focus:border-[#d4af37] cursor-pointer"
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
          ) : displayWatches.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/40 rounded-2xl border border-zinc-800 p-8">
              <p className="text-base text-zinc-400 font-serif">
                Không tìm thấy tuyệt tác nào phù hợp
                {searchTerm && <> với từ khóa &ldquo;{searchTerm}&rdquo;</>}
              </p>
              <button
                onClick={() => {
                  setSelectedBrand('all');
                  setSearchTerm('');
                  fetchProducts('all', '', sortBy);
                }}
                className="mt-4 text-xs uppercase tracking-widest text-gold-400 underline cursor-pointer"
              >
                Đặt lại toàn bộ bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs text-zinc-500 font-mono">
                  {isLoading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" /> Đang tải...
                    </span>
                  ) : (
                    `${displayWatches.length} tuyệt tác`
                  )}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {displayWatches.map((watch) => (
                  <ProductCard key={watch.id} product={watch} theme="dark" />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
