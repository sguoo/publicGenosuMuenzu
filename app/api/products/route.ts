import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${file.type};base64,${btoa(binary)}`;
}

export async function GET(request: Request) {
  const { env } = getRequestContext();
  const { searchParams } = new URL(request.url);
  const boothId = searchParams.get("booth_id");

  try {
    let stmt;
    if (boothId) {
      stmt = env.DB.prepare("SELECT * FROM products WHERE booth_id = ? ORDER BY created_at DESC").bind(boothId);
    } else {
      stmt = env.DB.prepare("SELECT * FROM products ORDER BY created_at DESC");
    }
    const { results } = await stmt.all();
    return NextResponse.json({ products: results });
  } catch (error) {
    return NextResponse.json({ products: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    const formData = await request.formData();
    const id = formData.get("id") as string | null;
    const booth_id = formData.get("booth_id") as string;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const imageFile = formData.get("image") as File | null;

    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
        imageUrl = await fileToBase64(imageFile);
    }

    if (id) {
      // 수정
      let query = "UPDATE products SET name=?, category=?, price=? WHERE id=?";
      let params: any[] = [name, category, price, id];
      
      if (imageUrl) {
        query = "UPDATE products SET name=?, category=?, price=?, image=? WHERE id=?";
        params = [name, category, price, imageUrl, id];
      }
      await env.DB.prepare(query).bind(...params).run();
    } else {
      // 추가
      const newId = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      await env.DB.prepare(
        "INSERT INTO products (id, booth_id, name, category, price, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(newId, booth_id, name, category, price, imageUrl, createdAt).run();
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "상품 저장 실패" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { env } = getRequestContext();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if(!id) return NextResponse.json({error:"ID required"}, {status:400});

  try {
    await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}