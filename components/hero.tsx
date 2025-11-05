"use client";

import { Sparkles } from "lucide-react";

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
          환상의 동방 세계로 여러분을 초대합니다.
          <br />
          <span className="text-primary font-semibold">
            신비로운 창작의 향연
          </span>
          이 펼쳐질 이 특별한 시간
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105">
            참가 작가 신청
          </button>
          <button className="border-2 border-primary text-primary hover:bg-primary/10 px-8 py-3 rounded-lg font-semibold transition">
            더 알아보기
          </button>
        </div>

        <div className="flex gap-8 justify-center text-sm">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-primary">50+</span>
            <span className="text-muted-foreground">참가 작가</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-accent">500+</span>
            <span className="text-muted-foreground">창작물</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-primary">D-15</span>
            <span className="text-muted-foreground">개최까지</span>
          </div>
        </div>
      </div>
    </section>
  );
}
