import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export const runtime = "edge";

export async function POST(request: Request) {
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
    const name = formData.get("name") as string;
    const character = formData.get("character") as string;
    const products = formData.get("products") as string;
    const imageFile = formData.get("image") as File | null;
    const coverImageFile = formData.get("cover_image") as File | null;

    let imageUrl = null;
    let coverImageUrl = null;

    // 부스 이미지 업로드
    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("booth-images")
        .upload(fileName, imageFile, {
          contentType: imageFile.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("이미지 업로드 실패:", uploadError);
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from("booth-images").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }
    }

    // 배경 이미지 업로드
    if (coverImageFile) {
      const fileName = `${Date.now()}-${coverImageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("booth-images")
        .upload(fileName, coverImageFile, {
          contentType: coverImageFile.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("배경 이미지 업로드 실패:", uploadError);
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from("booth-images").getPublicUrl(fileName);
        coverImageUrl = publicUrl;
      }
    }

    // 부스 데이터 삽입
    const { data, error } = await supabase
      .from("booths")
      .insert([
        {
          name,
          character,
          products,
          image: imageUrl,
          cover_image: coverImageUrl,
        },
      ])
      .select();

    if (error) {
      console.error("부스 추가 실패:", error);
      return NextResponse.json(
        { error: "부스 추가에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("부스 추가 중 오류:", error);
    return NextResponse.json(
      { error: "부스 추가 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
