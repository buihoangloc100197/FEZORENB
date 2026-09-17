import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("zorenb_session");
    let currentUser: any = null;

    if (sessionCookie?.value) {
      try {
        currentUser = JSON.parse(sessionCookie.value);
      } catch {
        currentUser = null;
      }
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    const fallbackUserId = formData.get("userId") as string | null;
    const fallbackEmail = formData.get("userEmail") as string | null;

    // If cookie was not passed or expired on custom domain, fallback to client state
    if (!currentUser && fallbackUserId) {
      currentUser = {
        id: fallbackUserId,
        email: fallbackEmail || "",
        fullName: "",
        role: "user",
      };
    }

    if (!currentUser?.id) {
      return NextResponse.json({ error: "Chua dang nhap." }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: "Khong co file anh." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Kich thuoc anh toi da la 5MB." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Chi chap nhan dinh dang JPG, PNG, WebP, GIF." },
        { status: 400 }
      );
    }

    const adminClient = getServiceSupabase();
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${currentUser.id}/avatar.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload avatar to Supabase Storage bucket 'anhavatar'
    let { error: uploadError } = await adminClient.storage
      .from("anhavatar")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError && uploadError.message.toLowerCase().includes("bucket not found")) {
      // Create the bucket as public if needed
      await adminClient.storage.createBucket("anhavatar", {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      });

      // Retry upload after bucket creation
      const retryResult = await adminClient.storage
        .from("anhavatar")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
        });
      uploadError = retryResult.error;
    }

    if (uploadError) {
      // Fallback: lưu Base64 vào avatar_url trong profiles (nếu lỗi Storage)
      const base64 = buffer.toString("base64");
      const avatarDataUrl = `data:${file.type};base64,${base64}`;

      await adminClient
        .from("profiles")
        .update({ avatar_url: avatarDataUrl, updated_at: new Date().toISOString() })
        .eq("id", currentUser.id);

      const updatedUser = { ...currentUser, avatarUrl: avatarDataUrl };
      const fallbackResponse = NextResponse.json({ success: true, avatarUrl: avatarDataUrl });
      fallbackResponse.cookies.set("zorenb_session", JSON.stringify(updatedUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return fallbackResponse;
    }

    const { data: publicData } = adminClient.storage
      .from("anhavatar")
      .getPublicUrl(filePath);

    const avatarUrl = publicData.publicUrl;

    await adminClient
      .from("profiles")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("id", currentUser.id);

    const updatedUser = { ...currentUser, avatarUrl };

    const response = NextResponse.json({ success: true, avatarUrl });
    response.cookies.set("zorenb_session", JSON.stringify(updatedUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Loi may chu: " + error.message },
      { status: 500 }
    );
  }
}
