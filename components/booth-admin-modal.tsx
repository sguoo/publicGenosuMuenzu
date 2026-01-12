"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Save, LogOut, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

interface BoothAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  authCode: string;
  onLogout?: () => void;
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

interface ProductListResponse {
  products?: Product[];
  error?: string;
}

interface SaveResponse {
  success?: boolean;
  data?: Booth;
  error?: string;
}

export default function BoothAdminModal({
  isOpen,
  onClose,
  email,
  authCode,
  onLogout,
}: BoothAdminModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "products">("info");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // --- 부스 정보 상태 ---
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [character, setCharacter] = useState("");
  const [description, setDescription] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  // --- 상품 관리 상태 ---
  const [productList, setProductList] = useState<Product[]>([]);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdImage, setNewProdImage] = useState<File | null>(null);
  const [newProdPreview, setNewProdPreview] = useState("");
  const [prodLoading, setProdLoading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const prodImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && email && authCode) {
      fetchMyBooth();
    }
  }, [isOpen, email, authCode]);

  // ★ 이미지 압축 함수 (핵심 추가 기능)
  // 큰 이미지를 받아서 가로 600px 이하의 JPEG로 변환하여 용량을 줄임
  const compressImage = async (
    file: File,
    maxWidth: number = 600
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // 비율 유지하며 리사이징
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // JPEG 포맷, 품질 9.7로 변환 (용량 대폭 감소)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(resizedFile);
              } else {
                reject(new Error("이미지 압축 실패"));
              }
            },
            "image/jpeg",
            0.9
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const fetchMyBooth = async () => {
    setFetchLoading(true);
    try {
      const res = await fetch(
        `/api/booths?email=${encodeURIComponent(email)}&code=${encodeURIComponent(authCode)}`
      );
      if (!res.ok) throw new Error("데이터를 불러올 수 없습니다.");

      const data = (await res.json()) as FetchResponse;

      if (data.booth) {
        setId(data.booth.id || "");
        setName(data.booth.name || "");
        setCharacter(data.booth.character || "");
        setDescription(data.booth.products || "");

        if (data.booth.image) setImagePreview(data.booth.image);
        if (data.booth.cover_image) setCoverPreview(data.booth.cover_image);

        if (data.booth.id) {
          fetchProducts(data.booth.id);
        }
      }
    } catch (error) {
      console.error("데이터 로딩 실패", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchProducts = async (boothId: string) => {
    try {
      const res = await fetch(`/api/products?booth_id=${boothId}`);
      const data = (await res.json()) as ProductListResponse;
      setProductList(data.products || []);
    } catch (error) {
      console.error("상품 로딩 실패", error);
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("auth_code", authCode);
      formData.append("name", name);
      formData.append("character", character);
      formData.append("products", description);

      if (id) formData.append("id", id);

      // 이미지가 변경되었다면 전송
      if (imageFile) formData.append("image", imageFile);
      if (coverFile) formData.append("cover_image", coverFile);

      const res = await fetch("/api/add-booth", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || "저장 실패");
      }

      const result = (await res.json()) as SaveResponse;

      if (result.success) {
        if (result.data?.id) setId(result.data.id);
        alert("부스 정보가 저장되었습니다.");
      }
    } catch (e: any) {
      alert("저장 실패: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return alert("먼저 '기본 정보' 탭에서 부스 정보를 저장해주세요.");

    setProdLoading(true);
    try {
      const formData = new FormData();
      formData.append("booth_id", id);
      formData.append("name", newProdName);
      formData.append("category", newProdCategory);
      formData.append("price", newProdPrice);
      if (newProdImage) formData.append("image", newProdImage);

      await fetch("/api/products", { method: "POST", body: formData });

      setNewProdName("");
      setNewProdCategory("");
      setNewProdPrice("");
      setNewProdImage(null);
      setNewProdPreview("");
      fetchProducts(id);
    } catch (e) {
      alert("상품 추가 실패");
    } finally {
      setProdLoading(false);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await fetch(`/api/products?id=${prodId}`, { method: "DELETE" });
      fetchProducts(id);
    } catch (e) {
      alert("삭제 실패");
    }
  };

  // ★ 이미지 변경 핸들러 수정 (압축 로직 적용)
  // handleImageChange 수정 (단순화)
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "main" | "cover" | "product"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "main") {
        setImageFile(file);
        setImagePreview(reader.result as string);
      } else if (type === "cover") {
        setCoverFile(file);
        setCoverPreview(reader.result as string);
      } else {
        setNewProdImage(file);
        setNewProdPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

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
            <div className="py-20 text-center text-muted-foreground">
              로딩 중...
            </div>
          ) : activeTab === "info" ? (
            // --- 탭 1: 부스 정보 ---
            <form onSubmit={handleSaveInfo} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">
                    대표 이미지
                  </label>
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="aspect-square bg-muted/30 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-muted/50 relative overflow-hidden"
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Upload className="text-muted-foreground" />
                    )}
                    {/* accept 속성으로 이미지 파일만 선택 가능하게 함 */}
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, "main")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">
                    커버 이미지
                  </label>
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className="aspect-video bg-muted/30 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-muted/50 relative overflow-hidden"
                  >
                    {coverPreview ? (
                      <Image
                        src={coverPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Upload className="text-muted-foreground" />
                    )}
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, "cover")}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">부스 이름</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-lg bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    대표 캐릭터/장르
                  </label>
                  <input
                    type="text"
                    value={character}
                    onChange={(e) => setCharacter(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">부스 소개</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-lg bg-background resize-none h-24"
                    placeholder="부스에 대한 간단한 소개를 적어주세요."
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90"
              >
                {loading ? "저장 중..." : "정보 저장"}
              </button>
            </form>
          ) : (
            // --- 탭 2: 상품 관리 ---
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-200">
              <form
                onSubmit={handleAddProduct}
                className="p-4 border rounded-xl bg-muted/10 space-y-4"
              >
                <h3 className="font-bold flex items-center gap-2">
                  <Plus size={18} /> 새 상품 추가
                </h3>
                <div className="flex gap-4 items-start">
                  <div
                    onClick={() => prodImageInputRef.current?.click()}
                    className="w-20 h-20 bg-muted border-dashed border-2 rounded-lg flex items-center justify-center cursor-pointer shrink-0 relative overflow-hidden hover:bg-muted/50 transition-colors"
                  >
                    {newProdPreview ? (
                      <Image
                        src={newProdPreview}
                        alt="Prod"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Upload size={16} className="text-muted-foreground" />
                    )}
                    <input
                      ref={prodImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, "product")}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      placeholder="상품명"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full px-3 py-2 border rounded bg-background text-sm"
                      required
                    />
                    <div className="flex gap-2">
                      <input
                        placeholder="종류"
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded bg-background text-sm"
                      />
                      <input
                        placeholder="가격"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded bg-background text-sm"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={prodLoading}
                  className="w-full py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90"
                >
                  {prodLoading ? "추가 중..." : "리스트에 추가"}
                </button>
              </form>
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-muted-foreground">
                  등록된 상품 ({productList.length})
                </h3>
                {productList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                    등록된 상품이 없습니다.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {productList.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-background group hover:border-primary/50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-muted rounded-md relative overflow-hidden shrink-0">
                          {prod.image && (
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {prod.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {prod.category} | {prod.price}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
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
  );
}
