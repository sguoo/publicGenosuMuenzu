"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Booth {
  id: string;
  name: string;
  character: string;
  image: string;
  cover_image: string;
  products: string; // 설명
}

export default function BoothsPage() {
  const [booths, setBooths] = useState<Booth[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // D1에서 부스 목록 가져오기
    const fetchBooths = async () => {
      try {
        const res = await fetch("/api/booths")
        const data = await res.json()
        // API 결과가 배열인지 확인
        if (Array.isArray(data)) {
          setBooths(data)
        } else {
          console.error("데이터 형식이 올바르지 않습니다:", data)
        }
      } catch (error) {
        console.error("부스 목록 로딩 실패:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooths()
  }, [])

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* 헤더 섹션 */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> 메인으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold mb-4">참가 부스 목록</h1>
          <p className="text-muted-foreground">환상몽원도에 참가하는 모든 부스를 확인하세요.</p>
        </div>

        {/* 목록 섹션 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-muted/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : booths.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-xl">
            <p className="text-lg text-muted-foreground">아직 등록된 부스가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {booths.map((booth) => (
              <div key={booth.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* 커버 이미지 */}
                <div className="relative h-32 bg-muted">
                  {booth.cover_image && (
                    <Image src={booth.cover_image} alt={booth.name} fill className="object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                
                {/* 프로필 및 정보 */}
                <div className="p-6 pt-0 relative">
                  <div className="flex justify-between items-end -mt-10 mb-4">
                    <div className="w-20 h-20 bg-background rounded-xl p-1 shadow-lg relative overflow-hidden">
                      {booth.image ? (
                        <Image src={booth.image} alt={booth.name} fill className="object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-full bg-muted rounded-lg" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{booth.name}</h3>
                  <p className="text-sm text-primary font-medium mb-3">{booth.character}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                    {booth.products || "등록된 소개가 없습니다."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}