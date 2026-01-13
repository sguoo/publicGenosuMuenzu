"use client";

import { useEffect, useRef } from "react";
import { MapPin, Bus, Train } from "lucide-react";

export default function Location() {
  const mapContainer = useRef<HTMLDivElement>(null);

  // ★ 행사 장소 좌표 (예시: 서울시청) -> 실제 좌표로 변경하세요!
  const LAT = 37.566826;
  const LNG = 126.9786567;
  const PLACE_NAME = "환상몽원도 행사장"; // 장소 이름

  useEffect(() => {
    // 스크립트가 로드되었는지 확인
    if (!(window as any).kakao || !(window as any).kakao.maps) {
      return;
    }

    // 지도 로드
    (window as any).kakao.maps.load(() => {
      const center = new (window as any).kakao.maps.LatLng(LAT, LNG);
      const options = {
        center: center,
        level: 3, // 지도 확대 레벨 (낮을수록 확대)
      };

      // 지도 생성
      const map = new (window as any).kakao.maps.Map(
        mapContainer.current,
        options
      );

      // 마커 생성
      const markerPosition = new (window as any).kakao.maps.LatLng(LAT, LNG);
      const marker = new (window as any).kakao.maps.Marker({
        position: markerPosition,
      });
      marker.setMap(map);

      // 인포윈도우 (장소 이름 표시)
      const iwContent = `<div style="padding:5px; color:black; font-size:0.8rem; font-weight:bold;">${PLACE_NAME} <br><a href="https://map.kakao.com/link/to/${PLACE_NAME},${LAT},${LNG}" style="color:blue" target="_blank">길찾기</a></div>`;
      const infowindow = new (window as any).kakao.maps.InfoWindow({
        position: markerPosition,
        content: iwContent,
      });
      infowindow.open(map, marker);
    });
  }, []);

  return (
    <section id="location" className="container mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">오시는 길</h2>
        <p className="text-muted-foreground">
          행사장으로 오시는 방법을 안내해드립니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* 왼쪽: 지도 영역 */}
        <div className="md:col-span-2 bg-muted rounded-xl overflow-hidden shadow-lg border border-border h-[400px] relative">
          <div ref={mapContainer} className="w-full h-full" />
        </div>

        {/* 오른쪽: 텍스트 정보 */}
        <div className="space-y-8 p-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">주소</h3>
                <p className="text-muted-foreground leading-relaxed">
                  서울특별시 중구 세종대로 110
                  <br />
                  (실제 주소로 변경해주세요)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                <Train size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">지하철</h3>
                <p className="text-muted-foreground leading-relaxed">
                  1호선/2호선 시청역 4번 출구 도보 5분
                  <br />
                  (가까운 역 정보를 적어주세요)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                <Bus size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">버스</h3>
                <p className="text-muted-foreground leading-relaxed">
                  시청광장 정류장 하차
                  <br />
                  간선 101, 150, 402, 501 등<br />
                  (버스 노선 정보를 적어주세요)
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <a
              href={`https://map.kakao.com/link/to/${PLACE_NAME},${LAT},${LNG}`}
              target="_blank"
              rel="noreferrer"
              className="block w-full py-3 bg-[#FEE500] hover:bg-[#FDD835] text-black font-bold text-center rounded-xl transition-colors"
            >
              카카오맵으로 길찾기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
