"use client";

import { useRef, useState } from "react";
import {
  MapPin,
  Bus,
  Train,
  Car,
  ChevronDown,
  ChevronUp,
  Navigation,
} from "lucide-react";
import Script from "next/script";

interface LocationItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function Location() {
  const mapContainer = useRef<HTMLDivElement>(null);

  const [openItem, setOpenItem] = useState<string | null>("address");

  // 카카오 SDK 주소 (https:// 포함)
  const KAKAO_SDK_URL =
    "https://dapi.kakao.com/v2/maps/sdk.js?appkey=18e1a013dd3a9c111a5aba08484d4f0d&autoload=false";

  const LAT = 36.322377;
  const LNG = 127.416066;
  const PLACE_NAME = "대전예술가의집<br>(환상몽원도)";

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  const loadKakaoMap = () => {
    if (!(window as any).kakao || !(window as any).kakao.maps) {
      console.error("Kakao Maps SDK 로드 실패");
      return;
    }

    (window as any).kakao.maps.load(() => {
      if (!mapContainer.current) return;

      const center = new (window as any).kakao.maps.LatLng(LAT, LNG);
      const options = {
        center: center,
        level: 3,
      };

      const map = new (window as any).kakao.maps.Map(
        mapContainer.current,
        options
      );

      const markerPosition = new (window as any).kakao.maps.LatLng(LAT, LNG);
      const marker = new (window as any).kakao.maps.Marker({
        position: markerPosition,
      });
      marker.setMap(map);

      const iwContent = `
        <div style="padding:10px; color:black; width:150px; text-align:center;">
          <div style="font-weight:bold; margin-bottom:5px;">${PLACE_NAME}</div>
          <a href="https://map.kakao.com/link/to/${PLACE_NAME},${LAT},${LNG}" style="color:#3b82f6; text-decoration:none; font-size:12px;" target="_blank">
            길찾기 바로가기 &rarr;
          </a>
        </div>
      `;
      const infowindow = new (window as any).kakao.maps.InfoWindow({
        position: markerPosition,
        content: iwContent,
      });
      infowindow.open(map, marker);
    });
  };

  const locationItems: LocationItem[] = [
    {
      id: "address",
      title: "주소 (Address)",
      icon: <MapPin className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            대전광역시 중구 중앙로 32
            <br />
            (대전예술가의집)
          </p>
          <a
            href={`https://map.kakao.com/link/to/${PLACE_NAME},${LAT},${LNG}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FEE500] hover:bg-[#FDD835] text-black font-bold rounded-lg transition-colors text-sm"
          >
            <Navigation size={16} /> 카카오맵으로 길찾기
          </a>
        </div>
      ),
    },
    {
      id: "car",
      title: "승용차 (Car)", // ★ 추가된 섹션
      icon: <Car className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-sm">
          <div className="space-y-1">
            <h4 className="font-bold text-foreground text-base">서울에서:</h4>
            <p className="text-muted-foreground">
              경부고속도로 - 대전IC 방면 우측고속도로 - 대전역방향 -
              서대전사거리방향
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-foreground text-base">부산에서:</h4>
            <p className="text-muted-foreground">
              경부고속도로 동대구분기점 - 통영대전 중부고속도로 - 판암IC
              대전방면
            </p>
            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-base">광주에서:</h4>
              <p className="text-muted-foreground">
                호남고속도로 동림IC - 호남고속도로 논산 분기점 -
                대전남부순환고속도로 서대전 분기점 - 서대전IC 대전방면 우측 -
                계백도를 따라 지하차도
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "subway",
      title: "지하철 (Subway)",
      icon: <Train className="w-5 h-5" />,
      content: (
        <div className="space-y-2 text-muted-foreground">
          <p>
            <span className="font-bold text-foreground">
              1호선 서대전 네거리 역에서 하차
            </span>
            <br />
            도보 약 5분
          </p>
          <p className="text-sm text-gray-500">택시 이용시 2~3분 (기본 요금)</p>
        </div>
      ),
    },
    {
      id: "bus",
      title: "버스 (Bus)",
      icon: <Bus className="w-5 h-5" />,
      content: (
        <div className="space-y-6 text-sm">
          {/* 정류장 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-base flex items-center gap-2">
              대전충남병무청 하차{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (도보 1분)
              </span>
            </h4>
            <div className="grid gap-2 pl-2 border-l-2 border-muted">
              <div className="flex gap-2 items-start">
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
                  간선
                </span>
                <span className="text-muted-foreground leading-tight">
                  101, 103, 201, 202, 311, 314, 612, 613, 701
                </span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold shrink-0">
                  지선
                </span>
                <span className="text-muted-foreground leading-tight">
                  513, 614
                </span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-bold shrink-0">
                  외곽
                </span>
                <span className="text-muted-foreground leading-tight">
                  30, 33
                </span>
              </div>
            </div>
          </div>

          {/* 정류장 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-base flex items-center gap-2">
              서대전네거리역 / 성모병원
            </h4>
            <div className="grid gap-2 pl-2 border-l-2 border-muted">
              <div className="flex gap-2 items-start">
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
                  간선
                </span>
                <span className="text-muted-foreground leading-tight">
                  119, 315, 311, 612
                </span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-bold shrink-0">
                  외곽
                </span>
                <span className="text-muted-foreground leading-tight">
                  30, 33
                </span>
              </div>
            </div>
          </div>

          {/* 정류장 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-base flex items-center gap-2">
              중구청역
            </h4>
            <div className="grid gap-2 pl-2 border-l-2 border-muted">
              <div className="flex gap-2 items-start">
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold shrink-0">
                  급행
                </span>
                <span className="text-muted-foreground leading-tight">1</span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
                  간선
                </span>
                <span className="text-muted-foreground leading-tight">
                  202, 2002
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="location"
      className="container mx-auto px-6 md:px-16 lg:px-32 py-20"
    >
      <Script
        src={KAKAO_SDK_URL}
        strategy="afterInteractive"
        onLoad={loadKakaoMap}
      />

      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">오시는 길</h2>
        <p className="text-muted-foreground">
          행사장까지 편안하게 오시는 방법을 안내해드립니다.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-[600px] lg:h-[500px]">
        <div className="w-full lg:w-2/3 h-64 lg:h-full bg-muted rounded-2xl overflow-hidden shadow-lg border border-border relative z-0">
          <div ref={mapContainer} className="w-full h-full" />
        </div>

        {/* ★ 우측 스크롤 영역 */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
          {locationItems.map((item) => {
            const isOpen = openItem === item.id;
            return (
              <div
                key={item.id}
                className={`border rounded-xl transition-all duration-200 overflow-hidden shrink-0 ${
                  isOpen
                    ? "bg-muted/30 border-primary ring-1 ring-primary/20 shadow-sm"
                    : "bg-background hover:bg-muted/50"
                }`}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-colors ${isOpen ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {item.icon}
                    </div>
                    <span
                      className={`font-bold ${isOpen ? "text-primary" : "text-foreground"}`}
                    >
                      {item.title}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {/* ★ 높이 제한을 엄청 크게 늘려서 잘림 방지 (max-h-[200vh]) */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[200vh] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {/* 내부 스크롤 삭제 (overflow-y-auto 제거) */}
                  <div className="p-4 pt-0 border-t border-dashed mt-2">
                    {item.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
