"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Camera, Shield, ShoppingBag, Clock, ArrowRight, LogOut, Check, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import ZorenbLogo from "@/components/ZorenbLogo";

export default function ProfilePage() {
  const { user, updateProfile, logout, isAdmin } = useAuth();
  const { items, totalCount } = useCart();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real order history from Supabase
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setAvatarPreview(user.avatarUrl || "");
    }
  }, [user]);

  // Fetch real orders from Supabase
  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  // Handle avatar file selection — preview immediately, upload on save
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước ảnh tối đa là 5MB.");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);

    try {
      // Step 1: Upload avatar to Supabase Storage if a new file is selected
      let finalAvatarUrl = avatarPreview;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const uploadRes = await fetch("/api/auth/upload-avatar", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          alert("Lỗi upload ảnh: " + (uploadData.error || "Không xác định"));
          setIsSaving(false);
          return;
        }
        finalAvatarUrl = uploadData.avatarUrl;
        setAvatarPreview(finalAvatarUrl);
        setAvatarFile(null);
      }

      // Step 2: Update profile info (name, phone, avatarUrl)
      const result = await updateProfile({
        fullName,
        phone,
        avatarUrl: finalAvatarUrl,
      });

      if (result.success) {
        setSuccessMsg("Cập nhật thông tin cá nhân và ảnh đại diện thành công!");
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        alert(result.error || "Lỗi cập nhật.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-4 max-w-sm">
          <ZorenbLogo size={48} className="mx-auto" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-100">
            Yêu Cầu Đăng Nhập
          </h2>
          <p className="text-xs text-zinc-400 font-light">
            Vui lòng đăng nhập để xem thông tin cá nhân, tủ đồ và lịch sử mua sắm độc quyền.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg"
          >
            <span>Đăng Nhập Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 pt-32 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#101015] border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#d4af37] bg-zinc-900 relative">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar"
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#d4af37]">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#d4af37] text-zinc-950 shadow-md hover:scale-110 transition-transform"
                title="Tải ảnh đại diện mới"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-xl sm:text-2xl font-bold tracking-wider text-zinc-100 uppercase"
                  style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
                >
                  {user.fullName || "Quý Khách Hàng"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40">
                  {user.role === "admin" ? "Quản Trị Viên (Admin)" : "Hội Viên VIP"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-[#d4af37] text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Trang Quản Trị</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-700 hover:border-rose-500/60 text-zinc-300 hover:text-rose-400 font-medium text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Edit Personal Details (User Role Permission) */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <User className="w-4 h-4 text-[#d4af37]" />
                <span>Thông Tin Cá Nhân</span>
              </h2>
              <p className="text-xs text-zinc-400 font-light mt-1">
                Quý khách có quyền cập nhật tên, số điện thoại và ảnh đại diện.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">
                  Họ Và Tên
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-[#16161c] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">
                  Email (Cố Định)
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-[#121216] border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs text-zinc-500 cursor-not-allowed font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">
                  Số Điện Thoại
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+84 900 000 000"
                  className="w-full bg-[#16161c] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs uppercase tracking-wider hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-md shadow-gold-400/20"
              >
                {isSaving ? "Đang Lưu..." : "Lưu Thông Tin Cá Nhân"}
              </button>
            </form>
          </div>

          {/* Right: Persistent Cart & Order History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Persistent Cart Overview */}
            <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
                    Tủ Đồ Đang Lưu Vĩnh Viễn ({totalCount})
                  </h2>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">
                  • Luôn được bảo lưu với tài khoản
                </span>
              </div>

              {items.length === 0 ? (
                <p className="text-xs text-zinc-500 py-3">
                  Tủ đồ của Quý khách hiện chưa có sản phẩm nào.
                </p>
              ) : (
                <div className="divide-y divide-zinc-800/80">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="py-3 first:pt-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-200 uppercase truncate">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            Số lượng: {quantity} • Ref: {product.reference}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#d4af37] flex-shrink-0">
                        ${formatPrice(product.price * quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Purchase History — Real data from Supabase */}
            <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d4af37]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
                  Lịch Sử Mua Hàng &amp; Đơn Hàng Độc Bản
                </h2>
              </div>

              {ordersLoading ? (
                <p className="text-xs text-zinc-500 py-3 animate-pulse">Đang tải lịch sử đơn hàng...</p>
              ) : orders.length === 0 ? (
                <p className="text-xs text-zinc-500 py-3">Quý khách chưa có đơn hàng nào.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const productNames = (order.order_items || [])
                      .map((i: any) => i.product_name)
                      .join(", ");
                    const dateStr = order.created_at
                      ? new Date(order.created_at).toLocaleDateString("vi-VN")
                      : "";
                    const statusMap: Record<string, string> = {
                      paid: "Đã thanh toán",
                      pending: "Đang chờ thanh toán",
                      cancelled: "Đã hủy",
                      refunded: "Đã hoàn tiền",
                    };
                    const statusLabel = statusMap[order.status] || order.status;
                    const statusColor =
                      order.status === "paid"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : order.status === "cancelled" || order.status === "refunded"
                        ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20";

                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-xl bg-[#14141a] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-zinc-200">
                              #{order.order_code}
                            </span>
                            <span className="text-[10px] text-zinc-500">• {dateStr}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] border ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 font-medium">
                            {productNames || "—"}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-zinc-400">Tổng đầu tư</p>
                          <p className="text-sm font-mono font-bold text-zinc-100">
                            {order.currency === "VND"
                              ? `${Number(order.total_amount).toLocaleString("vi-VN")} ₫`
                              : `$${formatPrice(order.total_amount)}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
