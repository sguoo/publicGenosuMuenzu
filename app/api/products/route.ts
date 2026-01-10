import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boothId = searchParams.get("booth_id")

    if (!boothId) {
      return NextResponse.json({ message: "부스 ID가 필요합니다" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const { data, error } = await supabase.from("products").select("*").eq("booth_id", boothId)

    if (error) {
      console.error("[v0] Error fetching products:", error)
      return NextResponse.json({ message: "상품 조회 실패", error: error.message }, { status: 400 })
    }

    return NextResponse.json({ products: data || [] })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const productData = await request.json()

    const { data, error } = await supabase.from("products").insert([productData]).select()

    if (error) {
      console.error("[v0] Error inserting product:", error)
      return NextResponse.json({ message: "상품 추가 실패", error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "상품 추가 성공", data })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const { id, ...productData } = await request.json()

    if (!id) {
      return NextResponse.json({ message: "상품 ID가 필요합니다" }, { status: 400 })
    }

    const { data, error } = await supabase.from("products").update(productData).eq("id", id).select()

    if (error) {
      console.error("[v0] Error updating product:", error)
      return NextResponse.json({ message: "상품 수정 실패", error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "상품 수정 성공", data })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ message: "상품 ID가 필요합니다" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting product:", error)
      return NextResponse.json({ message: "상품 삭제 실패", error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "상품 삭제 성공" })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
