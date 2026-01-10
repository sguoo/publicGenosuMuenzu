"use client"

import { useState, useEffect, useRef } from "react"
import { X, Upload, Save, LogOut, Plus, Trash2 } from "lucide-react"
import Image from "next/image"

interface BoothAdminModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  onLogout?: () => void
}

interface Booth {
  id: string;
  name: string;
  character: string;
  products: string; 
  image: string;
  cover_image: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
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

// ★ 추가됨: 상품 목록 응답 타입 정의
interface ProductListResponse {
  products?: Product[];
  error?: string;
}

export default function BoothAdminModal({ isOpen, onClose, email, onLogout }: BoothAdminModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "products">("info")
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  
  // --- 부스 정보 상태 ---
  const [id, setId] = useState("") 
  const [name, setName] = useState("")
  const [character, setCharacter] = useState("")
  const [description, setDescription] = useState("") 
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>("")

  // --- 상품(굿즈) 관리 상태 ---
  const [productList, setProductList] = useState<Product[]>([])
  const [newProdName, setNewProdName] = useState("")
  const [newProdCategory, setNewProdCategory] = useState("")
  const [newProdPrice, setNewProdPrice] = useState("")
  const [newProdImage, setNewProdImage] = useState<File | null>(null)
  const [newProdPreview, setNewProdPreview] = useState("")
  const [prodLoading, setProdLoading] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const prodImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && email) {
      fetchMyBooth()
    }
  }, [isOpen, email])

  // 1. 내 부스 정보 가져오기
  const fetchMyBooth = async () => {
    setFetchLoading(true)
    try {
      const res = await fetch(`/api/booths?email=${email}`)
      const data = (await res.json()) as FetchResponse
      
      if (data.booth) {
        setId(data.booth.id || "")
        setName(data.booth.name || "")
        setCharacter(data.booth.character || "")
        setDescription(data.booth.products || "") 
        
        if (data.booth.image) setImagePreview(data.booth.image)
        if (data.booth.cover_image) setCoverPreview(data.booth.cover_image)

        if (data.booth.id) {
          fetchProducts(data.booth.id)
        }
      }
    } catch (error) {
      console.error("데이터 로딩 실패", error)
    } finally {
      setFetchLoading(false)
    }
  }

  // 2. 상품 목록 가져오기
  const fetchProducts = async (boothId: string) => {
    try {
      const res = await fetch(`/api/products?booth_id=${boothId}`)
      // ★ 수정됨: 타입 단언 추가 (unknown -> ProductListResponse)
      const data = (await res.json()) as ProductListResponse
      setProductList(data.products || [])
    } catch (error) {
      console.error("상품 로딩 실패", error)
    }
  }

  // 3. 부스 정보 저장
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("name", name)
      formData.append("character", character)
      formData.append("products", description) 
      if (id) formData.append("id", id)
      if (imageFile) formData.append("image", imageFile)
      if (coverFile) formData.append("cover_image", coverFile)

      const res = await fetch("/api/add-booth", { method: "POST", body: formData })
      
      // ★ 수정됨: 타입 단언 추가 (unknown -> SaveResponse)
      const result = (await res.json()) as SaveResponse
      
      if (result.success) {
        if (result.data?.id) setId(result.data.id)
        alert("부스 정보가 저장되었습니다.")
      }
    } catch (e) {
      alert("저장 실패")
    } finally {
      setLoading(false)
    }
  }

  // 4. 상품 추가
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return alert("먼저 부스 정보를 저장해주세요.")
    
    setProdLoading(true)
    try {
      const formData = new FormData()
      formData.append("booth_id", id)
      formData.append("name", newProdName)
      formData.append("category", newProdCategory)
      formData.append("price", newProdPrice)
      if (newProdImage) formData.append("image", newProdImage)

      await fetch("/api/products", { method: "POST", body: formData })
      
      // 입력창 초기화 및 목록 갱신
      setNewProdName("")
      setNewProdCategory("")
      setNewProdPrice("")
      setNewProdImage(null)
      setNewProdPreview("")
      fetchProducts(id)
    } catch (e) {
      alert("상품 추가 실패")
    } finally {
      setProdLoading(false)
    }
  }

  // 5. 상품 삭제
  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return
    try {
      await fetch(`/api/products?id=${prodId}`, { method: "DELETE" })
      fetchProducts(id)
    } catch (e) {
      alert("삭제 실패")
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'cover' | 'product') => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'main') { setImageFile(file); setImagePreview(reader.result as string) }
      else if (type === 'cover') { setCoverFile(file); setCoverPreview(reader.result as string) }
      else { setNewProdImage(file); setNewProdPreview(reader.result as string) }
    }
    reader.readAsDataURL(file)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold">부스 관리</h2>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="flex gap-2">
             {onLogout && (
              <button onClick={onLogout} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium">
                <LogOut size={16} /> 로그아웃
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex border-b shrink-0">
          <button 
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "info" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            기본 정보
          </button>
          <button 
            onClick={() => setActiveTab("products")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "products" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            상품(굿즈) 관리
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="overflow-y-auto p-6">
          {fetchLoading ? (
            <div className="py-20 text-center text-muted-foreground">로딩 중...</div>
          ) : activeTab === "info" ? (
            // --- 탭 1: 부스 정보 ---
            <form onSubmit={handleSaveInfo} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">대표 이미지</label>
                  <div onClick={() => imageInputRef.current?.click()} className="aspect-square bg-muted/30 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-muted/50 relative overflow-hidden">
                    {imagePreview ? <Image src={imagePreview} alt="Preview" fill className="object-cover" /> : <Upload className="text-muted-foreground" />}
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'main')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">커버 이미지</label>
                  <div onClick={() => coverInputRef.current?.click()} className="aspect-video bg-muted/30 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-muted/50 relative overflow-hidden">
                    {coverPreview ? <Image src={coverPreview} alt="Preview" fill className="object-cover" /> : <Upload className="text-muted-foreground" />}
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'cover')} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">부스 이름</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-lg bg-background" required />
                </div>
                <div>
                  <label className="text-sm font-medium">대표 캐릭터/장르</label>
                  <input type="text" value={character} onChange={e => setCharacter(e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-lg bg-background" />
                </div>
                <div>
                  <label className="text-sm font-medium">부스 소개 (한줄 평)</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-lg bg-background resize-none h-24" />
                </div>
              </div>
              
              <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90">
                {loading ? "저장 중..." : "정보 저장"}
              </button>
            </form>
          ) : (
            // --- 탭 2: 상품 관리 ---
            <div className="space-y-8">
               {/* 상품 추가 폼 */}
               <form onSubmit={handleAddProduct} className="p-4 border rounded-xl bg-muted/10 space-y-4">
                  <h3 className="font-bold flex items-center gap-2"><Plus size={18}/> 새 상품 추가</h3>
                  <div className="flex gap-4 items-start">
                    <div onClick={() => prodImageInputRef.current?.click()} className="w-20 h-20 bg-muted border-dashed border-2 rounded-lg flex items-center justify-center cursor-pointer shrink-0 relative overflow-hidden">
                       {newProdPreview ? <Image src={newProdPreview} alt="Prod" fill className="object-cover" /> : <Upload size={16} />}
                       <input ref={prodImageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'product')} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input placeholder="상품명 (예: 레이무 아크릴)" value={newProdName} onChange={e => setNewProdName(e.target.value)} className="w-full px-3 py-2 border rounded bg-background text-sm" required />
                      <div className="flex gap-2">
                        <input placeholder="종류 (예: 굿즈)" value={newProdCategory} onChange={e => setNewProdCategory(e.target.value)} className="flex-1 px-3 py-2 border rounded bg-background text-sm" />
                        <input placeholder="가격 (예: 10,000원)" value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} className="flex-1 px-3 py-2 border rounded bg-background text-sm" />
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={prodLoading} className="w-full py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90">
                    {prodLoading ? "추가 중..." : "리스트에 추가"}
                  </button>
               </form>

               {/* 상품 목록 */}
               <div className="space-y-2">
                 <h3 className="font-bold text-sm text-muted-foreground">등록된 상품 ({productList.length})</h3>
                 {productList.length === 0 ? (
                   <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">등록된 상품이 없습니다.</div>
                 ) : (
                   <div className="grid gap-3">
                     {productList.map((prod) => (
                       <div key={prod.id} className="flex items-center gap-3 p-3 border rounded-lg bg-background group">
                         <div className="w-12 h-12 bg-muted rounded-md relative overflow-hidden shrink-0">
                           {prod.image && <Image src={prod.image} alt={prod.name} fill className="object-cover" />}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="font-medium truncate">{prod.name}</div>
                           <div className="text-xs text-muted-foreground">{prod.category} | {prod.price}</div>
                         </div>
                         <button type="button" onClick={() => handleDeleteProduct(prod.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                           <Trash2 size={16} />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}