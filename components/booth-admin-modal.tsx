"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Pencil, Trash2, Plus, Upload } from "lucide-react"

interface BoothAdminModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

// 타입 정의 유지...
interface Product {
  id: string
  booth_id: string
  name: string
  category: string
  price: string
  image: string
}

interface Booth {
  id: string
  email: string
  name: string
  character: string
  products: string
  image: string
  cover_image: string
}

export default function BoothAdminModal({ isOpen, onClose, email }: BoothAdminModalProps) {
  const [activeTab, setActiveTab] = useState<"booth" | "product">("booth")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [existingBooth, setExistingBooth] = useState<Booth | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // 폼 State
  const [boothForm, setBoothForm] = useState({
    name: "",
    character: "",
    products: "", // 상품 목록 텍스트
    image: "",
    cover_image: "",
    email: email,
  })
  
  // 파일 객체 저장용 (전송 시 사용)
  const [boothFiles, setBoothFiles] = useState<{ image?: File; cover_image?: File }>({})

  const [productForm, setProductForm] = useState({
    booth_id: "",
    name: "",
    category: "",
    price: "",
    image: "",
  })

  // 내 부스 불러오기 (수정 모드 진입용)
  const loadBooth = async () => {
    if (!email) return;

    try {
      // 내 이메일로 된 부스가 있는지 조회
      const response = await fetch(`/api/booths?email=${encodeURIComponent(email)}`)
      const data = await response.json() // JSON 파싱

      if (response.ok && data.booth) {
        console.log("내 부스 발견:", data.booth)
        setExistingBooth(data.booth)
        
        // 폼에 데이터 채우기
        setBoothForm({
          name: data.booth.name,
          character: data.booth.character,
          products: data.booth.products || "",
          image: data.booth.image,
          cover_image: data.booth.cover_image,
          email: email,
        })
        setProductForm((prev) => ({ ...prev, booth_id: data.booth.id }))
      } else {
        console.log("등록된 부스 없음 (신규)")
        setExistingBooth(null)
      }
    } catch (err) {
      console.error("부스 로딩 에러:", err)
    }
  }

  // 상품 목록 불러오기
  const loadProducts = async (boothId: string) => {
    try {
      const response = await fetch(`/api/products?booth_id=${boothId}`)
      const data = await response.json()
      if (response.ok) {
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error("상품 로딩 에러:", err)
    }
  }

  // 부스 저장 (추가/수정 통합)
  const handleBoothSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // API 경로는 하나로 통일 (/api/add-booth)
      // 내부에서 ID 유무로 추가/수정을 판단합니다.
      const url = "/api/add-booth" 
      
      const formData = new FormData()
      
      // 수정일 경우 ID 포함
      if (existingBooth) {
        formData.append("id", existingBooth.id)
      }
      
      formData.append("name", boothForm.name)
      formData.append("character", boothForm.character)
      formData.append("products", boothForm.products)
      formData.append("email", email)

      if (boothFiles.image) formData.append("image", boothFiles.image)
      if (boothFiles.cover_image) formData.append("cover_image", boothFiles.cover_image)

      const response = await fetch(url, {
        method: "POST", // FormData 전송은 POST 사용
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || "저장 실패")

      setSuccess("저장되었습니다!")
      await loadBooth() // 저장 후 다시 불러와서 최신 상태 반영
      setBoothFiles({}) // 파일 초기화
      setTimeout(() => setSuccess(""), 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : "오류 발생")
    } finally {
      setLoading(false)
    }
  }

  // ... (상품 관련 함수들은 기존 JSON 방식 유지하거나 필요 시 수정)
  // handleProductSubmit, handleProductDelete 등은 기존 코드 사용 가능
  // 단, 상품 이미지 업로드도 파일로 하려면 위와 비슷하게 FormData로 변경 필요.
  // (현재 제공된 API 코드는 JSON 방식을 기준으로 작성됨)
  
  const handleProductSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      // ... (기존 로직 유지하되 API 경로 /api/products 확인)
      // 간단한 구현을 위해 여기서는 생략하나, 기존 코드가 작동할 것입니다.
      // (기존 코드의 url, method, body 부분만 체크하세요)
      
      // 간략화된 상품 추가 로직 예시:
      setLoading(true);
      try {
          const res = await fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(productForm) // 이미지가 URL 문자열이라고 가정
          });
          if(res.ok) {
              setSuccess("상품 추가됨");
              loadProducts(productForm.booth_id);
              setProductForm({...productForm, name:"", price:"", category:"", image:""});
          }
      } catch(e) { setError("실패"); }
      setLoading(false);
  }

  // 이미지 파일 선택 핸들러
  const handleBoothImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "cover_image") => {
    const file = e.target.files?.[0]
    if (!file) return

    // 미리보기 URL 생성
    const previewUrl = URL.createObjectURL(file)
    setBoothForm(prev => ({ ...prev, [type]: previewUrl }))
    
    // 전송용 파일 객체 저장
    setBoothFiles(prev => ({ ...prev, [type]: file }))
  }

  useEffect(() => {
    if (isOpen) {
      loadBooth()
    }
  }, [isOpen, email])

  useEffect(() => {
    if (activeTab === "product" && existingBooth) {
      loadProducts(existingBooth.id)
    }
  }, [activeTab, existingBooth])

  if (!isOpen) return null

  // ... (JSX 렌더링 부분은 기존 디자인 그대로 사용)
  // activeTab 전환 시 existingBooth가 없으면 경고 메시지 띄우는 부분 유지
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 및 탭 버튼 */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold">부스 관리</h2>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        
        <div className="flex border-b border-border">
             <button onClick={() => setActiveTab("booth")} className={`flex-1 p-3 ${activeTab === "booth" ? "text-primary border-b-2 border-primary" : ""}`}>부스 설정</button>
             <button onClick={() => setActiveTab("product")} className={`flex-1 p-3 ${activeTab === "product" ? "text-primary border-b-2 border-primary" : ""}`}>상품 관리</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
            {activeTab === "booth" && (
                <form onSubmit={handleBoothSubmit} className="space-y-4">
                    {/* ... 기존 input 필드들 ... */}
                    {/* 부스 이름 */}
                    <input value={boothForm.name} onChange={e => setBoothForm({...boothForm, name: e.target.value})} placeholder="부스 이름" className="w-full p-2 border rounded" required />
                    {/* 캐릭터명 */}
                    <input value={boothForm.character} onChange={e => setBoothForm({...boothForm, character: e.target.value})} placeholder="캐릭터명" className="w-full p-2 border rounded" required />
                    {/* 상품 목록 텍스트 */}
                    <textarea value={boothForm.products} onChange={e => setBoothForm({...boothForm, products: e.target.value})} placeholder="주요 상품 목록 (텍스트)" className="w-full p-2 border rounded" required />
                    
                    {/* 이미지 업로드 */}
                    <input type="file" onChange={e => handleBoothImageChange(e, "image")} accept="image/*" />
                    {boothForm.image && <img src={boothForm.image} className="w-32 h-32 object-cover" />}
                    
                    <input type="file" onChange={e => handleBoothImageChange(e, "cover_image")} accept="image/*" />
                    {boothForm.cover_image && <img src={boothForm.cover_image} className="w-full h-32 object-cover" />}
                    
                    {success && <p className="text-green-500">{success}</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    
                    <button type="submit" disabled={loading} className="w-full p-2 bg-primary text-white rounded">
                        {loading ? "저장 중..." : (existingBooth ? "부스 수정 저장" : "부스 생성")}
                    </button>
                </form>
            )}

            {activeTab === "product" && (
                <div>
                    {!existingBooth ? (
                        <p className="text-center py-10">먼저 부스를 등록(저장)해주세요.</p>
                    ) : (
                        <div>
                             {/* 상품 추가 폼 및 목록 (기존 코드 활용) */}
                             <p>상품 관리 기능이 활성화되었습니다.</p>
                             {/* ... */}
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  )
}