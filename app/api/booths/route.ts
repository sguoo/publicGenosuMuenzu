import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { env } = getRequestContext();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    let stmt;
    if (email) {
      // 내 부스 찾기
      stmt = env.DB.prepare("SELECT * FROM booths WHERE email = ?").bind(email);
    } else {
      // 전체 부스 조회
      stmt = env.DB.prepare("SELECT * FROM booths ORDER BY created_at DESC");
    }

    const { results } = await stmt.all();

    if (email) {
      return NextResponse.json({ booth: results[0] || null });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("D1 Error:", error);
    return NextResponse.json({ error: "데이터 로딩 실패" }, { status: 500 });
  }
}