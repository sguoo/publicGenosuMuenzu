import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "products.json");

// DB 읽기 헬퍼
const getProducts = () => {
    if (!fs.existsSync(DB_PATH)) return [];
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return data ? JSON.parse(data) : [];
};

// DB 쓰기 헬퍼
const saveProducts = (products: any[]) => {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2), "utf-8");
};

// 이미지 저장 헬퍼
const saveImage = async (file: File) => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `prod-${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, fileName), buffer);
    return `/uploads/${fileName}`;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const boothId = searchParams.get("booth_id");
    
    const products = getProducts();
    
    if (boothId) {
        const filtered = products.filter((p: any) => p.booth_id === boothId);
        return NextResponse.json({ products: filtered });
    }
    
    return NextResponse.json({ products });
}

export async function POST(request: Request) {
    try {
        // FormData 처리 (이미지 업로드를 위해 JSON 대신 FormData 사용 권장)
        // 하지만 기존 클라이언트 코드가 JSON을 보낸다면 request.json() 사용
        // 여기서는 에러 방지를 위해 둘 다 처리하도록 작성
        
        let body;
        const contentType = request.headers.get("content-type") || "";
        
        if (contentType.includes("application/json")) {
            body = await request.json();
        } else {
             return NextResponse.json({ error: "현재 JSON 형식만 지원합니다." }, { status: 400 });
        }

        const products = getProducts();
        const newProduct = {
            id: Date.now().toString(),
            ...body, // booth_id, name, price, category, image(url string)
            createdAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        saveProducts(products);
        
        return NextResponse.json({ success: true, product: newProduct });
    } catch (e) {
        return NextResponse.json({ error: "상품 추가 실패" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID 필요" }, { status: 400 });

    let products = getProducts();
    products = products.filter((p: any) => p.id !== id);
    saveProducts(products);
    
    return NextResponse.json({ success: true });
}