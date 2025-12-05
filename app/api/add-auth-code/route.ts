import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

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

    const authCodeData = await request.json()

    const { data, error } = await supabase.from("authentication_codes").insert([authCodeData])

    if (error) {
      console.error("[v0] Error inserting auth code:", error)
      return NextResponse.json({ message: "인증코드 추가 실패", error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "인증코드 추가 성공", data })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
