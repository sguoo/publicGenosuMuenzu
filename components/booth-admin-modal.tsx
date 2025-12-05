"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface BoothAdminModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export default function BoothAdminModal({ isOpen, onClose, email }: BoothAdminModalProps) {
  const [activeTab, setActiveTab] = useState<"booth" | "product">("booth")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
      const response = await fetch("/api/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "상품 추가 실패")
      }

      setSuccess("상품이 성공적으로 추가되었습니다!")
      setProductForm({ booth_id: "", name: "", category: "", price: "", image: "" })
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-background">
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
            상품 추가
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6">
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
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
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
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">상품 목록 (쉼표로 구분)</label>
                <textarea
                  value={boothForm.products}
                  onChange={(e) => setBoothForm({ ...boothForm, products: e.target.value })}
                  placeholder="상품1,상품2,상품3"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
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
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
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
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
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

          {/* 상품 추가 */}
          {activeTab === "product" && (
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">부스 ID</label>
                <input
                  type="text"
                  value={productForm.booth_id}
                  onChange={(e) => setProductForm({ ...productForm, booth_id: e.target.value })}
                  placeholder="부스 UUID를 입력하세요"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">상품명</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="상품명을 입력하세요"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
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
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">가격</label>
                <input
                  type="text"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="예: 5,000원"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
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
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
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
                {loading ? "추가 중..." : "상품 추가"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
