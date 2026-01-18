import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

interface RequestBody {
  email: string;
  character: string;
  booth_name: string;
  auth_code: string;
  product: string;
}

export async function POST(request: Request) {
  const { env } = getRequestContext();

  try {
    const body = await request.json() as RequestBody;
    const { email, character, booth_name, auth_code, product } = body;

    if (!email || !auth_code || !booth_name) {
      return new Response(JSON.stringify({ error: "필수 정보 누락" }), { status: 400 });
    }

    // ★ 1. UUID 자동 생성
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // ★ 2. 쿼리에 'id' 컬럼 추가
    const stmt = env.DB.prepare(
      `INSERT INTO booths (id, email, name, character, auth_code, products, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    // ★ 3. 바인딩 맨 앞에 id 추가
    await stmt.bind(id, email, booth_name, character, auth_code, product, now).run();

    return new Response(JSON.stringify({ success: true, id: id }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("D1 저장 에러:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}