import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET() {
  const { env } = getRequestContext();

  try {
    // booths 테이블의 전체 줄(row) 수 세기
    const stmt = env.DB.prepare("SELECT COUNT(*) as count FROM booths");
    const result = await stmt.first();

    // 결과: { count: 42 } 형태
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ count: 0, error: error.message }), { status: 500 });
  }
}