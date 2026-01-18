"use client";

import { Sparkles } from "lucide-react";
import BoothCountText from "./booth-count-text";
import DDayCounter from "./d-day-counter";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* 배경 그라디언트 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="text-accent font-semibold text-sm tracking-widest">
            동방프로젝트 온리전
          </span>
          <Sparkles className="w-5 h-5 text-accent" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-600 to-accent">
          幻想夢園圖
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
          오는 <span className="text-primary font-semibold">2월 21일</span>,
          대전에서 비공식 동방 온리전 환상몽원도 개최!
          <br />
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105" onClick={() => {
            window.location.href = "/booths";
          }}>
            참가 부스 보기
          </button>
          <button className="border-2 border-primary text-primary hover:bg-primary/10 px-8 py-3 rounded-lg font-semibold transition" onClick={() =>{
            window.location.href = "#about";
          }}>
            더 알아보기
          </button>
        </div>

        <div className="flex gap-8 justify-center text-sm">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-primary"><BoothCountText /></span>
            <span className="text-muted-foreground">참가 부스</span>
          </div>
          {/*<div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-accent">0</span>
            <span className="text-muted-foreground">창작물</span>
          </div>*/}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-primary"><DDayCounter /></span>
            <span className="text-muted-foreground">개최까지</span>
          </div>
        </div>
      </div>
    </section>
  );
}
