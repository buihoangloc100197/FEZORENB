import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

function getAuthorizedRole(req: NextRequest): "admin" | "staff" | null {
  const sessionCookie = req.cookies.get("zorenb_session");
  if (!sessionCookie?.value) return null;
  try {
    const user = JSON.parse(sessionCookie.value);
    if (user.role === "admin" || user.role === "staff") {
      return user.role;
    }
  } catch {
    return null;
  }
  return null;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ products: [] });
    }

    const db = getServiceSupabase();
    const { data: products, error } = await db
      .from("products")
      .select("id, name, brand, reference, price, original_price, images, caliber, complications, description, rating, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = getAuthorizedRole(req);
    if (!role) {
      return NextResponse.json({ error: "Truy cập bị từ chối. Chỉ dành cho Quản trị viên." }, { status: 403 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Cơ sở dữ liệu Supabase chưa được kết nối." }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const { name, brand, reference, price, original_price, images, caliber, complications, description } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Vui lòng nhập tên sản phẩm." }, { status: 400 });
    }

    if (!brand || typeof brand !== "string" || brand.trim().length === 0) {
      return NextResponse.json({ error: "Vui lòng chọn thương hiệu đồng hồ." }, { status: 400 });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json({ error: "Giá bán sản phẩm phải là số tiền lớn hơn 0." }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanBrand = brand.trim();
    const cleanRef = (reference && typeof reference === "string") ? reference.trim() : "REF-" + Math.floor(1000 + Math.random() * 9000);
    const numOrigPrice = original_price ? Number(original_price) : null;
    const cleanCaliber = (caliber && typeof caliber === "string") ? caliber.trim() : "Calibre Tự Động Thụy Sĩ";
    const cleanDesc = (description && typeof description === "string") ? description.trim() : ("Kiệt tác đồng hồ " + cleanName + " chế tác chính hãng từ " + cleanBrand + ".");

    let cleanImages = [];
    if (Array.isArray(images) && images.length > 0) {
      cleanImages = images.filter((img) => typeof img === "string" && img.trim().length > 0);
    }
    if (cleanImages.length === 0) {
      cleanImages = [
        "https://ibkchkpqoriinoofzmpu.supabase.co/storage/v1/object/public/anhsanphamzorenb/watches/rolex-datejust-ai-special-50k/image-1.jpg"
      ];
    }

    let cleanComplications = [];
    if (Array.isArray(complications)) {
      cleanComplications = complications.filter((c) => typeof c === "string" && c.trim().length > 0);
    } else if (typeof complications === "string" && complications.trim().length > 0) {
      cleanComplications = complications.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (cleanComplications.length === 0) {
      cleanComplications = ["Perpetual", "Chronometer"];
    }

    const baseSlug = slugify(cleanBrand + " " + cleanName);
    const uniqueSlug = baseSlug + "-" + Math.random().toString(36).substring(2, 6);

    const db = getServiceSupabase();

    const productPayload = {
      id: uniqueSlug,
      name: cleanName,
      brand: cleanBrand,
      reference: cleanRef,
      price: numPrice,
      original_price: numOrigPrice,
      images: cleanImages,
      caliber: cleanCaliber,
      complications: cleanComplications,
      description: cleanDesc,
      rating: 5,
      created_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await db
      .from("products")
      .insert(productPayload)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Lỗi lưu vào Supabase: " + insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Đã thêm sản phẩm " + cleanName + " thành công vào cơ sở dữ liệu!",
      product: inserted,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi máy chủ: " + (error?.message || String(error)) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const role = getAuthorizedRole(req);
    if (role !== "admin") {
      return NextResponse.json({ error: "Chỉ Quản trị viên cấp cao mới có quyền xóa sản phẩm." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu mã id sản phẩm cần xóa." }, { status: 400 });
    }

    const db = getServiceSupabase();
    const { error } = await db.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm " + id + " thành công." });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
