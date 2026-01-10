"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Pencil, Trash2, Plus } from "lucide-react"

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

export default function BoothAdminModal({ isOpen, onClose, email }: BoothAdminModalProps) {
  const [activeTab, setActiveTab] = useState<"booth" | "product">("booth")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // 부스 정보 폼
  const [boothForm, setBoothForm] = useState({
    name: "",
    character: "",
    products: "",
    image: "",
    cover_image: "",
  })

  // 상품 정보 폼
  const [productForm, setProductForm] = useState({
    booth_id: "",
    name: "",
    category: "",
    price: "",
    image: "",
  })

  const loadProducts = async (boothId: string) => {
    try {
      const response = await fetch(`/api/products?booth_id=${boothId}`)
      const data = await response.json()
      if (response.ok) {
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error("[v0] Error loading products:", err)
    }
  }

  const handleBoothSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await fetch("/api/add-booth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(boothForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "부스 추가 실패")
      }

      setSuccess("부스가 성공적으로 추가되었습니다!")
      setBoothForm({ name: "", character: "", products: "", image: "", cover_image: "" })
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const url = editingProduct ? "/api/products" : "/api/products"
      const method = editingProduct ? "PUT" : "POST"
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
      setProductForm({ booth_id: "", name: "", category: "", price: "", image: "" })
      setEditingProduct(null)

      if (productForm.booth_id) {
        await loadProducts(productForm.booth_id)
      }

      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다")
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
      setError(err instanceof Error ? err.message : "오류가 발생했습니다")
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
    setProductForm({ booth_id: "", name: "", category: "", price: "", image: "" })
  }

  useEffect(() => {
    if (productForm.booth_id && activeTab === "product") {
      loadProducts(productForm.booth_id)
    }
  }, [productForm.booth_id, activeTab])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold">부스 관리</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition">
            <X size={20} />
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("booth")}
            className={`flex-1 px-4 py-3 font-medium transition ${
              activeTab === "booth"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            부스 정보
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

        {/* 콘텐츠 */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* 부스 정보 */}
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
                <label className="block text-sm font-medium mb-2">부스 이미지 URL</label>
                <input
                  type="url"
                  value={boothForm.image}
                  onChange={(e) => setBoothForm({ ...boothForm, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">배경 이미지 URL</label>
                <input
                  type="url"
                  value={boothForm.cover_image}
                  onChange={(e) => setBoothForm({ ...boothForm, cover_image: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition font-medium"
              >
                {loading ? "추가 중..." : "부스 추가"}
              </button>
            </form>
          )}

          {activeTab === "product" && (
            <div className="space-y-6">
              {/* 상품 폼 */}
              <form
                onSubmit={handleProductSubmit}
                className="space-y-4 p-4 border border-border rounded-lg bg-muted/30"
              >
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

                <div>
                  <label className="block text-sm font-medium mb-2">부스 ID</label>
                  <input
                    type="text"
                    value={productForm.booth_id}
                    onChange={(e) => setProductForm({ ...productForm, booth_id: e.target.value })}
                    placeholder="부스 UUID를 입력하세요"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                    required
                    disabled={!!editingProduct}
                  />
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
                  <label className="block text-sm font-medium mb-2">상품 이미지 URL</label>
                  <input
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="https://example.com/product.jpg"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                    required
                  />
                  {productForm.image && (
                    <img
                      src={productForm.image || "/placeholder.svg"}
                      alt="미리보기"
                      className="mt-2 w-32 h-32 object-cover rounded border border-border"
                    />
                  )}
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

                <button
                  type="submit"
                  disabled={loading}
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

              {/* 상품 목록 */}
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
