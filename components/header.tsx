"use client";

import { useState } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useState(() => setMounted(true));

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                幻
              </span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              幻想夢園圖
            </h1>
          </div>

          <nav className="hidden md:flex gap-8">
            <a
              href="#about"
              className="text-foreground hover:text-primary transition"
            >
              소개
            </a>
            <a
              href="#artists"
              className="text-foreground hover:text-primary transition"
            >
              작가
            </a>
            <a
              href="#schedule"
              className="text-foreground hover:text-primary transition"
            >
              일정
            </a>
            <a
              href="#contact"
              className="text-foreground hover:text-primary transition"
            >
              문의
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? (
                  <Sun size={20} className="text-accent" />
                ) : (
                  <Moon size={20} className="text-primary" />
                )}
              </button>
            )}

            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <nav className="md:hidden mt-4 flex flex-col gap-2 pb-4">
            <a
              href="#about"
              className="text-foreground hover:text-primary transition py-2"
            >
              소개
            </a>
            <a
              href="#artists"
              className="text-foreground hover:text-primary transition py-2"
            >
              작가
            </a>
            <a
              href="#schedule"
              className="text-foreground hover:text-primary transition py-2"
            >
              일정
            </a>
            <a
              href="#contact"
              className="text-foreground hover:text-primary transition py-2"
            >
              문의
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
