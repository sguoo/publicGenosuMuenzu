import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "edge";

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const formData = await request.formData();
    const boothId = formData.get("booth_id") as string;
    const name = formData.get("name") as string;
    const character = formData.get("character") as string;
    const products = formData.get("products") as string;
    const imageFile = formData.get("image") as File | null;
    const coverImageFile = formData.get("cover_image") as File | null;

    if (!boothId) {
      return NextResponse.json(
        { error: "부스 ID가 필요합니다" },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      character,
      products,
    };

    // 부스 이미지 업로드 (새 이미지가 있을 경우만)
    if (imageFile && imageFile.size > 0) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const fileBuffer = await imageFile.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("booth-images")
        .upload(fileName, fileBuffer, {
          contentType: imageFile.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("booth-images").getPublicUrl(fileName);
        updateData.image = publicUrl;
      }
    }

    // 배경 이미지 업로드 (새 이미지가 있을 경우만)
    if (coverImageFile && coverImageFile.size > 0) {
      const fileName = `${Date.now()}-${coverImageFile.name}`;
      const fileBuffer = await coverImageFile.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("booth-images")
        .upload(fileName, fileBuffer, {
          contentType: coverImageFile.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("booth-images").getPublicUrl(fileName);
        updateData.cover_image = publicUrl;
      }
    }

    // 부스 데이터 업데이트
    const { data, error } = await supabase
      .from("booths")
      .update(updateData)
      .eq("id", boothId)
      .select();

    if (error) {
      console.error("부스 수정 실패:", error);
      return NextResponse.json(
        { error: "부스 수정에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("부스 수정 중 오류:", error);
    return NextResponse.json(
      { error: "부스 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
