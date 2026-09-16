import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // Auth check — admin only
    const sessionCookie = req.cookies.get("zorenb_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Chua dang nhap." }, { status: 401 });
    }
    const currentUser = JSON.parse(sessionCookie.value);
    if (currentUser.role !== "admin" && currentUser.role !== "staff") {
      return NextResponse.json({ error: "Khong co quyen." }, { status: 403 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase chua duoc cau hinh." }, { status: 503 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const productId = formData.get("productId") as string | null;

    if (!file) return NextResponse.json({ error: "Khong co file." }, { status: 400 });
    if (!productId) return NextResponse.json({ error: "Thieu productId." }, { status: 400 });

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Anh toi da 10MB." }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Chi chap nhan JPG, PNG, WebP, GIF." }, { status: 400 });
    }

    const adminClient = getServiceSupabase();
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const filePath = `${productId}/${timestamp}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload product image to Supabase Storage bucket 'anhsanphamzorenb'
    let { error: uploadError } = await adminClient.storage
      .from("anhsanphamzorenb")
      .upload(filePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError && uploadError.message.toLowerCase().includes("bucket not found")) {
      await adminClient.storage.createBucket("anhsanphamzorenb", {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      });
      const retry = await adminClient.storage
        .from("anhsanphamzorenb")
        .upload(filePath, buffer, { contentType: file.type, upsert: false });
      uploadError = retry.error;
    }

    if (uploadError) {
      return NextResponse.json({ error: "Loi upload: " + uploadError.message }, { status: 500 });
    }

    const { data: publicData } = adminClient.storage
      .from("anhsanphamzorenb")
      .getPublicUrl(filePath);

    const imageUrl = publicData.publicUrl;

    // Append URL to images[] array in products table
    const { data: product, error: fetchErr } = await adminClient
      .from("products")
      .select("images")
      .eq("id", productId)
      .single();

    if (fetchErr || !product) {
      return NextResponse.json({ error: "San pham khong ton tai trong DB." }, { status: 404 });
    }

    const updatedImages = [...(product.images || []), imageUrl];

    await adminClient
      .from("products")
      .update({ images: updatedImages })
      .eq("id", productId);

    return NextResponse.json({ success: true, imageUrl, images: updatedImages });
  } catch (error: any) {
    return NextResponse.json({ error: "Loi may chu: " + error.message }, { status: 500 });
  }
}
