"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Shield, 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Search,
  Lock,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Clock,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  Plus,
  Trash2,
  Upload,
  X,
  ImageIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { ALL_WATCHES } from "@/data/watches";

interface AdminOrder {
  id: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  currency: string;
  status: "pending" | "paid" | "cancelled" | "shipping" | "completed";
  created_at: string;
  items: Array<{
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

interface AdminUser {
  id: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: "admin" | "staff" | "user";
  created_at: string;
}

interface AdminProduct {
  id: string;
  name: string;
  brand: string;
  reference: string;
  price: number;
  original_price?: number;
  images: string[];
  caliber?: string;
  complications?: string[];
  description?: string;
  rating?: number;
  created_at?: string;
}

interface Analytics {
  totalOrders: number;
  totalRevenueVND: number;
  totalRevenueUSD: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  cancelledOrdersCount: number;
  averageOrderValueVND: number;
}

export default function AdminDashboardPage() {
  const { user, isAdmin, isStaff, isLoading } = useAuth();

  // Active tab: "counter" | "revenue" | "staff" | "products"
  const [activeTab, setActiveTab] = useState<"counter" | "revenue" | "staff" | "products">("counter");

  // Orders and analytics state
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalOrders: 0,
    totalRevenueVND: 0,
    totalRevenueUSD: 0,
    paidOrdersCount: 0,
    pendingOrdersCount: 0,
    cancelledOrdersCount: 0,
    averageOrderValueVND: 0,
  });
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  // Users state
  const [userList, setUserList] = useState<AdminUser[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  // Sound and notification states for Counter Staff
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState<AdminOrder | null>(null);
  const prevOrderCountRef = useRef<number | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>("");

  // Products state
  const [productsList, setProductsList] = useState<AdminProduct[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [productFormError, setProductFormError] = useState<string | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    brand: "Rolex",
    reference: "",
    price: "",
    original_price: "",
    caliber: "Calibre Tự Động Thụy Sĩ",
    complications: "Perpetual, Chronometer",
    description: "",
    images: [] as string[],
    imageUrlInput: "",
  });

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 1. Web Audio API Luxury Ding-Dong Chime for Counter Staff
  const playLuxuryChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: High crisp chime (E6 ~ 1318Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1318.5, now);
      osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3); // Ramp to C6
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      // Note 2: Warm fundamental chime (G5 ~ 783Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(783.99, now + 0.15);
      gain2.gain.setValueAtTime(0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 1.2);
    } catch (err) {
      console.warn("Could not play luxury chime:", err);
    }
  };

  // 1b. Web Speech API Voice Notification: "Xác nhận! Bạn có một đơn hàng mới!"
  const playNewOrderVoiceAlert = () => {
    try {
      playLuxuryChime();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Xác nhận, bạn có một đơn hàng mới!");
        utterance.lang = "vi-VN";
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find(
          (v) => v.lang.toLowerCase().includes("vi") || v.lang.toLowerCase().includes("vn")
        );
        if (viVoice) {
          utterance.voice = viVoice;
        }

        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 400);
      }
    } catch (err) {
      console.warn("Could not play voice alert:", err);
    }
  };

  // 2. Fetch Orders & Analytics from API (Only paid / completed orders)
  const fetchOrdersData = async (isBackgroundPoll = false) => {
    try {
      if (!isBackgroundPoll) setIsOrdersLoading(true);
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        const incomingOrders: AdminOrder[] = data.orders || [];

        // Check if there is a NEW order
        if (
          prevOrderCountRef.current !== null &&
          incomingOrders.length > prevOrderCountRef.current
        ) {
          const newest = incomingOrders[0];
          setNewOrderAlert(newest);
          if (isSoundEnabled) {
            playNewOrderVoiceAlert();
          }
        }

        prevOrderCountRef.current = incomingOrders.length;
        setOrders(incomingOrders);
        if (data.analytics) setAnalytics(data.analytics);
        setLastRefreshedAt(new Date().toLocaleTimeString("vi-VN"));
      }
    } catch (err) {
      console.error("Failed to load admin orders:", err);
    } finally {
      if (!isBackgroundPoll) setIsOrdersLoading(false);
    }
  };

  // 3. Fetch Users from API
  const fetchUsersData = async () => {
    try {
      setIsUsersLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUserList(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  // 4. Fetch Products directly from Supabase Database
  const fetchProductsData = async () => {
    try {
      setIsProductsLoading(true);
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setProductsList(data.products);
        }
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setIsProductsLoading(false);
    }
  };

  // 5. Handle Create New Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError(null);

    if (!productForm.name.trim()) {
      setProductFormError("Vui lòng nhập tên sản phẩm.");
      return;
    }
    if (!productForm.price || Number(productForm.price) <= 0) {
      setProductFormError("Vui lòng nhập giá bán hợp lệ lớn hơn 0.");
      return;
    }

    try {
      setIsSubmittingProduct(true);
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productForm.name.trim(),
          brand: productForm.brand,
          reference: productForm.reference.trim(),
          price: Number(productForm.price),
          original_price: productForm.original_price ? Number(productForm.original_price) : null,
          caliber: productForm.caliber.trim(),
          complications: productForm.complications,
          description: productForm.description.trim(),
          images: productForm.images.length > 0 ? productForm.images : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể lưu sản phẩm.");
      }

      if (data.product) {
        setProductsList((prev) => [data.product, ...prev]);
      }

      setProductForm({
        name: "",
        brand: "Rolex",
        reference: "",
        price: "",
        original_price: "",
        caliber: "Calibre Tự Động Thụy Sĩ",
        complications: "Perpetual, Chronometer",
        description: "",
        images: [],
        imageUrlInput: "",
      });
      setIsAddProductModalOpen(false);
      alert(`Đã thêm sản phẩm "${productForm.name}" thành công vào Cơ Sở Dữ Liệu Supabase!`);
    } catch (err: any) {
      setProductFormError(err.message || "Đã xảy ra lỗi khi tạo sản phẩm.");
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // 6. Handle Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Quý khách có chắc chắn muốn xóa sản phẩm "${name}" khỏi cơ sở dữ liệu dự án?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProductsList((prev) => prev.filter((p) => p.id !== id));
        alert(`Đã xóa thành công sản phẩm "${name}".`);
      } else {
        alert(data.error || "Lỗi khi xóa sản phẩm.");
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message);
    }
  };

  // 7. Handle Upload Image to Supabase Storage
  const handleUploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const fd = new FormData();
      fd.append("image", file);
      const tempId = productForm.name
        ? productForm.name.toLowerCase().replace(/[^a-z0-9]/g, "-")
        : "custom-" + Date.now();
      fd.append("productId", tempId);

      const res = await fetch("/api/admin/upload-product-image", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images, data.imageUrl],
        }));
      } else {
        alert(data.error || "Lỗi tải ảnh lên Supabase Storage.");
      }
    } catch (err: any) {
      alert("Lỗi upload ảnh: " + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Initial load and polling (every 6 seconds for counter staff alerts)
  useEffect(() => {
    if (isAdmin || isStaff) {
      fetchOrdersData();
      fetchProductsData();
      const interval = setInterval(() => {
        fetchOrdersData(true);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, isStaff, isSoundEnabled]);

  useEffect(() => {
    if (activeTab === "staff" && isAdmin) {
      fetchUsersData();
    }
    if (activeTab === "products") {
      fetchProductsData();
    }
  }, [activeTab, isAdmin]);

  // Handle Order Status Change
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
        fetchOrdersData(true);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Handle Role Change
  const handleUpdateUserRole = async (userId: string, newRole: "admin" | "staff" | "user") => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUserList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error("Failed to update user role:", err);
    }
  };

  // Access Control Guard
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-gold-300">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-xs uppercase tracking-widest">Đang kiểm tra bảo mật phân quyền...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isStaff) {
    return (
      <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-4 max-w-md p-8 rounded-2xl bg-[#101015] border border-rose-500/30 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1
            className="text-xl font-bold uppercase tracking-wider text-zinc-100"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Từ Chối Truy Cập
          </h1>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            Khu vực này được bảo vệ nghiêm ngặt, chỉ dành riêng cho tài khoản có vai trò <strong>Quản Trị Viên (Admin)</strong> hoặc <strong>Nhân Viên Trực Quầy (Staff)</strong>.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs uppercase tracking-wider"
            >
              Đăng Nhập Tài Khoản Quản Trị
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs uppercase tracking-wider hover:text-white"
            >
              Về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtered orders list
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter === "all" || ord.status === statusFilter;
    const matchesSearch =
      ord.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.items.some((it) => it.product_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 🔔 FLOATING INSTANT NOTIFICATION BANNER FOR COUNTER STAFF */}
        {newOrderAlert && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#d4af37]/20 to-emerald-500/20 border-2 border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.3)] animate-pulse flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#d4af37] text-zinc-950 flex items-center justify-center font-bold shadow-lg">
                <BellRing className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#d4af37] text-zinc-950">
                    ĐƠN HÀNG MỚI VỪA ĐẶT
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    #{newOrderAlert.order_code}
                  </span>
                </div>
                <p className="text-sm font-semibold text-zinc-100 mt-1">
                  Khách hàng: <span className="text-[#d4af37]">{newOrderAlert.customer_name}</span> • Trị giá:{" "}
                  <span className="text-emerald-400 font-mono font-bold">
                    {formatPrice(newOrderAlert.total_amount)} ₫
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setActiveTab("counter");
                  setNewOrderAlert(null);
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#d4af37] hover:bg-gold-300 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Tiếp Nhận Đơn Ngay
              </button>
              <button
                onClick={() => setNewOrderAlert(null)}
                className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* TOP ADMIN & COUNTER STAFF HEADER */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#101015] border border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5">
              <Link href="/" className="text-zinc-500 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2">
                <h1
                  className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-zinc-100"
                  style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
                >
                  Trung Tâm Quản Trị &amp; Quầy Trực FEZORENB
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest border ${
                  isAdmin 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}>
                  {isAdmin ? "Toàn Quyền Admin" : "Nhân Viên Trực Quầy"}
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 font-light mt-1">
              Hệ thống điều phối đơn hàng trực tiếp, thông báo âm thanh quầy trực và thống kê doanh thu thời gian thực.
            </p>
          </div>

          {/* Sound & Audio Control buttons for Staff on duty */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
                isSoundEnabled
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
              }`}
              title="Bật/Tắt chuông báo đơn mới"
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{isSoundEnabled ? "Chuông Quầy: BẬT" : "Chuông Quầy: TẮT"}</span>
            </button>

            <button
              onClick={playNewOrderVoiceAlert}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-[#d4af37] flex items-center gap-1.5 transition-colors"
              title="Bấm thử âm thanh thông báo giọng nói quầy trực"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Thử Giọng Báo Đơn</span>
            </button>

            <button
              onClick={() => fetchOrdersData()}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title={`Làm mới (cập nhật lúc ${lastRefreshedAt || "vừa xong"})`}
            >
              <RefreshCw className={`w-4 h-4 ${isOrdersLoading ? "animate-spin text-[#d4af37]" : ""}`} />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex items-center gap-2 bg-[#121217] p-1.5 rounded-2xl border border-zinc-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab("counter")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "counter"
                ? "bg-gradient-to-r from-amber-400 to-[#d4af37] text-zinc-950 shadow-lg shadow-gold-400/20"
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>Quầy Trực &amp; Báo Đơn ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("revenue")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "revenue"
                ? "bg-gradient-to-r from-amber-400 to-[#d4af37] text-zinc-950 shadow-lg shadow-gold-400/20"
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Thống Kê Doanh Thu</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("staff")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === "staff"
                  ? "bg-gradient-to-r from-amber-400 to-[#d4af37] text-zinc-950 shadow-lg shadow-gold-400/20"
                : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Phân Quyền Nhân Sự</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "products"
                ? "bg-gradient-to-r from-amber-400 to-[#d4af37] text-zinc-950 shadow-lg shadow-gold-400/20"
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Sản Phẩm &amp; Ảnh Storage ({productsList.length > 0 ? productsList.length : ALL_WATCHES.length})</span>
          </button>
        </div>

        {/* ── TAB 1: QUẦY TRỰC & THÔNG BÁO ĐƠN HÀNG (COUNTER STAFF ORDERS) ── */}
        {activeTab === "counter" && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#101015] border border-zinc-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Tìm mã đơn, tên khách, sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {["all", "paid", "shipping", "completed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      statusFilter === st
                        ? "bg-zinc-800 text-[#d4af37] border border-[#d4af37]/40"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {st === "all" ? "Tất Cả Đã Thanh Toán" : st === "paid" ? "Đã Thu Tiền" : st === "shipping" ? "Đang Giao" : "Hoàn Thành"}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Feed */}
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 p-8 rounded-2xl bg-[#101015] border border-zinc-800 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto text-zinc-500">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-zinc-300">Không có đơn đặt hàng nào trong danh mục này</p>
                  <p className="text-xs text-zinc-500 font-light">
                    Hệ thống quầy trực đang tự động lắng nghe 24/7. Khi có khách đặt hàng, âm thanh chuông sẽ tự động phát.
                  </p>
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const isPaid = ord.status === "paid";
                  const isPending = ord.status === "pending";
                  const isCancelled = ord.status === "cancelled";

                  return (
                    <div
                      key={ord.id}
                      className={`p-6 rounded-2xl border transition-all ${
                        isPending
                          ? "bg-gradient-to-r from-[#17130b] to-[#101015] border-amber-500/40 shadow-lg"
                          : isPaid
                          ? "bg-[#101015] border-emerald-500/30"
                          : "bg-[#0d0d10] border-zinc-800/80 opacity-75"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            isPending ? "bg-amber-500/20 text-amber-400" : isPaid ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-400"
                          }`}>
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold font-mono text-zinc-100">
                                #{ord.order_code}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                isPaid
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                  : isPending
                                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
                                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
                              }`}>
                                {isPaid ? "Đã Thanh Toán PayOS" : isPending ? "Đang Chờ Quầy Xử Lý" : ord.status}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-3 font-light">
                              <span>Đặt lúc: {new Date(ord.created_at).toLocaleString("vi-VN")}</span>
                            </p>
                          </div>
                        </div>

                        {/* Customer Details */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300">
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-500">Khách Hàng:</span>
                            <strong className="text-white font-medium">{ord.customer_name}</strong>
                          </div>
                          {ord.customer_phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                              <span className="font-mono text-zinc-300">{ord.customer_phone}</span>
                            </div>
                          )}
                          {ord.customer_email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-zinc-500" />
                              <span className="text-zinc-400">{ord.customer_email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items and Actions */}
                      <div className="pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        {/* Items list */}
                        <div className="space-y-1.5 flex-1">
                          {ord.items && ord.items.length > 0 ? (
                            ord.items.map((it, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-zinc-200">
                                <span className="text-gold-300 font-mono font-bold">{it.quantity}x</span>
                                <span className="font-medium text-zinc-100">{it.product_name}</span>
                                <span className="text-zinc-500">•</span>
                                <span className="text-zinc-400 font-mono">{formatPrice(it.price)} ₫</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-zinc-400">Kiệt tác đồng hồ Haute Horlogerie</div>
                          )}
                        </div>

                        {/* Total Amount & Actions */}
                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-right">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Tổng Đơn Hàng</p>
                            <p className="text-lg font-mono font-bold text-emerald-400">
                              {formatPrice(ord.total_amount)} ₫
                            </p>
                          </div>

                          {/* Quick action buttons for counter staff */}
                          <div className="flex items-center gap-2">
                            {isPending && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, "paid")}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold uppercase tracking-wider transition-all"
                              >
                                Xác Nhận Thu Tiền
                              </button>
                            )}

                            {isPaid && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, "completed")}
                                className="px-3 py-1.5 rounded-lg bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/40 text-xs font-semibold uppercase tracking-wider transition-all"
                              >
                                Hoàn Tất Đơn
                              </button>
                            )}

                            {ord.status !== "cancelled" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, "cancelled")}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-800 text-xs transition-colors"
                                title="Hủy đơn hàng"
                              >
                                Hủy Đơn
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: THỐNG KÊ DOANH THU & BÁN HÀNG (SALES ANALYTICS) ── */}
        {activeTab === "revenue" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs uppercase font-semibold tracking-wider">
                  <span>Tổng Doanh Thu Đã Thu</span>
                  <DollarSign className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
                  {formatPrice(analytics.totalRevenueVND)} ₫
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  ≈ ${formatPrice(analytics.totalRevenueUSD)} USD (tỷ giá 25,400)
                </div>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1 font-mono">
                  <TrendingUp className="w-3.5 h-3.5" /> Dữ liệu trực tiếp từ PayOS &amp; DB
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs uppercase font-semibold tracking-wider">
                  <span>Đơn Thành Công (Paid)</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-100">
                  {analytics.paidOrdersCount} Đơn
                </div>
                <p className="text-[11px] text-zinc-400 pt-1">
                  Đã hoàn tất thanh toán hoặc duyệt quầy
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs uppercase font-semibold tracking-wider">
                  <span>Đơn Chờ Xử Lý (Pending)</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-400">
                  {analytics.pendingOrdersCount} Đơn
                </div>
                <p className="text-[11px] text-zinc-400 pt-1">
                  Nhân viên trực quầy cần kiểm tra
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs uppercase font-semibold tracking-wider">
                  <span>Giá Trị Trung Bình / Đơn</span>
                  <Shield className="w-4 h-4 text-gold-300" />
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-100">
                  {formatPrice(analytics.averageOrderValueVND)} ₫
                </div>
                <p className="text-[11px] text-zinc-400 pt-1">
                  Phân khúc kiệt tác Haute Horlogerie
                </p>
              </div>
            </div>

            {/* Sales Table Breakdown */}
            <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
                Lịch Sử Doanh Số Gần Đây
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-[#16161e] text-zinc-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Mã Đơn</th>
                      <th className="py-3 px-4">Khách Hàng</th>
                      <th className="py-3 px-4">Kiệt Tác Đặt Mua</th>
                      <th className="py-3 px-4">Số Tiền</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4">Thời Gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {orders.slice(0, 10).map((ord) => (
                      <tr key={ord.id} className="hover:bg-zinc-900/40">
                        <td className="py-3 px-4 font-mono font-bold text-white">#{ord.order_code}</td>
                        <td className="py-3 px-4">{ord.customer_name}</td>
                        <td className="py-3 px-4 text-zinc-300 max-w-xs truncate">
                          {ord.items.map((i) => i.product_name).join(", ") || "Đồng hồ cao cấp"}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          {formatPrice(ord.total_amount)} ₫
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                            ord.status === "paid" ? "bg-emerald-500/10 text-emerald-400" : ord.status === "pending" ? "bg-amber-500/10 text-amber-400" : "text-zinc-500"
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-500 font-mono">
                          {new Date(ord.created_at).toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: PHÂN QUYỀN NHÂN SỰ & QUẢN TRỊ VIÊN ── */}
        {activeTab === "staff" && isAdmin && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#d4af37]" />
                    <span>Danh Sách Nhân Sự &amp; Khách Hàng Trong Cơ Sở Dữ Liệu</span>
                  </h2>
                  <p className="text-xs text-zinc-400 font-light mt-0.5">
                    Quản trị viên có thể thăng cấp hoặc phân quyền vai trò: Admin, Nhân Viên Trực Quầy (Staff), hoặc Khách Hàng (User).
                  </p>
                </div>
                <button
                  onClick={fetchUsersData}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isUsersLoading ? "animate-spin text-[#d4af37]" : ""}`} />
                  <span>Cập nhật</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-[#16161e] text-zinc-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Tài Khoản</th>
                      <th className="py-3 px-4">Số Điện Thoại</th>
                      <th className="py-3 px-4">Vai Trò Hiện Tại</th>
                      <th className="py-3 px-4">Phân Cấp Quyền Hạn</th>
                      <th className="py-3 px-4">Ngày Tạo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {userList.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-900/40">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {u.avatar_url && (
                              <Image
                                src={u.avatar_url}
                                alt={u.full_name}
                                width={28}
                                height={28}
                                className="rounded-full bg-zinc-800 border border-zinc-700"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-white">{u.full_name || "Thành viên mới"}</p>
                              <p className="text-[10px] font-mono text-zinc-500">{u.id.slice(0, 13)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono">{u.phone || "—"}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                            u.role === "admin"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : u.role === "staff"
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}>
                            {u.role === "admin" ? "Quản Trị Viên" : u.role === "staff" ? "Nhân Viên Trực Quầy" : "Khách Hàng"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value as any)}
                            className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-[#d4af37]"
                          >
                            <option value="admin">Admin (Toàn Quyền)</option>
                            <option value="staff">Staff (Trực Quầy &amp; Báo Đơn)</option>
                            <option value="user">User (Khách Hàng Thường)</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-zinc-500 font-mono">
                          {new Date(u.created_at).toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: SẢN PHẨM & LIÊN KẾT ẢNH SUPABASE STORAGE ── */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#d4af37]" />
                    <span>Bộ Sưu Tập Đồng Hồ &amp; Liên Kết Ảnh Supabase Storage</span>
                  </h2>
                  <p className="text-xs text-zinc-400 font-light mt-0.5">
                    Dữ liệu được lưu trữ trực tiếp trong cơ sở dữ liệu Supabase và bucket hình ảnh <code className="text-[#d4af37]">anhsanphamzorenb</code>.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={fetchProductsData}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    title="Cập nhật danh sách từ database"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProductsLoading ? "animate-spin text-[#d4af37]" : ""}`} />
                    <span>Làm mới</span>
                  </button>

                  <button
                    onClick={() => {
                      setProductFormError(null);
                      setIsAddProductModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-gold-400/20 hover:scale-[1.02] transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Sản Phẩm Mới</span>
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(productsList.length > 0 ? productsList : ALL_WATCHES).map((w) => {
                  const firstImg =
                    w.images && w.images.length > 0
                      ? w.images[0]
                      : "https://ibkchkpqoriinoofzmpu.supabase.co/storage/v1/object/public/anhsanphamzorenb/watches/rolex-datejust-ai-special-50k/image-1.jpg";

                  return (
                    <div
                      key={w.id}
                      className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3.5 hover:border-[#d4af37]/50 transition-all group relative"
                    >
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-zinc-700/50">
                        <Image
                          src={firstImg}
                          alt={w.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af37] block truncate">
                          {w.brand} • Ref. {w.reference}
                        </span>
                        <h3 className="text-xs font-semibold text-zinc-100 truncate mt-0.5" title={w.name}>
                          {w.name}
                        </h3>
                        <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                          {formatPrice(w.price)} ₫
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Link
                            href={`/products/${w.id}`}
                            target="_blank"
                            className="text-[10px] text-zinc-400 hover:text-[#d4af37] inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Xem Trang Chi Tiết</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteProduct(w.id, w.name)}
                              className="text-[10px] text-rose-400/80 hover:text-rose-300 inline-flex items-center gap-1 transition-colors ml-auto"
                              title="Xóa sản phẩm này khỏi database"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: THÊM SẢN PHẨM MỚI VÀO CƠ SỞ DỮ LIỆU THẬT ── */}
        {isAddProductModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-[#101015] border border-zinc-700/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gold-400/15 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-wider text-zinc-100">
                      Thêm Sản Phẩm Mới Vào Database
                    </h2>
                    <p className="text-[11px] text-zinc-400 font-light">
                      Nhập thông tin kiệt tác đồng hồ để lưu trực tiếp vào cơ sở dữ liệu Supabase của dự án.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Error Banner */}
              {productFormError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                  {productFormError}
                </div>
              )}

              {/* Form Content */}
              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tên sản phẩm */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-300 block">
                      Tên Đồng Hồ <span className="text-[#d4af37]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Rolex Submariner Date 41mm 'Starbucks'"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-[#16161e] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Thương hiệu */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-300 block">
                      Thương Hiệu <span className="text-[#d4af37]">*</span>
                    </label>
                    <select
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      className="w-full bg-[#16161e] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="Rolex">Rolex</option>
                      <option value="Patek Philippe">Patek Philippe</option>
                      <option value="Audemars Piguet">Audemars Piguet</option>
                      <option value="Vacheron Constantin">Vacheron Constantin</option>
                      <option value="A. Lange & Söhne">A. Lange & Söhne</option>
                      <option value="Richard Mille">Richard Mille</option>
                      <option value="Jaeger-LeCoultre">Jaeger-LeCoultre</option>
                      <option value="Cartier">Cartier</option>
                      <option value="Omega">Omega</option>
                      <option value="IWC Schaffhausen">IWC Schaffhausen</option>
                    </select>
                  </div>

                  {/* Mã Reference */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-300 block">
                      Mã Reference
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 126610LV hoặc REF-001"
                      value={productForm.reference}
                      onChange={(e) => setProductForm({ ...productForm, reference: e.target.value })}
                      className="w-full bg-[#16161e] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Giá bán (VND) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-300 block">
                      Giá Bán (VNĐ) <span className="text-[#d4af37]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1000"
                      placeholder="Ví dụ: 50000 hoặc 450000000"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full bg-[#16161e] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Giá niêm yết gốc (VND) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-300 block">
                      Giá Gốc Niêm Yết (VNĐ - Tùy chọn)
                    </label>
                    <input
                      type="number"
                      min="1000"
                      placeholder="Ví dụ: 90000 hoặc 520000000"
                      value={productForm.original_price}
                      onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                      className="w-full bg-[#16161e] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Bộ máy Caliber */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-300 block">
                      Bộ Máy / Caliber
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Calibre 3235 Tự Động 70h cót"
                      value={productForm.caliber}
                      onChange={(e) => setProductForm({ ...productForm, caliber: e.target.value })}
                      className="w-full bg-[#16161e] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Tính năng / Complications */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-300 block">
                      Tính Năng (Phân cách bằng dấu phẩy)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Chronometer, Lịch Ngày, Chống Nước 300m"
                      value={productForm.complications}
                      onChange={(e) => setProductForm({ ...productForm, complications: e.target.value })}
                      className="w-full bg-[#16161e] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Mô tả sản phẩm */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-300 block">
                      Mô Tả Sản Phẩm
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Nhập mô tả chi tiết về xuất xứ, vật liệu vàng khối, kính sapphire, câu chuyện chế tác..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full bg-[#16161e] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Quản lý Hình Ảnh */}
                  <div className="space-y-2.5 sm:col-span-2 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-200 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Hình Ảnh Sản Phẩm ({productForm.images.length})</span>
                      </label>

                      {/* Nút Upload trực tiếp lên Supabase Storage */}
                      <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#d4af37] text-zinc-300 hover:text-zinc-950 font-semibold cursor-pointer transition-all inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingImage ? "Đang Tải Lên..." : "Tải File Lên Storage"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadImageFile}
                          disabled={isUploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Dán link URL ảnh */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Hoặc dán URL hình ảnh (Supabase / HTTPS)..."
                        value={productForm.imageUrlInput}
                        onChange={(e) => setProductForm({ ...productForm, imageUrlInput: e.target.value })}
                        className="flex-1 bg-[#16161e] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (productForm.imageUrlInput.trim()) {
                            setProductForm({
                              ...productForm,
                              images: [...productForm.images, productForm.imageUrlInput.trim()],
                              imageUrlInput: "",
                            });
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold"
                      >
                        Thêm
                      </button>
                    </div>

                    {/* Thumbnails preview */}
                    {productForm.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {productForm.images.map((imgUrl, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 bg-black group">
                            <Image src={imgUrl} alt={`Preview ${idx}`} fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setProductForm({
                                  ...productForm,
                                  images: productForm.images.filter((_, i) => i !== idx),
                                });
                              }}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddProductModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingProduct}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold uppercase tracking-wider shadow-lg shadow-gold-400/20 hover:scale-[1.01] transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSubmittingProduct ? "Đang Lưu Vào Database..." : "Lưu Sản Phẩm Vào Database"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
