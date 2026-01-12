import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function POST(request: Request) {
  const { env } = getRequestContext();

  // ★ 중요: 1단계에서 복사한 R2 공개 주소를 여기에 넣으세요 (마지막 슬래시 제외)
  const R2_PUBLIC_URL = "https://images.gensoumuenzu.com";

  try {
    const formData = await request.formData();

    // 폼 데이터 가져오기
    const email = formData.get("email") as string;
    const authCode = formData.get("auth_code") as string;
    const name = formData.get("name") as string;
    const character = formData.get("character") as string;
    const products = formData.get("products") as string;

    const imageFile = formData.get("image") as File | null;
    const coverFile = formData.get("cover_image") as File | null;

    if (!email || !authCode) {
      return new Response(
        JSON.stringify({ error: "인증 정보가 부족합니다." }),
        { status: 400 }
      );
    }

    // 1. 인증 확인
    const checkStmt = env.DB.prepare(
      "SELECT * FROM booths WHERE email = ? AND auth_code = ?"
    ).bind(email, authCode);
    const booth = await checkStmt.first();

    if (!booth) {
      return new Response(JSON.stringify({ error: "인증 실패" }), {
        status: 401,
      });
    }

    // ★ R2 업로드 헬퍼 함수
    // ★ R2 업로드 헬퍼 함수 (수정됨: 용량 제한 추가)
    const uploadToR2 = async (file: File, type: "main" | "cover") => {
      // 1. 용량 제한 (예: 20MB)
      const MAX_SIZE = 20 * 1024 * 1024; // 5MB

      if (file.size > MAX_SIZE) {
        throw new Error(
          `파일 용량이 너무 큽니다. (제한: 20MB, 현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
        );
      }

      // 2. 파일명 생성
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      // 파일 타입에서 확장자 추출 (없으면 jpg)
      const extension = file.type.split("/")[1] || "jpg";
      const filename = `${type}_${timestamp}_${random}.${extension}`;

      // 3. R2 업로드
      await env.BUCKET.put(filename, file);

      return `${R2_PUBLIC_URL}/${filename}`;
    };

    // 2. 이미지 처리 (파일이 있으면 R2로 보내고 URL 받기)
    let imageUrl = undefined;
    let coverUrl = undefined;

    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadToR2(imageFile, "main");
    }

    if (coverFile && coverFile.size > 0) {
      coverUrl = await uploadToR2(coverFile, "cover");
    }

    // 3. DB 업데이트 (Base64 대신 짧은 URL이 저장됨)
    let query = "UPDATE booths SET name = ?, character = ?, products = ?";
    const params: any[] = [name, character, products];

    if (imageUrl) {
      query += ", image = ?";
      params.push(imageUrl);
    }
    if (coverUrl) {
      query += ", cover_image = ?";
      params.push(coverUrl);
    }

    query += " WHERE email = ? AND auth_code = ?";
    params.push(email);
    params.push(authCode);

    await env.DB.prepare(query)
      .bind(...params)
      .run();

    // 4. 결과 반환
    const updatedBooth = await env.DB.prepare(
      "SELECT * FROM booths WHERE email = ?"
    )
      .bind(email)
      .first();

    return new Response(JSON.stringify({ success: true, data: updatedBooth }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("R2 Upload Error:", error);
    return new Response(
      JSON.stringify({
        error: `서버 오류: ${error.message}`,
      }),
      { status: 500 }
    );
  }
}
