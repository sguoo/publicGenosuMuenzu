"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Pencil, Trash2, Plus, Upload, Image as ImageIcon, Save, Package } from "lucide-react"
import { toast } from "sonner" // 토스트 메시지 라이브러리 (없으면 alert로 대체 가능)

interface BoothAdminModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

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
  const [existingBooth, setExistingBooth] = useState<Booth | null>(null)
  
  // 데이터 목록
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // 부스 폼 데이터
  const [boothForm, setBoothForm] = useState({
    name: "",
    character: "",
    products: "",
    image: "",
    cover_image: "",
  })

  // 상품 폼 데이터
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    price: "",
    image: "",
  })

  // ★ 초기 로딩: LocalStorage에서 데이터 가져오기
  useEffect(() => {
    if (isOpen && email) {
      const storedBooths = localStorage.getItem("booths")
      const storedProducts = localStorage.getItem("products")

      if (storedBooths) {
        const booths: Booth[] = JSON.parse(storedBooths)
        const myBooth = booths.find((b) => b.email === email)
        if (myBooth) {
          setExistingBooth(myBooth)
          setBoothForm({
            name: myBooth.name,
            character: myBooth.character,
            products: myBooth.products,
            image: myBooth.image,
            cover_image: myBooth.cover_image,
          })
          
          // 내 부스의 상품 불러오기
          if (storedProducts) {
            const allProducts: Product[] = JSON.parse(storedProducts)
            const myProducts = allProducts.filter(p => p.booth_id === myBooth.id)
            setProducts(myProducts)
          }
        } else {
          setExistingBooth(null)
          setProducts([])
        }
      }
    }
  }, [isOpen, email])

  // 이미지 파일을 Base64 문자열로 변환 (브라우저 저장용)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      callback(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // ★ 부스 저장 핸들러
  const handleBoothSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 기존 데이터 로드
    const storedBooths = localStorage.getItem("booths")
    let booths: Booth[] = storedBooths ? JSON.parse(storedBooths) : []

    let newBoothData: Booth

    if (existingBooth) {
      // 수정
      newBoothData = { ...existingBooth, ...boothForm }
      booths = booths.map(b => b.id === existingBooth.id ? newBoothData : b)
      toast.success("부스 정보가 수정되었습니다!")
    } else {
      // 신규 등록
      newBoothData = {
        id: Date.now().toString(),
        email,
        ...boothForm
      }
      booths.push(newBoothData)
      toast.success("부스가 성공적으로 개설되었습니다!")
    }

    // 저장
    localStorage.setItem("booths", JSON.stringify(booths))
    setExistingBooth(newBoothData)
    setLoading(false)
  }

  // ★ 상품 저장 핸들러
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!existingBooth) return

    const storedProducts = localStorage.getItem("products")
    let allProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : []

    if (editingProduct) {
      // 수정
      allProducts = allProducts.map(p => 
        p.id === editingProduct.id ? { ...p, ...productForm } : p
      )
      toast.success("상품이 수정되었습니다.")
    } else {
      // 추가
      const newProduct: Product = {
        id: Date.now().toString(),
        booth_id: existingBooth.id,
        ...productForm
      }
      allProducts.push(newProduct)
      toast.success("상품이 등록되었습니다.")
    }

    localStorage.setItem("products", JSON.stringify(allProducts))
    
    // 상태 업데이트
    const myProducts = allProducts.filter(p => p.booth_id === existingBooth.id)
    setProducts(myProducts)
    
    // 폼 초기화
    setProductForm({ name: "", category: "", price: "", image: "" })
    setEditingProduct(null)
  }

  // 상품 삭제 핸들러
  const handleDeleteProduct = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return

    const storedProducts = localStorage.getItem("products")
    let allProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : []
    allProducts = allProducts.filter(p => p.id !== id)

    localStorage.setItem("products", JSON.stringify(allProducts))
    
    // 상태 업데이트
    if (existingBooth) {
      setProducts(allProducts.filter(p => p.booth_id === existingBooth.id))
    }
    toast.success("상품이 삭제되었습니다.")
  }

  // 수정 모드 진입
  const startEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center p-5 border-b border-border bg-muted/20">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">부스 관리자</h2>
            <p className="text-sm text-muted-foreground mt-1">
               {existingBooth ? "부스 정보를 수정하고 상품을 관리하세요." : "새로운 부스를 개설해보세요!"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={24} className="text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex border-b border-border bg-background">
          <button
            onClick={() => setActiveTab("booth")}
            className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
              activeTab === "booth" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🏠 부스 설정
            {activeTab === "booth" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
          </button>
          <button
            onClick={() => setActiveTab("product")}
            className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
              activeTab === "product" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📦 상품 관리
            {activeTab === "product" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
          
          {/* --- 부스 설정 탭 --- */}
          {activeTab === "booth" && (
            <form onSubmit={handleBoothSubmit} className="space-y-6 max-w-2xl mx-auto">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">부스 이름</label>
                  <input
                    value={boothForm.name}
                    onChange={(e) => setBoothForm({ ...boothForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none"
                    placeholder="예: 환상향 상점"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">대표 캐릭터</label>
                  <input
                    value={boothForm.character}
                    onChange={(e) => setBoothForm({ ...boothForm, character: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none"
                    placeholder="예: 하쿠레이 레이무"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">주요 취급 품목 (요약)</label>
                <input
                  value={boothForm.products}
                  onChange={(e) => setBoothForm({ ...boothForm, products: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none"
                  placeholder="예: 일러스트북, 아크릴 스탠드, 키링"
                  required
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon size={16} /> 부스 썸네일 (정사각형)
                  </label>
                  <div className="relative group cursor-pointer border-2 border-dashed border-input hover:border-primary rounded-xl overflow-hidden h-40 flex items-center justify-center bg-muted/30 transition-colors">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, (url) => setBoothForm({ ...boothForm, image: url }))} accept="image/*" />
                    {boothForm.image ? (
                      <img src={boothForm.image} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-muted-foreground p-4">
                        <Upload className="mx-auto mb-2 opacity-50" />
                        <span className="text-xs">클릭하여 이미지 업로드</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon size={16} /> 배경 커버 이미지
                  </label>
                  <div className="relative group cursor-pointer border-2 border-dashed border-input hover:border-primary rounded-xl overflow-hidden h-40 flex items-center justify-center bg-muted/30 transition-colors">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, (url) => setBoothForm({ ...boothForm, cover_image: url }))} accept="image/*" />
                    {boothForm.cover_image ? (
                      <img src={boothForm.cover_image} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-muted-foreground p-4">
                        <Upload className="mx-auto mb-2 opacity-50" />
                        <span className="text-xs">클릭하여 이미지 업로드</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {existingBooth ? "부스 정보 수정 저장" : "부스 개설하기"}
              </button>
            </form>
          )}

          {/* --- 상품 관리 탭 --- */}
          {activeTab === "product" && (
            <div className="max-w-4xl mx-auto">
              {!existingBooth ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
                    <Package size={32} className="text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">아직 부스가 없습니다</h3>
                  <p className="text-muted-foreground max-w-sm">상품을 등록하려면 먼저 '부스 설정' 탭에서 부스를 개설해주세요.</p>
                  <button onClick={() => setActiveTab("booth")} className="text-primary font-semibold hover:underline">
                    부스 설정하러 가기 &rarr;
                  </button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* 왼쪽: 입력 폼 */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        {editingProduct ? <Pencil size={16} className="text-blue-500" /> : <Plus size={16} className="text-green-500" />}
                        {editingProduct ? "상품 수정" : "새 상품 등록"}
                      </h3>
                      <form onSubmit={handleProductSubmit} className="space-y-4">
                        <input
                          placeholder="상품명"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-input text-sm focus:ring-1 focus:ring-primary outline-none"
                          required
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            placeholder="카테고리"
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-input text-sm focus:ring-1 focus:ring-primary outline-none"
                            required
                          />
                          <input
                            placeholder="가격"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-input text-sm focus:ring-1 focus:ring-primary outline-none"
                            required
                          />
                        </div>
                        
                        <div className="relative group cursor-pointer border-2 border-dashed border-input hover:border-primary rounded-lg h-32 flex items-center justify-center bg-muted/20 overflow-hidden">
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, (url) => setProductForm({ ...productForm, image: url }))} accept="image/*" />
                          {productForm.image ? (
                            <img src={productForm.image} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-xs text-muted-foreground text-center">
                              <Upload size={16} className="mx-auto mb-1" />
                              이미지 추가
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button type="submit" className="flex-1 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:bg-primary/90">
                            {editingProduct ? "수정 완료" : "추가하기"}
                          </button>
                          {editingProduct && (
                            <button
                              type="button"
                              onClick={() => { setEditingProduct(null); setProductForm({ name: "", category: "", price: "", image: "" }) }}
                              className="px-3 py-2 bg-muted text-muted-foreground text-sm font-bold rounded-md hover:bg-muted/80"
                            >
                              취소
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* 오른쪽: 상품 목록 */}
                  <div className="lg:col-span-2">
                    <h3 className="font-bold mb-4">등록된 상품 목록 ({products.length})</h3>
                    {products.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-muted rounded-xl">
                        <p className="text-muted-foreground">등록된 상품이 없습니다.</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {products.map((product) => (
                          <div key={product.id} className="group bg-background border border-border rounded-lg p-3 flex gap-3 hover:shadow-md transition-all relative overflow-hidden">
                            <div className="w-20 h-20 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                              <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold truncate pr-6">{product.name}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                              <p className="text-sm font-bold text-primary">{product.price}</p>
                            </div>
                            
                            {/* 액션 버튼 (호버 시 등장) */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-lg p-1">
                              <button onClick={() => startEditProduct(product)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}