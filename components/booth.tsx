"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Booth() {
  const [expandedBooth, setExpandedBooth] = useState<number | null>(null);

  const booths = [
    {
      id: 1,
      icon: "🎨",
      name: "임시 부스 #1",
      image: null,
      character: "임시 캐릭터 A",
      products: "임시 상품 A",
      coverImage: null,
      boothProducts: [
        {
          name: "부스 상품 1",
          category: "에코백",
          price: "13,000원",
          image: null,
        },
        {
          name: "부스 상품 2",
          category: "스티커",
          price: "3,000원",
          image: null,
        },
        {
          name: "부스 상품 3",
          category: "포스터",
          price: "5,000원",
          image: null,
        },
      ],
    },
    {
      id: 2,
      icon: "🌸",
      name: "임시 부스 #2",
      image: null,
      character: "임시 캐릭터 B",
      products: "임시 상품 B",
      coverImage: null,
      boothProducts: [
        {
          name: "부스 상품 1",
          category: "키체인",
          price: "8,000원",
          image: null,
        },
        {
          name: "부스 상품 2",
          category: "배지",
          price: "2,000원",
          image: null,
        },
      ],
    },
    {
      id: 3,
      icon: "✨",
      name: "임시 부스 #3",
      image: null,
      character: "임시 캐릭터 C",
      products: "임시 상품 C",
      coverImage: null,
      boothProducts: [
        {
          name: "부스 상품 1",
          category: "엽서",
          price: "1,000원",
          image: null,
        },
        {
          name: "부스 상품 2",
          category: "북마크",
          price: "2,500원",
          image: null,
        },
        {
          name: "부스 상품 3",
          category: "티셔츠",
          price: "15,000원",
          image: null,
        },
        {
          name: "부스 상품 4",
          category: "모자",
          price: "12,000원",
          image: null,
        },
      ],
    },
    {
      id: 4,
      icon: "🎭",
      name: "임시 부스 #4",
      image: null,
      character: "임시 캐릭터 D",
      products: "임시 상품 D",
      coverImage: null,
      boothProducts: [
        {
          name: "부스 상품 1",
          category: "탁상용품",
          price: "20,000원",
          image: null,
        },
      ],
    },
    {
      id: 5,
      icon: "🌙",
      name: "임시 부스 #5",
      image: null,
      character: "임시 캐릭터 E",
      products: "임시 상품 E",
      coverImage: null,
      boothProducts: [
        {
          name: "부스 상품 1",
          category: "핸드폰케이스",
          price: "18,000원",
          image: null,
        },
        {
          name: "부스 상품 2",
          category: "스티커팩",
          price: "4,000원",
          image: null,
        },
        {
          name: "부스 상품 3",
          category: "톤톤",
          price: "6,000원",
          image: null,
        },
        {
          name: "부스 상품 4",
          category: "목걸이",
          price: "10,000원",
          image: null,
        },
        {
          name: "부스 상품 5",
          category: "팔찌",
          price: "7,000원",
          image: null,
        },
      ],
    },
  ];

  const getImageUrl = (imageUrl: string | null, width = 120, height = 160) => {
    return (
      imageUrl ||
      `/placeholder.svg?height=${height}&width=${width}&query=상품이미지`
    );
  };

  const toggleBooth = (id: number) => {
    setExpandedBooth(expandedBooth === id ? null : id);
  };

  return (
    <section id="booth" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              참가 부스
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            각 부스를 클릭하여 상품을 확인하세요
          </p>
        </div>

        <div className="space-y-3">
          {booths.map((booth) => (
            <div
              key={booth.id}
              className="border border-primary/20 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleBooth(booth.id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 transition"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-1">
                    <img
                      src={
                        getImageUrl(booth.image, 40, 40) || "/placeholder.svg"
                      }
                      alt={booth.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <h3 className="text-lg font-bold text-primary">
                      {booth.name}
                    </h3>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>🎨 주 캐릭터: {booth.character}</span>
                    <span>📦 다루는 상품: {booth.products}</span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-accent transition-transform flex-shrink-0 duration-300 ${
                    expandedBooth === booth.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedBooth === booth.id && (
                <div className="px-6 py-4 bg-background border-t border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                    <img
                      src={
                        getImageUrl(booth.coverImage, 400, 192) ||
                        "/placeholder.svg"
                      }
                      alt={`${booth.name} cover`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h4 className="font-semibold text-accent mb-4">
                    🛍️ 부스 상품
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {booth.boothProducts.map((product, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition"
                      >
                        <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                          <img
                            src={
                              getImageUrl(product.image) || "/placeholder.svg"
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="p-3">
                          <div className="mb-2">
                            <span className="inline-block bg-primary/15 text-primary text-xs font-semibold px-3 py-1 rounded">
                              {product.category}
                            </span>
                          </div>

                          <h5 className="font-semibold text-sm text-foreground mb-2 line-clamp-2">
                            {product.name}
                          </h5>

                          <p className="text-primary font-bold text-sm">
                            {product.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
