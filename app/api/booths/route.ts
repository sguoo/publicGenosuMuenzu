import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export const runtime = "edge";

export async function GET() {
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

    // 부스 데이터와 관련 상품 가져오기
    const { data: boothsData, error: boothsError } = await supabase
      .from("booths")
      .select("id, name, character, products, image, cover_image");

    if (boothsError) {
      console.error("[booths] Error fetching booths:", boothsError);
      return NextResponse.json(
        { message: "부스 데이터를 가져올 수 없습니다" },
        { status: 500 }
      );
    }

    // 각 부스에 대한 상품 가져오기
    const boothsWithProducts = await Promise.all(
      (boothsData || []).map(async (booth) => {
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("id, name, category, price, image")
          .eq("booth_id", booth.id);

        if (productsError) {
          console.error(
            `[booths] Error fetching products for booth ${booth.id}:`,
            productsError
          );
        }

        return {
          ...booth,
          boothProducts: productsData || [],
        };
      })
    );

    return NextResponse.json(boothsWithProducts);
  } catch (error) {
    console.error("[booths] Error:", error);
    return NextResponse.json(
      { message: "부스 데이터를 가져올 수 없습니다" },
      { status: 500 }
    );
  }
}
