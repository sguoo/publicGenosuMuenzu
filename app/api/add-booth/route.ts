import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // 폼 데이터 추출
    const name = formData.get("name") as string;
    const character = formData.get("character") as string;
    const email = formData.get("email") as string;
    const products = formData.get("products") as string; // 상품 텍스트
    
    // id가 있으면 수정 모드라고 판단
    const id = formData.get("id") as string | null;

    const imageFile = formData.get("image") as File | null;
    const coverImageFile = formData.get("cover_image") as File | null;

    // 이미지 저장 헬퍼 함수
    const saveFile = async (file: File) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      // 파일명 충돌 방지를 위해 시간값 추가
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
      return `/uploads/${fileName}`; // 프론트에서 접근 가능한 경로 반환
    };

    let imageUrl = null;
    let coverImageUrl = null;

    if (imageFile) imageUrl = await saveFile(imageFile);
    if (coverImageFile) coverImageUrl = await saveFile(coverImageFile);

    // DB 파일 읽기
    const dbPath = path.join(process.cwd(), "data", "booths.json");
    if (!fs.existsSync(dbPath)) {
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(dbPath, "[]", "utf-8");
    }
    
    const fileData = fs.readFileSync(dbPath, "utf-8");
    let booths = fileData ? JSON.parse(fileData) : [];

    let resultBooth;

    // ID가 있고 기존 부스가 있다면 수정(Update)
    if (id) {
        const index = booths.findIndex((b: any) => b.id === id);
        if (index !== -1) {
            booths[index] = {
                ...booths[index],
                name,
                character,
                products,
                // 새 이미지가 없으면 기존 이미지 유지
                image: imageUrl || booths[index].image,
                cover_image: coverImageUrl || booths[index].cover_image,
                updatedAt: new Date().toISOString()
            };
            resultBooth = booths[index];
        }
    } 
    
    // 부스가 없거나 ID가 없으면 신규 생성(Create)
    if (!resultBooth) {
        // 이미 해당 이메일로 등록된 부스가 있는지 확인 (중복 방지)
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

    // 저장
    fs.writeFileSync(dbPath, JSON.stringify(booths, null, 2), "utf-8");

    return NextResponse.json({ success: true, data: resultBooth });

  } catch (error) {
    console.error("부스 저장 오류:", error);
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }
}