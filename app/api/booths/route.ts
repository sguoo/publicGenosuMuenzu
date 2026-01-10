export const runtime = 'edge';
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
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

    const { data, error } = await supabase.from("booths").select(`
        id,
        name,
        character,
        products,
        image,
        cover_image,
        products(id, name, category, price, image)
      `)

    if (error) {
      console.error("[v0] Error fetching booths:", error)
      return NextResponse.json({ error: "부스 데이터를 가져올 수 없습니다", booths: [] }, { status: 500 })
    }

    const formattedData =
      data?.map((booth: any) => ({
        ...booth,
        boothProducts: booth.products || [],
      })) || []

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("[v0] Error fetching booths:", error)
    return NextResponse.json({ error: "부스 데이터를 가져올 수 없습니다", booths: [] }, { status: 500 })
  }
}
