"use client"

import { useState, useEffect, useRef } from "react"
import { X, Upload, Save, LogOut } from "lucide-react"
import Image from "next/image"

interface BoothAdminModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  onLogout?: () => void
}

// ★ 타입 정의 추가
interface Booth {
  id: string;
  name: string;
  character: string;
  products: string;
  image: string;
  cover_image: string;
}

interface FetchResponse {
  booth?: Booth;
  error?: string;
}

interface SaveResponse {
  success?: boolean;
  data?: Booth;
  error?: string;
}

export default function BoothAdminModal({ isOpen, onClose, email, onLogout }: BoothAdminModalProps) {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  
  // 데이터 상태
  const [id, setId] = useState("") 
  const [name, setName] = useState("")
  const [character, setCharacter] = useState("")
  const [products, setProducts] = useState("")
  
  // 이미지 상태
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>("")

  const imageInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && email) {
      fetchMyBooth()
    }
  }, [isOpen, email])

  const fetchMyBooth = async () => {
    setFetchLoading(true)
    try {
      const res = await fetch(`/api/booths?email=${email}`)
      // ★ 타입 단언 (unknown -> FetchResponse)
      const data = (await res.json()) as FetchResponse
      
      if (data.booth) {
        setId(data.booth.id || "")
        setName(data.booth.name || "")
        setCharacter(data.booth.character || "")
        setProducts(data.booth.products || "")
        
        if (data.booth.image) setImagePreview(data.booth.image)
        if (data.booth.cover_image) setCoverPreview(data.booth.cover_image)
      }
    } catch (error) {
      console.error("데이터 불러오기 실패", error)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isCover = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) { 
      alert("이미지 크기는 5MB 이하여야 합니다.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (isCover) {
        setCoverFile(file)
        setCoverPreview(reader.result as string)
      } else {
        setImageFile(file)
        setImagePreview(reader.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("name", name)
      formData.append("character", character)
      formData.append("products", products)
      
      if (id) formData.append("id", id)
      
      if (imageFile) formData.append("image", imageFile)
      if (coverFile) formData.append("cover_image", coverFile)

      const res = await fetch("/api/add-booth", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("저장 실패")
      
      // ★ 타입 단언 (unknown -> SaveResponse)
      const result = (await res.json()) as SaveResponse
      
      if (result.data && result.data.id) {
        setId(result.data.id)
      }
      
      alert("성공적으로 저장되었습니다!")
      onClose()
      
    } catch (error) {
      console.error(error)
      alert("저장 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative flex flex-col">
        
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background/95 backdrop-blur z-10">
          <div>
            <h2 className="text-xl font-bold">부스 정보 관리</h2>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="flex gap-2">
             {onLogout && (
              <button 
                onClick={onLogout}
                className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <LogOut size={16} /> 로그아웃
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {fetchLoading ? (
          <div className="p-20 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">정보를 불러오는 중입니다...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">부스 이름 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="부스 이름을 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">대표 캐릭터 / 장르</label>
              <input
                type="text"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="예: 레이무, 마리사"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">판매 굿즈 / 회지 목록</label>
              <textarea
                value={products}
                onChange={(e) => setProducts(e.target.value)}
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px] resize-none"
                placeholder="판매하는 물품들을 쉼표(,)나 줄바꿈으로 구분해서 적어주세요."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">대표 이미지 (정사각형 권장)</label>
                <div 
                  onClick={() => imageInputRef.current?.click()}
                  className="aspect-square bg-muted/30 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden relative group"
                >
                  {imagePreview ? (
                    <>
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="mb-2 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">이미지 업로드</span>
                    </>
                  )}
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">커버 이미지 (가로형)</label>
                <div 
                  onClick={() => coverInputRef.current?.click()}
                  className="aspect-video bg-muted/30 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden relative group"
                >
                  {coverPreview ? (
                    <>
                      <Image src={coverPreview} alt="Cover Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="mb-2 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">배경 이미지 업로드</span>
                    </>
                  )}
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, true)} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? "저장 중..." : <><Save size={18} /> 정보 저장하기</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}