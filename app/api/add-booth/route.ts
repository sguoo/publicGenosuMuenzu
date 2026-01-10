import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

// 이미지 -> Base64 변환 함수
async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  // Edge 런타임에서는 Buffer 대신 Uint8Array 사용
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${file.type};base64,${btoa(binary)}`;
}

export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    const formData = await request.formData();
    
    const id = formData.get("id") as string | null;
    const name = formData.get("name") as string;
    const character = formData.get("character") as string;
    const email = formData.get("email") as string;
    const products = formData.get("products") as string;
    
    const imageFile = formData.get("image") as File | null;
    const coverImageFile = formData.get("cover_image") as File | null;

    let imageUrl = null;
    let coverImageUrl = null;

    if (imageFile && imageFile.size > 0) imageUrl = await fileToBase64(imageFile);
    if (coverImageFile && coverImageFile.size > 0) coverImageUrl = await fileToBase64(coverImageFile);

    if (id) {
      // 수정 (Update)
      let query = `UPDATE booths SET name = ?, character = ?, products = ? WHERE id = ?`;
      let params: any[] = [name, character, products, id];

      // 이미지가 있으면 쿼리 변경
      if (imageUrl && coverImageUrl) {
        query = `UPDATE booths SET name=?, character=?, products=?, image=?, cover_image=? WHERE id=?`;
        params = [name, character, products, imageUrl, coverImageUrl, id];
      } else if (imageUrl) {
        query = `UPDATE booths SET name=?, character=?, products=?, image=? WHERE id=?`;
        params = [name, character, products, imageUrl, id];
      } else if (coverImageUrl) {
        query = `UPDATE booths SET name=?, character=?, products=?, cover_image=? WHERE id=?`;
        params = [name, character, products, coverImageUrl, id];
      }

      await env.DB.prepare(query).bind(...params).run();
      
      // 업데이트된 데이터 조회해서 반환
      const updated = await env.DB.prepare("SELECT * FROM booths WHERE id = ?").bind(id).first();
      return NextResponse.json({ success: true, data: updated });

    } else {
      // 신규 추가 (Insert)
      // 중복 체크
      const existing = await env.DB.prepare("SELECT id FROM booths WHERE email = ?").bind(email).first();
      if (existing) {
        return NextResponse.json({ error: "이미 등록된 부스가 있습니다." }, { status: 400 });
      }

      const newId = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      await env.DB.prepare(
        "INSERT INTO booths (id, email, name, character, products, image, cover_image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(newId, email, name, character, products, imageUrl, coverImageUrl, createdAt).run();

      const newBooth = await env.DB.prepare("SELECT * FROM booths WHERE id = ?").bind(newId).first();
      return NextResponse.json({ success: true, data: newBooth });
    }

  } catch (error) {
    console.error("Save Error:", error);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}