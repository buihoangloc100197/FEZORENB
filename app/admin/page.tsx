"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Shield, 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Search,
  Lock,
  Edit2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { ALL_WATCHES } from "@/data/watches";

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();

  // Active tab: "revenue" | "staff" | "products" | "orders"
  const [activeTab, setActiveTab] = useState<"revenue" | "staff" | "products">("revenue");

  // Staff & Users Management state
  const [staffList, setStaffList] = useState([
    {
      id: "usr_001",
      name: "Nguyễn Văn Admin",
      email: "admin@zorenb.com",
      role: "admin",
      department: "Ban Điều Hành Thượng Lưu",
      status: "Đang Hoạt Động",
      dateJoined: "01/01/2026",
    },
    {
      id: "usr_002",
      name: "Trần Thị Quản Gia",
      email: "concierge.lead@zorenb.com",
      role: "staff",
      department: "Quản Gia Boutique Geneva",
      status: "Đang Hoạt Động",
      dateJoined: "15/01/2026",
    },
    {
      id: "usr_003",
      name: "Lê Chuyên Viên Thẩm Định",
      email: "appraisal.cosc@zorenb.com",
      role: "staff",
      department: "Kiểm Định Kỹ Thuật COSC",
      status: "Đang Hoạt Động",
      dateJoined: "10/02/2026",
    },
    {
      id: "usr_004",
      name: "Bùi Khách VIP 1",
      email: "vip.collector@zorenb.com",
      role: "user",
      department: "Khách Hàng Hội Viên",
      status: "Đang Hoạt Động",
      dateJoined: "02/03/2026",
    },
  ]);

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "staff",
    department: "",
  });
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // Revenue metrics
  const totalRevenueUSD = 4680000;
  const totalOrders = 128;
  const avgOrderValue = Math.round(totalRevenueUSD / totalOrders);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) return;

    setStaffList((prev) => [
      ...prev,
      {
        id: "usr_" + Math.random().toString(36).substring(2, 7),
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        department: newStaff.department || "Nhân Sự Phục Vụ",
        status: "Đang Hoạt Động",
        dateJoined: new Date().toLocaleDateString("vi-VN"),
      },
    ]);

    setNewStaff({ name: "", email: "", role: "staff", department: "" });
    setShowAddStaffModal(false);
  };

  const handleRoleChange = (id: string, newRole: string) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, role: newRole } : s))
    );
  };

  // Access Control Guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-4 max-w-md p-8 rounded-2xl bg-[#101015] border border-rose-500/30">
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
            Khu vực này được bảo mật nghiêm ngặt và chỉ dành riêng cho tài khoản có vai trò <strong>Admin (Quản Trị Viên)</strong>.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] text-zinc-950 font-bold text-xs uppercase tracking-wider"
            >
              Đăng Nhập Tài Khoản Admin
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

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#101015] border border-zinc-800">
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
                  Trung Tâm Quản Trị ZORENB
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Toàn Quyền Admin
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 font-light mt-1">
              Quản lý doanh thu toàn cầu, phân cấp nhân viên và điều phối danh mục tuyệt tác.
            </p>
          </div>

          {/* Tab navigation */}
          <div className="flex items-center gap-2 bg-[#16161e] p-1.5 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab("revenue")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === "revenue"
                  ? "bg-gradient-to-r from-amber-400 to-[#d4af37] text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              Doanh Thu
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === "staff"
                  ? "bg-gradient-to-r from-amber-400 to-[#d4af37] text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              Nhân Viên &amp; Phân Quyền
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === "products"
                  ? "bg-gradient-to-r from-amber-400 to-[#d4af37] text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              Sản Phẩm ({ALL_WATCHES.length})
            </button>
          </div>
        </div>

        {/* ── TAB 1: REVENUE OVERVIEW ── */}
        {activeTab === "revenue" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs uppercase font-semibold tracking-wider">
                  <span>Tổng Doanh Thu</span>
                  <DollarSign className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-[#d4af37]">
                  ${formatPrice(totalRevenueUSD)}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  ≈ {formatPrice(totalRevenueUSD * 25400)} VNĐ qua cổng PayOS
                </div>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1 font-mono">
                  <TrendingUp className="w-3.5 h-3.5" /> +28.4% so với quý trước
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs uppercase font-semibold tracking-wider">
                  <span>Đơn Hàng Thành Công</span>
                  <Package className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-100">
                  {totalOrders} Kiệt Tác
                </div>
                <p className="text-[11px] text-zinc-400 pt-1">
                  100% Giao xe bọc thép VIP an toàn toàn cầu
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs uppercase font-semibold tracking-wider">
                  <span>Giá Trị Trung Bình / Đơn</span>
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-100">
                  ${formatPrice(avgOrderValue)}
                </div>
                <p className="text-[11px] text-zinc-400 pt-1">
                  Phân khúc Ultra-Luxury Haute Horlogerie
                </p>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
                Giao Dịch PayOS &amp; Đơn Đặt Hàng Gần Đây
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="text-zinc-500 uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Mã Đơn</th>
                      <th className="py-3 px-4">Khách Hàng</th>
                      <th className="py-3 px-4">Mẫu Đồng Hồ</th>
                      <th className="py-3 px-4">Trị Giá</th>
                      <th className="py-3 px-4">Cổng</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850 font-mono">
                    <tr className="hover:bg-zinc-900/40">
                      <td className="py-3 px-4 font-bold text-[#d4af37]">#ORD-99104</td>
                      <td className="py-3 px-4 font-sans text-zinc-200">Bùi Hoàng Lộc</td>
                      <td className="py-3 px-4 font-sans">Rolex Daytona 126500LN</td>
                      <td className="py-3 px-4 font-bold">$34,500</td>
                      <td className="py-3 px-4 text-emerald-400">PayOS QR</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          Đã thanh toán
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-900/40">
                      <td className="py-3 px-4 font-bold text-[#d4af37]">#ORD-99082</td>
                      <td className="py-3 px-4 font-sans text-zinc-200">Phạm Minh Đức</td>
                      <td className="py-3 px-4 font-sans">Patek Philippe Nautilus 5711</td>
                      <td className="py-3 px-4 font-bold">$142,000</td>
                      <td className="py-3 px-4 text-emerald-400">PayOS Banking</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          Đã thanh toán
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-900/40">
                      <td className="py-3 px-4 font-bold text-[#d4af37]">#ORD-99071</td>
                      <td className="py-3 px-4 font-sans text-zinc-200">Trần Đình Tuấn</td>
                      <td className="py-3 px-4 font-sans">Audemars Piguet Royal Oak</td>
                      <td className="py-3 px-4 font-bold">$68,000</td>
                      <td className="py-3 px-4 text-amber-400">PayOS Chờ Duyệt</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          Đang xử lý
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: STAFF & ROLES (Admin Request: "quản lý các cấp nhân viên") ── */}
        {activeTab === "staff" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-zinc-100">
                  Quản Lý Các Cấp Nhân Viên &amp; Phân Quyền Hệ Thống
                </h2>
                <p className="text-xs text-zinc-400 font-light mt-0.5">
                  Phân cấp vai trò: <strong>Admin</strong> (toàn quyền quản trị), <strong>Staff</strong> (nhân viên phục vụ/thẩm định), <strong>User</strong> (khách hàng).
                </p>
              </div>

              <button
                onClick={() => setShowAddStaffModal(true)}
                className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm Nhân Sự Mới</span>
              </button>
            </div>

            {/* Staff List Table */}
            <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="text-zinc-500 uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Nhân Sự</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Bộ Phận</th>
                      <th className="py-3 px-4">Cấp Bậc / Role</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {staffList.map((person) => (
                      <tr key={person.id} className="hover:bg-zinc-900/40">
                        <td className="py-3 px-4 font-semibold text-zinc-100 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gold-400/20 text-[#d4af37] border border-[#d4af37]/40 flex items-center justify-center font-bold text-xs">
                            {person.name.charAt(0)}
                          </div>
                          <span>{person.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-400">{person.email}</td>
                        <td className="py-3 px-4 text-zinc-300">{person.department}</td>
                        <td className="py-3 px-4">
                          <select
                            value={person.role}
                            onChange={(e) => handleRoleChange(person.id, e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 text-xs rounded-lg px-2 py-1 text-zinc-100 focus:border-[#d4af37] outline-none"
                          >
                            <option value="admin">Admin (Toàn Quyền)</option>
                            <option value="staff">Staff (Nhân Viên)</option>
                            <option value="user">User (Khách Hàng)</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {person.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                          {person.dateJoined}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Add Staff */}
            {showAddStaffModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-md p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
                    Bổ Nhiệm Cán Bộ Nhân Sự Mới
                  </h3>
                  <form onSubmit={handleAddStaff} className="space-y-3">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Họ và Tên</label>
                      <input
                        type="text"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                        required
                        placeholder="Nguyễn Văn B"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Email Công Vụ</label>
                      <input
                        type="email"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                        required
                        placeholder="staff.member@zorenb.com"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Bộ Phận</label>
                      <input
                        type="text"
                        value={newStaff.department}
                        onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                        placeholder="Phòng Thẩm Định / Quản Gia"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Phân Cấp Quyền Hạn</label>
                      <select
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                      >
                        <option value="staff">Staff - Nhân Viên Thẩm Định / Phục Vụ</option>
                        <option value="admin">Admin - Quản Trị Viên Toàn Quyền</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-full bg-[#d4af37] text-zinc-950 font-bold text-xs uppercase"
                      >
                        Lưu Nhân Sự
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddStaffModal(false)}
                        className="px-4 py-2.5 rounded-full bg-zinc-800 text-zinc-300 text-xs uppercase"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: PRODUCTS CATALOG ── */}
        {activeTab === "products" && (
          <div className="p-6 rounded-2xl bg-[#101015] border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-zinc-100">
                  Danh Mục Sản Phẩm 10 Thương Hiệu
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Dữ liệu được tổ chức theo từng hãng đồng hồ độc lập.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="text-zinc-500 uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Tên Tuyệt Tác</th>
                    <th className="py-3 px-4">Hãng</th>
                    <th className="py-3 px-4">Mã Ref</th>
                    <th className="py-3 px-4">Giá Niêm Yết</th>
                    <th className="py-3 px-4">Bộ Máy Caliber</th>
                    <th className="py-3 px-4">Complications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {ALL_WATCHES.map((w) => (
                    <tr key={w.id} className="hover:bg-zinc-900/40">
                      <td className="py-3 px-4 font-semibold text-zinc-100">{w.name}</td>
                      <td className="py-3 px-4 text-[#d4af37] font-semibold">{w.brand}</td>
                      <td className="py-3 px-4 font-mono text-zinc-400">{w.reference}</td>
                      <td className="py-3 px-4 font-mono font-bold text-zinc-100">${formatPrice(w.price)}</td>
                      <td className="py-3 px-4 font-mono text-zinc-500">{w.caliber}</td>
                      <td className="py-3 px-4 text-zinc-400 text-[11px]">{w.complications.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
