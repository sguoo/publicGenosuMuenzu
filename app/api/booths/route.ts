import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET(request: Request) {
  const { env } = getRequestContext();
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const code = url.searchParams.get("code"); // 인증 코드 받기

  try {
    // 1. 로그인 요청 (이메일 + 인증코드)
    if (email && code) {
      const stmt = env.DB.prepare(
        "SELECT * FROM booths WHERE email = ? AND auth_code = ?"
      ).bind(email, code);
      const booth = await stmt.first();

      if (!booth) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          headers: { "Content-Type": "application/json" },
          status: 401, // 인증 실패
        });
      }

      return new Response(JSON.stringify({ booth }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. 이메일만 왔을 때 (보안상 이제 허용 안 함, 혹은 중복 체크용)
    else if (email) {
      return new Response(JSON.stringify({ error: "Auth code required" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 3. 전체 목록 조회 (공개용)
    // 보안상 공개 목록에는 'auth_code' 같은 민감 정보는 빼고 주는 게 좋습니다.
    const stmt = env.DB.prepare(
      "SELECT id, name, character, image, cover_image, products FROM booths"
    );
    const { results } = await stmt.all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "DB Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
