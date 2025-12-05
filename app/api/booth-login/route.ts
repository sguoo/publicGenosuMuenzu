import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { email, authCode } = await request.json();

    if (!email || !authCode) {
      return NextResponse.json(
        { message: "이메일과 인증코드를 입력해주세요" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
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

    // Supabase에서 인증코드 확인
    const { data, error } = await supabase
      .from("authentication_codes")
      .select("*")
      .eq("email", email)
      .eq("code", authCode)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { message: "이메일 또는 인증코드가 잘못되었습니다" },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");

    return NextResponse.json({
      token,
      email,
      message: "로그인 성공",
    });
  } catch (error) {
    console.error("[v0] Booth login error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
