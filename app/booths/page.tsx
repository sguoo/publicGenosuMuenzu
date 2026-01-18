"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ChevronDown, Box } from "lucide-react"

// --- 데이터 타입 정의 ---
interface Booth {
  id: string;
  name: string;
  character: string; 
  image: string;     
  cover_image: string; 
  products: string;  
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
}

// ★ 에러 해결을 위한 응답 타입 정의
interface ProductListResponse {
  products?: Product[];
  error?: string;
}

export default function BoothsPage() {
  const [booths, setBooths] = useState<Booth[]>([])
  const [loading, setLoading] = useState(true)
  
  // 아코디언 상태 관리
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // 각 부스별 상품 목록 캐싱
  const [boothProducts, setBoothProducts] = useState<Record<string, Product[]>>({})
  const [loadingProducts, setLoadingProducts] = useState<string | null>(null)

  // 1. 부스 목록 불러오기
  useEffect(() => {
    const fetchBooths = async () => {
      try {
        const res = await fetch("/api/booths")
        
        // ★ 수정됨: 타입 단언 (unknown -> Booth[])
        const data = (await res.json()) as Booth[]
        
        if (Array.isArray(data)) {
          setBooths(data)
        }
      } catch (error) {
        console.error("부스 목록 로딩 실패:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBooths()
  }, [])

  // 2. 부스 클릭 시 (펼치기/접기 + 상품 불러오기)
  const toggleBooth = async (boothId: string) => {
    if (expandedId === boothId) {
      setExpandedId(null) // 이미 열려있으면 닫기
      return
    }

    setExpandedId(boothId) // 열기

    // 상품 데이터가 없으면 불러오기
    if (!boothProducts[boothId]) {
      setLoadingProducts(boothId)
      try {
        const res = await fetch(`/api/products?booth_id=${boothId}`)
        
        // ★ 수정됨: 타입 단언 (unknown -> ProductListResponse)
        const data = (await res.json()) as ProductListResponse
        
        setBoothProducts(prev => ({
          ...prev,
          [boothId]: data.products || []
        }))
      } catch (error) {
        console.error("상품 로딩 실패:", error)
      } finally {
        setLoadingProducts(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl"> 
        
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> 메인으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold mb-2">참가 부스 목록</h1>
          <p className="text-muted-foreground">환상몽원도에 참가하는 부스를 클릭하여 굿즈를 확인하세요.</p>
        </div>

        {/* 리스트 섹션 */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : booths.length === 0 ? (
          <div className="text-center py-20 bg-muted/10 border border-dashed rounded-xl">
            <p className="text-lg text-muted-foreground">아직 등록된 부스가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {booths.map((booth) => {
              const isExpanded = expandedId === booth.id
              const products = boothProducts[booth.id] || []
              const isLoadingProd = loadingProducts === booth.id

              return (
                <div 
                  key={booth.id} 
                  className={`bg-card border rounded-xl overflow-hidden transition-all duration-300 ${
                    isExpanded ? "border-primary ring-1 ring-primary/20 shadow-lg" : "border-border hover:border-primary/50"
                  }`}
                >
                  {/* --- 부스 헤더 (항상 보임) --- */}
                  <div 
                    onClick={() => toggleBooth(booth.id)}
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    {/* 프로필 아이콘 */}
                    <div className="w-14 h-14 bg-muted rounded-full overflow-hidden shrink-0 border border-border relative">
                      {booth.image ? (
                        <Image src={booth.image} alt={booth.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground text-xs font-bold">
                          {booth.name.substring(0, 1)}
                        </div>
                      )}
                    </div>

                    {/* 이름 및 태그 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold truncate">{booth.name}</h3>
{/* --- 수정된 캐릭터 배지 부분 시작 --- */}
                        {booth.character && (
                          <div className="relative group shrink-0">
                            {/* 1. 평소에 보이는 배지 (공간 부족시 ... 처리) */}
                            <span className="block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full truncate max-w-[150px] cursor-help">
                              {booth.character}
                            </span>

                            {/* 2. 마우스 호버 시 나타나는 툴팁 (전체 텍스트) */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[200px] bg-gray-900 text-white text-xs rounded px-2 py-1 z-50 shadow-xl whitespace-normal break-words text-center">
                              {booth.character}
                              {/* 말풍선 꼬리 */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                        {/* --- 수정된 캐릭터 배지 부분 끝 --- */}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {booth.products || "부스 소개가 없습니다."}
                      </p>
                    </div>

                    {/* 화살표 아이콘 */}
                    <div className={`text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                      <ChevronDown />
                    </div>
                  </div>

                  {/* --- 확장 영역 (클릭 시 보임) --- */}
                  <div 
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-border bg-muted/5 p-6">
                        
                        {/* 1. 커버(배너) 이미지 */}
                        {booth.cover_image && (
                          <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden mb-6 shadow-md bg-black/20">
                            <Image src={booth.cover_image} alt="Banner" fill className="object-cover" />
                          </div>
                        )}

                        {/* 2. 부스 상세 설명 */}
                        {booth.products && (
                          <div className="mb-8 text-sm leading-relaxed text-foreground/90 bg-background/50 p-4 rounded-lg border">
                             {booth.products}
                          </div>
                        )}

                        {/* 3. 판매 굿즈 목록 */}
                        <div>
                          <h4 className="flex items-center gap-2 font-bold mb-4 text-primary">
                            <Box size={18} /> 판매 굿즈 목록
                          </h4>

                          {isLoadingProd ? (
                            <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
                              굿즈 정보를 불러오는 중...
                            </div>
                          ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {products.map((prod) => (
                                <div key={prod.id} className="group relative bg-background border rounded-lg overflow-hidden hover:shadow-md transition-all">
                                  <div className="aspect-square bg-muted relative overflow-hidden">
                                    {prod.image ? (
                                      <Image src={prod.image} alt={prod.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No Image</div>
                                    )}
                                  </div>
                                  <div className="p-3">
                                    <div className="font-bold text-sm truncate mb-0.5">{prod.name}</div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-muted-foreground truncate max-w-[60%]">{prod.category}</span>
                                      <span className="text-xs font-medium text-primary">{prod.price}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-sm text-muted-foreground bg-background rounded-lg border border-dashed">
                              등록된 굿즈 정보가 없습니다.
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}