import { NextResponse } from "next/server";

// ★ 배포 환경(Cloudflare)을 위한 설정
export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // 메모리에 저장된 데이터 가져오기 (없으면 빈 배열)
    // globalThis를 사용하여 서버가 켜져있는 동안은 데이터를 유지하려 시도합니다.
    const allBooths = (globalThis as any)._booths || [];

    if (email) {
      const myBooth = allBooths.find((b: any) => b.email === email);
      return NextResponse.json({ booth: myBooth || null });
    }

    return NextResponse.json(allBooths);

  } catch (error) {
    return NextResponse.json({ error: "데이터 로딩 실패" }, { status: 500 });
  }
}