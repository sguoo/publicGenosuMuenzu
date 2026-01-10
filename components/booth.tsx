"use client"
import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface BoothProduct {
  id?: string
  name: string
  category: string
  price: string
  image: string | null
}

interface Booth {
  id: number | string
  icon?: string
  name: string
  image: string | null
  character: string
  products: string
  coverImage: string | null
  cover_image?: string | null
  boothProducts: BoothProduct[]
}

export default function Booth() {
  const [expandedBooth, setExpandedBooth] = useState<number | string | null>(null)
  const [booths, setBooths] = useState<Booth[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooths = async () => {
      try {
        const response = await fetch("/api/booths")
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          if (Array.isArray(data)) {
            const validBooths = data.map((booth) => ({
              ...booth,
              boothProducts: Array.isArray(booth.boothProducts) ? booth.boothProducts : [],
            }))
            setBooths(validBooths)
          } else {
            console.error("[v0] Invalid data format:", data)
            setBooths([])
          }
        } else {
          console.error("[v0] Non-JSON response received")
          setBooths([])
        }
      } catch (error) {
        console.error("[v0] Error fetching booths:", error)
        setBooths([])
      } finally {
        setLoading(false)
      }
    }

    fetchBooths()
  }, [])

  const getImageUrl = (imageUrl: string | null | undefined, query = "이미지") => {
    if (!imageUrl) {
      return `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(query)}`
    }
    return imageUrl
  }

  const toggleBooth = (id: number | string) => {
    setExpandedBooth(expandedBooth === id ? null : id)
  }

  if (loading) {
    return (
      <section id="booth" className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
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
          <p className="text-muted-foreground text-lg">등록된 부스가 없습니다.</p>
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
          <p className="text-muted-foreground text-lg">각 부스를 클릭하여 상품을 확인하세요</p>
        </div>

        <div className="space-y-3">
          {booths.map((booth) => (
            <div key={booth.id} className="border border-primary/20 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleBooth(booth.id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 transition"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-1">
                    <img
                      src={getImageUrl(booth.image, "부스아이콘") || "/placeholder.svg"}
                      alt={booth.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <h3 className="text-lg font-bold text-primary">{booth.name}</h3>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>🎨 주 캐릭터: {booth.character}</span>
                    <span>📦 다루는 상품: {booth.products}</span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-accent transition-transform flex-shrink-0 duration-300 ${
                    expandedBooth === booth.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedBooth === booth.id && (
                <div className="px-6 py-4 bg-background border-t border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                    <img
                      src={getImageUrl(booth.coverImage ?? booth.cover_image ?? null, "부스커버")}
                      alt={`${booth.name} cover`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h4 className="font-semibold text-accent mb-4">🛍️ 부스 상품</h4>
                  {booth.boothProducts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">등록된 상품이 없습니다.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {booth.boothProducts.map((product, idx) => (
                        <div
                          key={product.id || idx}
                          className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition"
                        >
                          <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                            <img
                              src={getImageUrl(product.image, "상품이미지") || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="p-3">
                            <div className="mb-2">
                              <span className="inline-block bg-primary/15 text-primary text-xs font-semibold px-3 py-1 rounded">
                                {product.category}
                              </span>
                            </div>

                            <h5 className="font-semibold text-sm text-foreground mb-2 line-clamp-2">{product.name}</h5>

                            <p className="text-primary font-bold text-sm">{product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
