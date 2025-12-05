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

    const productData = await request.json();

    const { data, error } = await supabase
      .from("products")
      .insert([productData]);

    if (error) {
      console.error("[v0] Error inserting product:", error);
      return NextResponse.json(
        { message: "상품 데이터 추가 실패", error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "상품 데이터 추가 성공", data });
  } catch (error) {
    console.error("[v0] Error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
