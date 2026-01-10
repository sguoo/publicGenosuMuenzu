"use client"
import { useState, useEffect } from "react"
import { ChevronDown, MapPin, Package, User } from "lucide-react"

interface BoothProduct {
  id?: string
  name: string
  category: string
  price: string
  image: string | null
}

interface Booth {
  id: string
  email: string
  name: string
  character: string
  products: string
  image: string | null
  cover_image: string | null
  // LocalStorage 저장 구조에 맞춤
}

export default function Booth() {
  const [expandedBooth, setExpandedBooth] = useState<string | null>(null)
  const [booths, setBooths] = useState<Booth[]>([])
  const [loading, setLoading] = useState(true)

  // ★ 수정 포인트: API 호출 대신 LocalStorage에서 데이터 가져오기
  useEffect(() => {
    const loadBooths = () => {
      try {
        const storedBooths = localStorage.getItem("booths")
        const storedProducts = localStorage.getItem("products")

        if (storedBooths) {
          const parsedBooths: Booth[] = JSON.parse(storedBooths)
          // 최신순으로 보여주기 (reverse)
          setBooths(parsedBooths.reverse())
        } else {
          setBooths([])
        }
      } catch (error) {
        console.error("부스 불러오기 실패:", error)
        setBooths([])
      } finally {
        setLoading(false)
      }
    }

    loadBooths()
    
    // 데이터 변경 감지 (다른 탭에서 수정했을 때 반영)
    window.addEventListener("storage", loadBooths)
    return () => window.removeEventListener("storage", loadBooths)
  }, [])

  const toggleBooth = (id: string) => {
    setExpandedBooth(expandedBooth === id ? null : id)
  }

  // 상품 목록 가져오기 헬퍼 함수
  const getBoothProducts = (boothId: string) => {
    if (typeof window === "undefined") return []
    const storedProducts = localStorage.getItem("products")
    if (!storedProducts) return []
    const allProducts = JSON.parse(storedProducts)
    return allProducts.filter((p: any) => p.booth_id === boothId)
  }

  if (loading) {
    return (
      <section id="booth" className="py-20 px-4 min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">부스 목록 로딩 중...</div>
      </section>
    )
  }

  if (booths.length === 0) {
    return (
      <section id="booth" className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">참가 부스</span>
          </h2>
          <div className="p-10 border-2 border-dashed border-muted rounded-xl bg-muted/10">
            <p className="text-muted-foreground text-lg">아직 등록된 부스가 없습니다.</p>
            <p className="text-sm text-muted-foreground mt-2">부스 참가자라면 관리자 메뉴에서 부스를 등록해주세요!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="booth" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">참가 부스</span>
          </h2>
          <p className="text-muted-foreground text-lg">클릭하여 부스 상세 정보와 굿즈를 확인하세요</p>
        </div>

        <div className="grid gap-6">
          {booths.map((booth) => {
            const products = getBoothProducts(booth.id)
            const isExpanded = expandedBooth === booth.id
            
            return (
              <div 
                key={booth.id} 
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                  isExpanded ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-border hover:border-primary/50"
                }`}
              >
                <button
                  onClick={() => toggleBooth(booth.id)}
                  className="w-full px-6 py-5 flex items-center justify-between bg-card hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    {/* 부스 썸네일 */}
                    <div className="w-16 h-16 rounded-full bg-muted flex-shrink-0 overflow-hidden border border-border">
                      <img 
                        src={booth.image || "/placeholder.svg"} 
                        alt={booth.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
                        <h3 className="text-xl font-bold text-foreground truncate">{booth.name}</h3>
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary w-fit">
                          {booth.character}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground truncate">
                        <span className="flex items-center gap-1">
                           <Package size={14} /> 
                           {booth.products}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronDown
                    className={`w-6 h-6 text-muted-foreground transition-transform duration-300 flex-shrink-0 ml-4 ${
                      isExpanded ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {/* 상세 영역 */}
                <div 
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-6 pt-0 border-t border-border bg-muted/5">
                      {/* 커버 이미지 */}
                      {booth.cover_image && (
                        <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden mb-8 mt-6 shadow-sm">
                          <img
                            src={booth.cover_image}
                            alt={`${booth.name} cover`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="mb-4 mt-6">
                         <h4 className="font-bold text-lg flex items-center gap-2 mb-4">
                           <Package className="text-primary" size={20} />
                           판매 굿즈 목록
                         </h4>
                      </div>

                      {products.length === 0 ? (
                        <div className="text-center py-10 bg-background rounded-xl border border-dashed border-muted">
                          <p className="text-muted-foreground">등록된 상세 상품 이미지가 없습니다.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {products.map((product: any, idx: number) => (
                            <div
                              key={product.id || idx}
                              className="bg-background rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow group"
                            >
                              <div className="aspect-square bg-muted overflow-hidden relative">
                                <img
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                                  {product.category}
                                </div>
                              </div>
                              <div className="p-4">
                                <h5 className="font-bold text-foreground mb-1 line-clamp-1">{product.name}</h5>
                                <p className="text-primary font-semibold">{product.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}