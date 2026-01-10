import { NextResponse } from "next/server";

// ★ 배포 환경을 위한 설정
export const runtime = "edge";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const boothId = searchParams.get("booth_id");
    
    const allProducts = (globalThis as any)._products || [];
    
    if (boothId) {
        const filtered = allProducts.filter((p: any) => p.booth_id === boothId);
        return NextResponse.json({ products: filtered });
    }
    
    return NextResponse.json({ products: allProducts });
}

export async function POST(request: Request) {
    try {
        let body;
        const contentType = request.headers.get("content-type") || "";
        
        if (contentType.includes("application/json")) {
            body = await request.json();
        } else {
             return NextResponse.json({ error: "JSON만 지원합니다" }, { status: 400 });
        }

        if (!(globalThis as any)._products) {
            (globalThis as any)._products = [];
        }
        const products = (globalThis as any)._products;

        const newProduct = {
            id: Date.now().toString(),
            ...body,
            createdAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        
        return NextResponse.json({ success: true, product: newProduct });
    } catch (e) {
        return NextResponse.json({ error: "상품 추가 실패" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID 필요" }, { status: 400 });

    if ((globalThis as any)._products) {
        (globalThis as any)._products = (globalThis as any)._products.filter((p: any) => p.id !== id);
    }
    
    return NextResponse.json({ success: true });
}