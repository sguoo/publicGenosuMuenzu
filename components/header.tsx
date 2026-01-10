"use client"

import { useState, useEffect } from "react"
import { Menu, X, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import BoothLoginModal from "./booth-login-modal"
import BoothAdminModal from "./booth-admin-modal"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [boothEmail, setBoothEmail] = useState("")
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 로그인 상태 확인
    const token = localStorage.getItem("boothToken")
    const email = localStorage.getItem("boothEmail")
    setIsLoggedIn(!!token)
    setBoothEmail(email || "")
  }, [])

  const isDark = resolvedTheme === "dark"

  const handleLogout = () => {
    localStorage.removeItem("boothToken")
    localStorage.removeItem("boothEmail")
    setIsLoggedIn(false)
    setBoothEmail("")
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    const email = localStorage.getItem("boothEmail")
    setBoothEmail(email || "")
    setIsLoginModalOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border theme-transition">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center theme-transition">
                <span className="text-primary-foreground font-bold text-lg">幻</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                幻想夢園圖
              </h1>
            </div>

            <nav className="hidden md:flex gap-8">
              <a href="#about" className="text-foreground hover:text-primary transition theme-transition">
                소개
              </a>
              <a href="/booths" className="text-foreground hover:text-primary transition theme-transition">
                부스
              </a>
              <a href="#artists" className="text-foreground hover:text-primary transition theme-transition">
                작가
              </a>
              <a href="#schedule" className="text-foreground hover:text-primary transition theme-transition">
                일정
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition theme-transition">
                문의
              </a>
            </nav>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setIsAdminModalOpen(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
                  >
                    부스 관리
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition text-sm font-medium"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition text-sm font-medium"
                >
                  부스로 로그인
                </button>
              )}

              {mounted && (
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition theme-transition"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? (
                    <Sun size={20} className="text-accent transition-transform duration-300 rotate-0 hover:rotate-12" />
                  ) : (
                    <Moon
                      size={20}
                      className="text-primary transition-transform duration-300 rotate-0 hover:-rotate-12"
                    />
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
              <a href="#about" className="text-foreground hover:text-primary transition py-2 theme-transition">
                소개
              </a>
              <a href="/booths" className="text-foreground hover:text-primary transition py-2 theme-transition">
                부스
              </a>
              <a href="#artists" className="text-foreground hover:text-primary transition py-2 theme-transition">
                작가
              </a>
              <a href="#schedule" className="text-foreground hover:text-primary transition py-2 theme-transition">
                일정
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition py-2 theme-transition">
                문의
              </a>
            </nav>
          )}
        </div>
      </header>

      <BoothLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <BoothAdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} email={boothEmail} />
    </>
  )
}
