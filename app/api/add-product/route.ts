import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "edge";

export async function POST(request: NextRequest) {
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
    const booth_id = formData.get("booth_id") as string;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const imageFile = formData.get("image") as File | null;

    if (!booth_id || !name || !category || !price) {
      return NextResponse.json(
        { error: "모든 필수 필드를 입력해주세요" },
        { status: 400 }
      );
    }

    let imageUrl = null;

    // 상품 이미지 업로드 (이미지가 있을 경우만)
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
        imageUrl = publicUrl;
      } else {
        console.error("이미지 업로드 실패:", uploadError);
      }
    }

    // 상품 데이터 삽입
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          booth_id,
          name,
          category,
          price,
          image: imageUrl,
        },
      ])
      .select();

    if (error) {
      console.error("[v0] Error inserting product:", error);
      return NextResponse.json(
        { error: "상품 데이터 추가 실패", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "상품 데이터 추가 성공", data });
  } catch (error) {
    console.error("[v0] Error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
