"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Pencil, Trash2, Plus, Upload } from "lucide-react"

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
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [existingBooth, setExistingBooth] = useState<Booth | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // 텍스트 데이터 및 미리보기용 URL 저장
  const [boothForm, setBoothForm] = useState({
    name: "",
    character: "",
    products: "",
    image: "",
    cover_image: "",
    email: email,
  })

  // ★ 추가됨: 실제 파일 객체를 저장하기 위한 State (업로드용)
  const [boothFiles, setBoothFiles] = useState<{ image?: File; cover_image?: File }>({})

  const [productForm, setProductForm] = useState({
    booth_id: "",
    name: "",
    category: "",
    price: "",
    image: "",
  })

  // ★ 추가됨: 상품 이미지 파일 객체 저장용
  const [productFile, setProductFile] = useState<File | null>(null)

  const loadBooth = async () => {
    try {
      // API 경로가 /api/booths 인지 /api/booth 인지 확인 필요 (파일명에 맞게 수정)
      const response = await fetch(`/api/booths?email=${encodeURIComponent(email)}`)
      // 응답이 비어있는 경우 방어 코드
      const text = await response.text()
      if (!text) return 

      const data = JSON.parse(text)
      
      if (response.ok && data.booth) {
        setExistingBooth(data.booth)
        setBoothForm({
          name: data.booth.name,
          character: data.booth.character,
          products: data.booth.products || "",
          image: data.booth.image,
          cover_image: data.booth.cover_image,
          email: email,
        })
        setProductForm({ ...productForm, booth_id: data.booth.id })
      }
    } catch (err) {
      console.error("[v0] Error loading booth:", err)
    }
  }

  const loadProducts = async (boothId: string) => {
    try {
      const response = await fetch(`/api/products?booth_id=${boothId}`)
      const text = await response.text()
      if (!text) {
          setProducts([])
          return
      }
      const data = JSON.parse(text)
      
      if (response.ok) {
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error("[v0] Error loading products:", err)
    }
  }

  // ★ 수정됨: JSON 대신 FormData를 사용하여 전송
  const handleBoothSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const isUpdate = !!existingBooth
      // 주의: 백엔드 파일 위치가 app/api/booths/route.ts라면 여기도 /api/booths 여야 합니다.
      const url = "/api/booths" 
      const method = isUpdate ? "PUT" : "POST"

      // FormData 생성
      const formData = new FormData()
      
      if (isUpdate && existingBooth) {
        formData.append("id", existingBooth.id)
      }
      
      formData.append("name", boothForm.name)
      formData.append("character", boothForm.character)
      formData.append("products", boothForm.products) // 백엔드에서 null로 처리하는 부분 수정 필요
      formData.append("email", email)

      // 실제 파일이 선택되었을 때만 추가
      if (boothFiles.image) {
        formData.append("image", boothFiles.image)
      }
      if (boothFiles.cover_image) {
        formData.append("cover_image", boothFiles.cover_image)
      }

      // JSON 헤더 삭제! (FormData는 브라우저가 알아서 헤더 설정함)
      const response = await fetch(url, {
        method,
        body: formData, 
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `부스 ${isUpdate ? "수정" : "추가"} 실패`)
      }

      setSuccess(`부스가 성공적으로 ${isUpdate ? "수정" : "추가"}되었습니다!`)
      await loadBooth()
      // 파일 초기화
      setBoothFiles({})
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }

  // ★ 수정됨: 상품 등록도 이미지 업로드가 있다면 FormData 사용 권장 (현재는 JSON 유지하되 로직만 정리)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const url = "/api/products"
      const method = editingProduct ? "PUT" : "POST"
      
      // 상품 이미지 업로드 로직이 백엔드에 따라 다를 수 있음.
      // 현재 백엔드 코드는 부스만 주셨으므로, 상품은 기존 로직(JSON) 유지
      // 만약 상품 이미지도 파일 업로드라면 위 부스처럼 FormData로 바꿔야 함.
      
      const body = editingProduct
        ? JSON.stringify({ id: editingProduct.id, ...productForm })
        : JSON.stringify(productForm)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `상품 ${editingProduct ? "수정" : "추가"} 실패`)
      }

      setSuccess(`상품이 성공적으로 ${editingProduct ? "수정" : "추가"}되었습니다!`)
      setProductForm({ ...productForm, name: "", category: "", price: "", image: "" })
      setEditingProduct(null)

      if (productForm.booth_id) {
        await loadProducts(productForm.booth_id)
      }

      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }

  const handleProductDelete = async (productId: string) => {
    if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "상품 삭제 실패")
      }

      setSuccess("상품이 삭제되었습니다!")

      if (productForm.booth_id) {
        await loadProducts(productForm.booth_id)
      }

      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      booth_id: product.booth_id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
    })
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
    setProductForm({
      booth_id: existingBooth?.id || "",
      name: "",
      category: "",
      price: "",
      image: "",
    })
  }

  const handleImageUpload = async (file: File) => {
      // 단순히 미리보기용 URL 생성
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error("파일 읽기 실패"))
        reader.readAsDataURL(file)
      })
  }

  // ★ 수정됨: 파일 선택 시 미리보기 URL 생성 + 파일 객체 저장
  const handleBoothImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "cover_image") => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
        const url = await handleImageUpload(file)
        // 1. 미리보기용 URL 업데이트
        setBoothForm(prev => ({ ...prev, [type]: url }))
        // 2. 전송용 파일 객체 저장
        setBoothFiles(prev => ({ ...prev, [type]: file }))
    } catch(err) {
        console.error(err)
    }
  }

  const handleProductImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
        const url = await handleImageUpload(file)
        setProductForm(prev => ({ ...prev, image: url }))
        // 상품 이미지도 파일 업로드라면 여기서 setProductFile(file) 같은 처리가 필요
    } catch (err) {
        console.error(err)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadBooth()
    }
  }, [isOpen, email])

  useEffect(() => {
    if (productForm.booth_id && activeTab === "product") {
      loadProducts(productForm.booth_id)
    }
  }, [productForm.booth_id, activeTab])

  if (!isOpen) return null

  // ... (JSX 리턴 부분은 기존과 동일하므로 생략하거나 그대로 사용하세요)
  // 기존 코드의 return (...) 부분을 그대로 유지하면 됩니다.
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* ... 기존 JSX 내용 그대로 ... */}
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold">부스 관리</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("booth")}
            className={`flex-1 px-4 py-3 font-medium transition ${
              activeTab === "booth"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            부스 관리
          </button>
          <button
            onClick={() => setActiveTab("product")}
            className={`flex-1 px-4 py-3 font-medium transition ${
              activeTab === "product"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            상품 관리
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "booth" && (
            <form onSubmit={handleBoothSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">부스 이름</label>
                <input
                  type="text"
                  value={boothForm.name}
                  onChange={(e) => setBoothForm({ ...boothForm, name: e.target.value })}
                  placeholder="부스 이름을 입력하세요"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">캐릭터명</label>
                <input
                  type="text"
                  value={boothForm.character}
                  onChange={(e) => setBoothForm({ ...boothForm, character: e.target.value })}
                  placeholder="캐릭터명을 입력하세요"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">상품 목록 (쉼표로 구분)</label>
                <textarea
                  value={boothForm.products}
                  onChange={(e) => setBoothForm({ ...boothForm, products: e.target.value })}
                  placeholder="상품1,상품2,상품3"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">부스 이미지</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full px-4 py-2 border border-border rounded-lg hover:border-primary transition bg-background flex items-center gap-2">
                      <Upload size={16} />
                      <span className="text-sm text-muted-foreground">
                        {boothForm.image ? "이미지 변경" : "이미지 선택"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleBoothImageChange(e, "image")}
                      className="hidden"
                      required={!boothForm.image}
                    />
                  </label>
                </div>
                {boothForm.image && (
                  <img
                    src={boothForm.image || "/placeholder.svg"}
                    alt="부스 이미지 미리보기"
                    className="mt-2 w-32 h-32 object-cover rounded border border-border"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">배경 이미지</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full px-4 py-2 border border-border rounded-lg hover:border-primary transition bg-background flex items-center gap-2">
                      <Upload size={16} />
                      <span className="text-sm text-muted-foreground">
                        {boothForm.cover_image ? "배경 이미지 변경" : "배경 이미지 선택"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleBoothImageChange(e, "cover_image")}
                      className="hidden"
                      required={!boothForm.cover_image}
                    />
                  </label>
                </div>
                {boothForm.cover_image && (
                  <img
                    src={boothForm.cover_image || "/placeholder.svg"}
                    alt="배경 이미지 미리보기"
                    className="mt-2 w-full h-32 object-cover rounded border border-border"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                )}
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              {uploading && <p className="text-blue-500 text-sm">업로드 중...</p>}

              <button
                type="submit"
                disabled={loading || uploading}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition font-medium"
              >
                {loading ? `${existingBooth ? "수정" : "추가"} 중...` : existingBooth ? "부스 수정" : "부스 추가"}
              </button>
            </form>
          )}

          {activeTab === "product" && (
            <div className="space-y-6">
              {!existingBooth ? (
                <p className="text-muted-foreground text-center py-8">먼저 부스를 등록해주세요</p>
              ) : (
                <>
                  <form
                    onSubmit={handleProductSubmit}
                    className="space-y-4 p-4 border border-border rounded-lg bg-muted/30"
                  >
                   {/* 상품 폼 내용 (기존과 동일) */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{editingProduct ? "상품 수정" : "상품 추가"}</h3>
                      {editingProduct && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          취소
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">상품명</label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          placeholder="상품명을 입력하세요"
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">카테고리</label>
                        <input
                          type="text"
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          placeholder="예: 굿즈, 의류, 책"
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">가격</label>
                      <input
                        type="text"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        placeholder="예: 5,000원"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">상품 이미지</label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer">
                          <div className="w-full px-4 py-2 border border-border rounded-lg hover:border-primary transition bg-background flex items-center gap-2">
                            <Upload size={16} />
                            <span className="text-sm text-muted-foreground">
                              {productForm.image ? "이미지 변경" : "이미지 선택"}
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handleProductImageChange}
                            className="hidden"
                            required={!productForm.image}
                          />
                        </label>
                      </div>
                      {productForm.image && (
                        <img
                          src={productForm.image || "/placeholder.svg"}
                          alt="미리보기"
                          className="mt-2 w-32 h-32 object-cover rounded border border-border"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                      )}
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}
                    {uploading && <p className="text-blue-500 text-sm">업로드 중...</p>}

                    <button
                      type="submit"
                      disabled={loading || uploading}
                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition font-medium flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        `${editingProduct ? "수정" : "추가"} 중...`
                      ) : (
                        <>
                          <Plus size={16} />
                          {editingProduct ? "상품 수정" : "상품 추가"}
                        </>
                      )}
                    </button>
                  </form>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">등록된 상품</h3>
                    {products.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">등록된 상품이 없습니다</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className="border border-border rounded-lg p-4 flex gap-3 hover:border-primary/50 transition"
                          >
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold">{product.name}</h4>
                              <p className="text-sm text-muted-foreground">{product.category}</p>
                              <p className="text-sm font-medium mt-1">{product.price}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-2 hover:bg-muted rounded transition"
                                title="수정"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleProductDelete(product.id)}
                                className="p-2 hover:bg-destructive/10 text-destructive rounded transition"
                                title="삭제"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}