"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";

interface BoothAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

interface Booth {
  id: string;
  name: string;
  character: string;
  products: string;
  image: string | null;
  cover_image: string | null;
}

export default function BoothAdminModal({
  isOpen,
  onClose,
  email,
}: BoothAdminModalProps) {
  const [activeTab, setActiveTab] = useState<"booth" | "product">("booth");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [booths, setBooths] = useState<Booth[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [hasExistingBooth, setHasExistingBooth] = useState(false);

  // 부스 정보 폼
  const [boothForm, setBoothForm] = useState({
    name: "",
    character: "",
    products: "",
    image: null as File | null,
    cover_image: null as File | null,
  });

  // 상품 정보 폼
  const [productForm, setProductForm] = useState({
    booth_id: "",
    name: "",
    category: "",
    price: "",
    image: null as File | null,
  });

  // 이미지 미리보기 URL
  const [boothImagePreview, setBoothImagePreview] = useState("");
  const [boothCoverPreview, setBoothCoverPreview] = useState("");
  const [productImagePreview, setProductImagePreview] = useState("");

  // 부스 목록 불러오기
  const fetchBooths = async () => {
    try {
      const response = await fetch("/api/booths");
      const data = await response.json();
      setBooths(data);

      // 부스가 있는지 확인
      if (data && data.length > 0) {
        setHasExistingBooth(true);
        // 첫 번째 부스를 자동으로 선택
        setSelectedBooth(data[0]);
      } else {
        setHasExistingBooth(false);
        setSelectedBooth(null);
      }
    } catch (err) {
      console.error("부스 목록 로딩 실패:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBooths();
    }
  }, [isOpen]);

  // 부스 선택 시 폼에 데이터 채우기
  useEffect(() => {
    if (selectedBooth) {
      setBoothForm({
        name: selectedBooth.name,
        character: selectedBooth.character,
        products: selectedBooth.products,
        image: null,
        cover_image: null,
      });
      setBoothImagePreview(selectedBooth.image || "");
      setBoothCoverPreview(selectedBooth.cover_image || "");
    } else {
      setBoothForm({
        name: "",
        character: "",
        products: "",
        image: null,
        cover_image: null,
      });
      setBoothImagePreview("");
      setBoothCoverPreview("");
    }
  }, [selectedBooth]);

  // 이미지 파일 처리
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "booth_image" | "booth_cover" | "product_image"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setError("JPG 또는 PNG 파일만 업로드 가능합니다");
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("파일 크기는 5MB 이하여야 합니다");
      return;
    }

    setError("");

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      if (type === "booth_image") {
        setBoothImagePreview(preview);
        setBoothForm({ ...boothForm, image: file });
      } else if (type === "booth_cover") {
        setBoothCoverPreview(preview);
        setBoothForm({ ...boothForm, cover_image: file });
      } else {
        setProductImagePreview(preview);
        setProductForm({ ...productForm, image: file });
      }
    };
    reader.readAsDataURL(file);
  };

  // 부스 추가 (새로 생성)
  const handleBoothCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", boothForm.name);
      formData.append("character", boothForm.character);
      formData.append("products", boothForm.products);
      if (boothForm.image) formData.append("image", boothForm.image);
      if (boothForm.cover_image)
        formData.append("cover_image", boothForm.cover_image);

      const response = await fetch("/api/add-booth", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "부스 추가 실패");
      }

      setSuccess("부스가 성공적으로 추가되었습니다!");
      setBoothForm({
        name: "",
        character: "",
        products: "",
        image: null,
        cover_image: null,
      });
      setBoothImagePreview("");
      setBoothCoverPreview("");
      fetchBooths();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 부스 수정
  const handleBoothUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBooth) {
      setError("수정할 부스를 선택해주세요");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("booth_id", selectedBooth.id);
      formData.append("name", boothForm.name);
      formData.append("character", boothForm.character);
      formData.append("products", boothForm.products);
      if (boothForm.image) formData.append("image", boothForm.image);
      if (boothForm.cover_image)
        formData.append("cover_image", boothForm.cover_image);

      const response = await fetch("/api/update-booth", {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "부스 수정 실패");
      }

      setSuccess("부스가 성공적으로 수정되었습니다!");
      fetchBooths();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("booth_id", productForm.booth_id);
      formData.append("name", productForm.name);
      formData.append("category", productForm.category);
      formData.append("price", productForm.price);
      if (productForm.image) formData.append("image", productForm.image);

      const response = await fetch("/api/add-product", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "상품 추가 실패");
      }

      setSuccess("상품이 성공적으로 추가되었습니다!");
      setProductForm({
        booth_id: "",
        name: "",
        category: "",
        price: "",
        image: null,
      });
      setProductImagePreview("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="text-xl font-bold">부스 관리</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition"
          >
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
            {hasExistingBooth ? "부스 정보 수정" : "부스 추가"}
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
            <div className="space-y-4">
              {/* 부스가 이미 있는 경우 - 수정 모드 */}
              {hasExistingBooth && booths.length > 0 && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      수정할 부스 선택
                    </label>
                    <select
                      value={selectedBooth?.id || ""}
                      onChange={(e) => {
                        const booth = booths.find(
                          (b) => b.id === e.target.value
                        );
                        setSelectedBooth(booth || null);
                      }}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                    >
                      {booths.map((booth) => (
                        <option key={booth.id} value={booth.id}>
                          {booth.name} ({booth.character})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedBooth && (
                    <form
                      onSubmit={handleBoothUpdate}
                      className="space-y-4 pt-4 border-t border-border"
                    >
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          부스 이름
                        </label>
                        <input
                          type="text"
                          value={boothForm.name}
                          onChange={(e) =>
                            setBoothForm({ ...boothForm, name: e.target.value })
                          }
                          placeholder="부스 이름을 입력하세요"
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          캐릭터명
                        </label>
                        <input
                          type="text"
                          value={boothForm.character}
                          onChange={(e) =>
                            setBoothForm({
                              ...boothForm,
                              character: e.target.value,
                            })
                          }
                          placeholder="캐릭터명을 입력하세요"
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          상품 목록 (쉼표로 구분)
                        </label>
                        <textarea
                          value={boothForm.products}
                          onChange={(e) =>
                            setBoothForm({
                              ...boothForm,
                              products: e.target.value,
                            })
                          }
                          placeholder="상품1,상품2,상품3"
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          부스 이미지
                        </label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                            <Upload size={18} />
                            <span>이미지 변경</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png"
                              onChange={(e) =>
                                handleImageChange(e, "booth_image")
                              }
                              className="hidden"
                            />
                          </label>
                          {boothImagePreview && (
                            <img
                              src={boothImagePreview}
                              alt="미리보기"
                              className="h-16 w-16 object-cover rounded"
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          배경 이미지
                        </label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                            <Upload size={18} />
                            <span>이미지 변경</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png"
                              onChange={(e) =>
                                handleImageChange(e, "booth_cover")
                              }
                              className="hidden"
                            />
                          </label>
                          {boothCoverPreview && (
                            <img
                              src={boothCoverPreview}
                              alt="미리보기"
                              className="h-16 w-24 object-cover rounded"
                            />
                          )}
                        </div>
                      </div>

                      {error && <p className="text-red-500 text-sm">{error}</p>}
                      {success && (
                        <p className="text-green-500 text-sm">{success}</p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition font-medium"
                      >
                        {loading ? "수정 중..." : "부스 정보 수정"}
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* 부스가 없는 경우 - 추가 모드 */}
              {!hasExistingBooth && (
                <form onSubmit={handleBoothCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      부스 이름
                    </label>
                    <input
                      type="text"
                      value={boothForm.name}
                      onChange={(e) =>
                        setBoothForm({ ...boothForm, name: e.target.value })
                      }
                      placeholder="부스 이름을 입력하세요"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      캐릭터명
                    </label>
                    <input
                      type="text"
                      value={boothForm.character}
                      onChange={(e) =>
                        setBoothForm({
                          ...boothForm,
                          character: e.target.value,
                        })
                      }
                      placeholder="캐릭터명을 입력하세요"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      부스 이미지 (선택사항)
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                        <Upload size={18} />
                        <span>이미지 선택</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={(e) => handleImageChange(e, "booth_image")}
                          className="hidden"
                        />
                      </label>
                      {boothImagePreview && (
                        <img
                          src={boothImagePreview}
                          alt="미리보기"
                          className="h-16 w-16 object-cover rounded"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      배경 이미지 (선택사항)
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                        <Upload size={18} />
                        <span>이미지 선택</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={(e) => handleImageChange(e, "booth_cover")}
                          className="hidden"
                        />
                      </label>
                      {boothCoverPreview && (
                        <img
                          src={boothCoverPreview}
                          alt="미리보기"
                          className="h-16 w-24 object-cover rounded"
                        />
                      )}
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {success && (
                    <p className="text-green-500 text-sm">{success}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition font-medium"
                  >
                    {loading ? "추가 중..." : "부스 추가"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 상품 추가 */}
          {activeTab === "product" && (
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  부스 선택
                </label>
                <select
                  value={productForm.booth_id}
                  onChange={(e) =>
                    setProductForm({ ...productForm, booth_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                  required
                >
                  <option value="">부스를 선택하세요</option>
                  {booths.map((booth) => (
                    <option key={booth.id} value={booth.id}>
                      {booth.name} ({booth.character})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">상품명</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  placeholder="상품명을 입력하세요"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  카테고리
                </label>
                <input
                  type="text"
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
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
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  placeholder="예: 5,000원"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  상품 이미지 (선택사항)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                    <Upload size={18} />
                    <span>이미지 선택</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleImageChange(e, "product_image")}
                      className="hidden"
                    />
                  </label>
                  {productImagePreview && (
                    <img
                      src={productImagePreview}
                      alt="미리보기"
                      className="h-16 w-16 object-cover rounded"
                    />
                  )}
                </div>
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
  );
}
