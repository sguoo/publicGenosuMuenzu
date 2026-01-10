import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const dbPath = path.join(process.cwd(), "data", "booths.json");

    // 파일이 없으면 빈 배열 반환
    if (!fs.existsSync(dbPath)) {
        if (email) return NextResponse.json({ booth: null });
        return NextResponse.json([]);
    }

    const fileData = fs.readFileSync(dbPath, "utf-8");
    const allBooths = fileData ? JSON.parse(fileData) : [];

    // 이메일 파라미터가 있으면 해당 유저의 부스만 찾아서 반환 (수정 모드용)
    if (email) {
      const myBooth = allBooths.find((b: any) => b.email === email);
      return NextResponse.json({ booth: myBooth || null });
    }

    // 파라미터가 없으면 전체 목록 반환 (메인 페이지용)
    return NextResponse.json(allBooths);

  } catch (error) {
    console.error("[API] 부스 목록 로딩 실패:", error);
    return NextResponse.json({ error: "데이터 로딩 실패" }, { status: 500 });
  }
}