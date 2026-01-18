"use client";

import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-primary/10 border-t border-border py-12 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <h4 className="font-bold text-foreground">幻想夢園圖</h4>
            </div>
            <p className="text-muted-foreground text-sm">
              동방프로젝트 비공식 대전 온리전
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-primary">빠른 링크</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#about"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  소개
                </a>
              </li>
              <li>
                <a
                  href="/booths"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  부스
                </a>
              </li>
              <li>
                <a
                  href="#schedule"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  일정
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-primary">커뮤니티</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://x.com/gensoumuenzu"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  트위터
                </a>
              </li>
              {/*<li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  디스코드
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  블로그
                </a>
              </li>*/}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-primary">문의</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <p className="text-muted-foreground">
                  📧 muenzu@gensoumuenzu.com
                </p>
              </li>
              {/*<li>
                <p className="text-muted-foreground">☎️ 02-XXXX-XXXX</p>
              </li>*/}
            </ul>
          </div>
        </div>

        {/*<div className="border-t border-border pt-8">
          <p className="text-center text-muted-foreground text-sm">
            © 2025 환상특급. All rights reserved.
          </p>
        </div>*/}
      </div>
    </footer>
  );
}
