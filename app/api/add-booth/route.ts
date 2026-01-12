import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function POST(request: Request) {
  const { env } = getRequestContext();

  try {
    const formData = await request.formData();

    // 폼 데이터 가져오기
    const email = formData.get("email") as string;
    const authCode = formData.get("auth_code") as string; // ★ 인증 코드 확인
    const name = formData.get("name") as string;
    const character = formData.get("character") as string;
    const products = formData.get("products") as string; // 부스 설명

    const imageFile = formData.get("image") as File | null;
    const coverFile = formData.get("cover_image") as File | null;

    if (!email || !authCode) {
      return new Response(
        JSON.stringify({ error: "인증 정보가 부족합니다." }),
        { status: 400 }
      );
    }

    // 1. 보안 검사: 이메일과 인증 코드가 일치하는 부스가 있는지 확인
    const checkStmt = env.DB.prepare(
      "SELECT * FROM booths WHERE email = ? AND auth_code = ?"
    ).bind(email, authCode);
    const booth = await checkStmt.first();

    if (!booth) {
      return new Response(
        JSON.stringify({ error: "인증에 실패했습니다. 코드를 확인해주세요." }),
        { status: 401 }
      );
    }

    // 2. 이미지 처리 (Base64 변환)
    let imageBase64 = undefined;
    let coverBase64 = undefined;

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      imageBase64 = `data:${imageFile.type};base64,${base64}`;
    }

    if (coverFile && coverFile.size > 0) {
      const arrayBuffer = await coverFile.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      coverBase64 = `data:${coverFile.type};base64,${base64}`;
    }

    // 3. DB 업데이트 실행
    // 인증 코드까지 조건절에 넣어서 확실하게 본인 것만 수정
    let query = "UPDATE booths SET name = ?, character = ?, products = ?";
    const params: any[] = [name, character, products];

    if (imageBase64) {
      query += ", image = ?";
      params.push(imageBase64);
    }
    if (coverBase64) {
      query += ", cover_image = ?";
      params.push(coverBase64);
    }

    query += " WHERE email = ? AND auth_code = ?";
    params.push(email);
    params.push(authCode);

    await env.DB.prepare(query)
      .bind(...params)
      .run();

    // 4. 업데이트된 최신 정보 반환
    const updatedBooth = await env.DB.prepare(
      "SELECT * FROM booths WHERE email = ?"
    )
      .bind(email)
      .first();

    return new Response(JSON.stringify({ success: true, data: updatedBooth }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "서버 내부 오류가 발생했습니다." }),
      { status: 500 }
    );
  }
}
