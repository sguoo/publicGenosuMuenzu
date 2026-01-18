import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

// ★ 설정: R2 공개 주소 (부스 이미지 때 썼던 것과 동일)
const R2_PUBLIC_URL = "https://images.gensoumuenzu.com"; // 혹은 r2.dev 주소

// 1. 상품 목록 가져오기 (GET)
export async function GET(request: Request) {
  const { env } = getRequestContext();
  const url = new URL(request.url);
  const boothId = url.searchParams.get("booth_id");

  if (!boothId) {
    return new Response(JSON.stringify({ error: "부스 ID가 필요합니다." }), { status: 400 });
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM products WHERE booth_id = ? ORDER BY created_at DESC"
    ).bind(boothId).all();

    return new Response(JSON.stringify({ products: results }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// 2. 상품 추가하기 (POST) - ★ R2 업로드 적용됨
export async function POST(request: Request) {
  const { env } = getRequestContext();

  try {
    const formData = await request.formData();
    
    const boothId = formData.get("booth_id") as string;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const imageFile = formData.get("image") as File | null;

    if (!boothId || !name) {
      return new Response(JSON.stringify({ error: "필수 정보 누락" }), { status: 400 });
    }

    // --- R2 업로드 로직 시작 ---
    let imageUrl = null;

    if (imageFile && imageFile.size > 0) {
       // 1. 용량 제한 (80MB)
       if (imageFile.size > 80 * 1024 * 1024) {
         throw new Error("이미지 용량이 너무 큽니다. (80MB 제한)");
       }

       // 2. 파일명 생성 (겹치지 않게)
       const timestamp = Date.now();
       const random = Math.random().toString(36).substring(7);
       const extension = imageFile.type.split('/')[1] || 'jpg';
       const filename = `product_${boothId}_${timestamp}_${random}.${extension}`;

       // 3. R2에 업로드
       await env.BUCKET.put(filename, imageFile);

       // 4. URL 완성
       imageUrl = `${R2_PUBLIC_URL}/${filename}`;
    }
    // --- R2 업로드 로직 끝 ---

    // DB에 저장 (이미지는 URL만 저장)
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.DB.prepare(
      "INSERT INTO products (id, booth_id, name, category, price, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, boothId, name, category, price, imageUrl, now).run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: "상품 저장 실패: " + e.message }), { status: 500 });
  }
}

// 3. 상품 삭제하기 (DELETE)
export async function DELETE(request: Request) {
  const { env } = getRequestContext();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) return new Response(JSON.stringify({ error: "ID 누락" }), { status: 400 });

  try {
    // (선택사항) R2에서 이미지 파일도 지우려면 여기서 SELECT로 url 조회 후 env.BUCKET.delete(key) 하면 됨.
    // 지금은 DB 데이터만 삭제합니다.
    await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}