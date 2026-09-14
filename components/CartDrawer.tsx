"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight, Trash2, CreditCard, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { isCartOpen, closeCart, items, updateQuantity, removeItem, subtotal, totalCount } = useCart();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  // Handle PayOS Checkout
  const handlePayOSCheckout = async () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/payos/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalAmountUSD: subtotal,
          customerName: user?.fullName || "Khách Hàng Quý Tộc",
          customerEmail: user?.email || "customer@zorenb.com",
          customerPhone: user?.phone || "",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || "Không thể khởi tạo cổng thanh toán PayOS.");
      }

      // Redirect to PayOS checkout page
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setCheckoutError(err.message || "Đã xảy ra lỗi khi kết nối PayOS.");
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-[#0c0c0f] border-l border-[#24242e] shadow-2xl flex flex-col justify-between text-zinc-100"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-[#1f1f27] flex items-center justify-between bg-[#121217]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-[#d4af37]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2
                      className="text-base tracking-wider uppercase text-zinc-100 font-semibold"
                      style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
                    >
                      Tủ Đồ Quý Tộc
                    </h2>
                    <p className="text-xs text-zinc-400 tracking-wide font-sans">
                      {totalCount > 0 ? `${totalCount} tuyệt tác đang chọn` : "Tủ đồ đang trống"}
                      {user && <span className="text-[#d4af37] ml-2 font-mono text-[11px]">• Đã đồng bộ</span>}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeCart}
                  className="w-8 h-8 rounded-full border border-zinc-800 hover:border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                  aria-label="Đóng tủ đồ"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 divide-y divide-[#1c1c24] scrollbar-thin">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                    <div className="w-16 h-16 rounded-full border border-dashed border-zinc-700 flex items-center justify-center text-zinc-500">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium tracking-wide text-zinc-300">
                        Chưa có tuyệt tác nào trong tủ đồ
                      </p>
                      <p className="text-xs text-zinc-500 max-w-xs leading-relaxed font-sans">
                        Hãy chiêm ngưỡng các bộ sưu tập giới hạn của ZORENB để chọn tác phẩm ưng ý.
                      </p>
                    </div>
                    <button
                      onClick={closeCart}
                      className="mt-2 text-xs uppercase tracking-widest px-6 py-2.5 rounded-full border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10 transition-all font-semibold font-sans"
                    >
                      Khám Phá Bộ Sưu Tập
                    </button>
                  </div>
                ) : (
                  items.map(({ product, quantity }) => (
                    <div key={product.id} className="pt-4 first:pt-0 flex gap-4 items-center">
                      {/* Product Thumbnail */}
                      <Link
                        href={`/products/${product.id}`}
                        onClick={closeCart}
                        className="relative w-20 h-24 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex-shrink-0 group"
                      >
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </Link>

                      {/* Product Info & Controls */}
                      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <Link
                              href={`/products/${product.id}`}
                              onClick={closeCart}
                              className="text-xs uppercase font-medium text-zinc-200 hover:text-[#d4af37] transition-colors truncate"
                            >
                              {product.name}
                            </Link>

                            {/* Delete item button */}
                            <button
                              onClick={() => removeItem(product.id)}
                              className="text-zinc-500 hover:text-rose-400 transition-colors p-1 flex-shrink-0"
                              title="Xóa món hàng này ra"
                              aria-label="Xóa sản phẩm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                            Ref. {product.reference}
                          </p>
                        </div>

                        {/* Price & Side Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-xs font-semibold text-[#d4af37] font-mono">
                            ${formatPrice(product.price * quantity)}
                          </div>

                          {/* Number Quantity with Plus/Minus buttons */}
                          <div className="flex items-center border border-zinc-700/80 rounded-lg overflow-hidden bg-zinc-900/80">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                              aria-label="Giảm số lượng"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-mono font-semibold text-zinc-200">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                              aria-label="Tăng số lượng"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer – When items exist, show checkout and continue buttons */}
              {items.length > 0 && (
                <div className="px-6 py-5 border-t border-[#1f1f27] bg-[#101015] space-y-4">
                  {/* Security Guarantee */}
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-3 py-2 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Thanh toán bảo mật chuẩn Thụy Sĩ qua cổng PayOS</span>
                  </div>

                  {/* Calculations */}
                  <div className="space-y-1.5 pt-1 font-sans">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Tạm tính ({totalCount} sản phẩm)</span>
                      <span className="text-zinc-200 font-mono font-medium">${formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Quy đổi PayOS (tạm ước tính)</span>
                      <span className="text-emerald-400 font-mono font-medium">
                        {formatPrice(subtotal * 25400)} ₫
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t border-zinc-800 text-zinc-100">
                      <span className="uppercase tracking-wider">Tổng Thanh Toán</span>
                      <span className="text-base text-[#d4af37] font-mono font-bold">
                        ${formatPrice(subtotal)}
                      </span>
                    </div>
                  </div>

                  {checkoutError && (
                    <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-lg">
                      {checkoutError}
                    </p>
                  )}

                  {/* Action Buttons: Thanh Toán & Thêm Giỏ Hàng */}
                  <div className="space-y-2 pt-1 font-sans">
                    {/* Nút Thanh Toán PayOS */}
                    <button
                      onClick={handlePayOSCheckout}
                      disabled={isCheckingOut}
                      className="w-full relative group overflow-hidden rounded-full py-3.5 px-6 bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs tracking-widest uppercase shadow-lg shadow-gold-400/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang Kết Nối Cổng PayOS...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Thanh Toán Ngay Qua PayOS</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    {/* Nút Thêm Giỏ Hàng / Tiếp Tục Chọn */}
                    <button
                      onClick={closeCart}
                      className="w-full py-2.5 text-center text-xs tracking-wider uppercase text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-full transition-colors font-medium"
                    >
                      + Thêm Giỏ Hàng / Tiếp Tục Xem
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
