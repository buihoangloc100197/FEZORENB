'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Calendar,
  Check,
  Watch as WatchIcon,
  Compass,
  Gauge
} from 'lucide-react';
import { ALL_WATCHES, Watch } from '@/data/watches';
import { useCart } from '@/context/CartContext';
import { formatPrice, formatVND } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const localWatch = ALL_WATCHES.find((w) => w.id === productId) || ALL_WATCHES[0];
  const [watch, setWatch] = useState<Watch>(localWatch);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.product) {
          setWatch((prev) => ({
            ...prev,
            ...data.product,
            images: data.product.images?.length ? data.product.images : prev.images,
          }));
        }
      })
      .catch((err) => console.warn('Could not fetch from API, using fallback', err));
  }, [productId]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedEdition, setSelectedEdition] = useState('Dây Nguyên Bản Đi Kèm');
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(watch);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const relatedWatches = ALL_WATCHES.filter(
    (w) => (w.brand === watch.brand || w.category === watch.category) && w.id !== watch.id
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 pt-28 pb-16 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* Breadcrumb Navigation */}
        <div className="py-4 flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider">
          <Link href="/products" className="hover:text-gold-300 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Đồng Hồ Xa Xỉ</span>
          </Link>
          <span>/</span>
          <span className="text-zinc-400">{watch.brand}</span>
          <span>/</span>
          <span className="text-gold-300 truncate max-w-xs">{watch.name}</span>
        </div>

        {/* Main Product Layout (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-8 items-start">
          {/* Left Column: Image Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Featured Display Image */}
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-2xl">
              <Image
                src={watch.images[activeImageIndex] || watch.images[0]}
                alt={watch.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />

              {/* Top Floating Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-black/80 backdrop-blur-md text-gold-300 border border-gold-400/40">
                  {watch.brand}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-900/90 text-zinc-300 border border-zinc-700/80">
                  {watch.reference}
                </span>
              </div>
            </div>

            {/* Thumbnail Navigation Row */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {watch.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-gold-400 scale-105 shadow-md shadow-gold-400/20'
                      : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${watch.name} góc nhìn ${idx + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Horological Narrative & Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:pl-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-semibold">
                  {watch.collectionName} • {watch.caseSize}
                </span>
                <div className="flex items-center gap-1.5 text-gold-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-mono font-medium text-zinc-300">{watch.rating}</span>
                  <span className="text-xs text-zinc-500">({watch.reviewsCount} thẩm định)</span>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl font-light uppercase tracking-wide text-zinc-100 mt-2 leading-tight">
                {watch.name}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-light mt-1.5 leading-relaxed">
                {watch.subtitle}
              </p>
            </div>

            {/* Price Row in VND */}
            <div className="py-4 border-y border-zinc-800/80 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-semibold font-mono text-gold-300">
                {formatVND(watch.price)}
              </span>
              {watch.originalPrice && (
                <span className="text-sm font-mono text-zinc-500 line-through">
                  {formatVND(watch.originalPrice)}
                </span>
              )}
              <span className="text-[11px] text-emerald-400 font-medium tracking-wider uppercase ml-auto">
                {watch.inStock ? 'Sẵn Có Tại Boutique' : 'Đặt Hàng Kín'}
              </span>
            </div>

            {/* Narrative Description */}
            <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
              {watch.description}
            </p>

            {/* Horological Highlight Specs Pill Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase">Bộ Máy</div>
                  <div className="text-zinc-200 font-mono font-medium">{watch.caliber}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center gap-2">
                <Compass className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase">Trữ Cót</div>
                  <div className="text-zinc-200 font-mono font-medium">{watch.powerReserve}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Add to Cart Drawer + Book Appointment */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-gold-400 via-[#f3e3a3] to-gold-500 text-zinc-950 font-semibold text-xs tracking-widest uppercase shadow-xl shadow-gold-400/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã Thêm Vào Giỏ Hàng</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Thêm Vào Giỏ Hàng (Mở Drawer)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => alert(`Quản gia VIP sẽ liên hệ trong 15 phút để sắp xếp phòng thử riêng tư cho chiếc ${watch.name}!`)}
                className="w-full py-3.5 px-6 rounded-full border border-zinc-700 hover:border-gold-400/60 bg-zinc-900/50 text-zinc-200 hover:text-gold-200 text-xs tracking-widest uppercase font-medium transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-gold-400" />
                <span>Đặt Lịch Thử Kín Tại Boutique</span>
              </button>
            </div>

            {/* Trust Service Icons */}
            <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-[11px] text-zinc-400">
              <div className="p-2 rounded-lg bg-zinc-900/40">
                <Truck className="w-4 h-4 text-gold-400 mx-auto mb-1" />
                <span>Giao Chuyên Xa Bọc Thép</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-900/40">
                <ShieldCheck className="w-4 h-4 text-gold-400 mx-auto mb-1" />
                <span>Thẻ Chứng Thực NFC</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-900/40">
                <RotateCcw className="w-4 h-4 text-gold-400 mx-auto mb-1" />
                <span>Bảo Hành 5 Năm Quốc Tế</span>
              </div>
            </div>

            {/* Specifications Details Table */}
            <div className="pt-4 space-y-3">
              <h3 className="font-serif text-sm uppercase tracking-wider text-zinc-200">
                Thông Số Kỹ Nghệ Chế Tác
              </h3>
              <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/80 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-400">Thương hiệu</span>
                  <span className="text-gold-400 font-medium">{watch.brand}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-400">Mã Reference</span>
                  <span className="text-zinc-200 font-mono font-medium">{watch.reference}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-400">Đường kính vỏ</span>
                  <span className="text-zinc-200 font-medium">{watch.caseSize}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-400">Chất liệu vỏ</span>
                  <span className="text-zinc-200 font-medium">{watch.caseMaterial}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-400">Bộ máy cơ</span>
                  <span className="text-zinc-200 font-medium">{watch.caliber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-400">Chống nước</span>
                  <span className="text-zinc-200 font-medium">{watch.waterResistance}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Dây đeo</span>
                  <span className="text-zinc-200 font-medium">{watch.braceletType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Watches */}
        {relatedWatches.length > 0 && (
          <div className="py-16 border-t border-zinc-800/80 mt-12">
            <h2 className="font-serif text-xl sm:text-2xl uppercase tracking-wider text-center mb-8">
              Tuyệt Tác Cùng Thương Hiệu &amp; Phân Khúc
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedWatches.map((w) => (
                <ProductCard key={w.id} product={w} theme="dark" />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
