import { NextResponse } from "next/server";

// ★ 배포 환경을 위한 설정
export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const character = formData.get("character") as string;
    const email = formData.get("email") as string;
    const products = formData.get("products") as string;
    const id = formData.get("id") as string | null;

    // ★ 주의: Cloudflare Edge에서는 파일을 디스크에 저장할 수 없습니다.
    // 이미지는 실제 저장은 안 되고, 폼만 통과시킵니다.
    // (필요하다면 나중에 Supabase Storage나 AWS S3 같은 별도 서비스를 써야 합니다)
    const imageFile = formData.get("image") as File | null;
    const coverImageFile = formData.get("cover_image") as File | null;

    // 임시 이미지 URL 생성 (실제 파일은 아님)
    const imageUrl = imageFile ? "/placeholder.svg" : null;
    const coverImageUrl = coverImageFile ? "/placeholder.svg" : null;

    // 전역 변수에 데이터 저장소 초기화
    if (!(globalThis as any)._booths) {
        (globalThis as any)._booths = [];
    }
    const booths = (globalThis as any)._booths;

    let resultBooth;

    if (id) {
        // 수정
        const index = booths.findIndex((b: any) => b.id === id);
        if (index !== -1) {
            booths[index] = {
                ...booths[index],
                name,
                character,
                products,
                // 새 이미지가 들어오면 업데이트, 아니면 유지
                image: imageUrl || booths[index].image,
                cover_image: coverImageUrl || booths[index].cover_image,
                updatedAt: new Date().toISOString()
            };
            resultBooth = booths[index];
        }
    }
    
    if (!resultBooth) {
        // 신규 추가
        // 중복 방지
        const existing = booths.find((b: any) => b.email === email);
        if (existing) {
             return NextResponse.json({ error: "이미 등록된 부스가 있습니다." }, { status: 400 });
        }

        const newBooth = {
            id: Date.now().toString(),
            email,
            name,
            character,
            products,
            image: imageUrl,
            cover_image: coverImageUrl,
            createdAt: new Date().toISOString()
        };
        booths.push(newBooth);
        resultBooth = newBooth;
    }

    return NextResponse.json({ success: true, data: resultBooth });

  } catch (error) {
    console.error("저장 오류:", error);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}