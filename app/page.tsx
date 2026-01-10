import Hero from "@/components/hero";
import About from "@/components/about";
import Booth from "@/components/booth";
// import Artists from "@/components/artists"; // 아티스트 삭제
import Schedule from "@/components/schedule";
// import Location from "@/components/location"; // 오시는 길 (파일 있으면 주석 해제)
import Cautions from "@/components/cautions";

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* 홈 버튼을 누르면 여기로 이동합니다 */}
      <section id="hero">
        <Hero />
      </section>
      
      <About />
      {/* <Artists />  아티스트 섹션 삭제됨 */}
      <Schedule />
      {/* <Location /> */}
      <Cautions />
    </div>
  );
}