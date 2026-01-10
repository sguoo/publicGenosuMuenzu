"use client"
import { useState, useEffect } from "react"
import { Menu, X, User } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-provider"
import BoothLoginModal from "@/components/booth-login-modal"
import BoothAdminModal from "@/components/booth-admin-modal"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
  // 모달 상태 관리
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState("") 

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 로그인 성공 시 실행할 함수
  const handleLoginSuccess = (email: string) => {
    setAdminEmail(email)          // 이메일 저장
    setIsLoginModalOpen(false)    // 로그인 모달 닫기
    setIsAdminModalOpen(true)     // 관리자 모달 열기
  }

  const navItems = [
    { name: "홈", href: "#hero" },
    { name: "행사 소개", href: "#about" },
    { name: "참가 부스", href: "#booth" },
    { name: "아티스트", href: "#artists" },
    { name: "오시는 길", href: "#location" },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-background/80 backdrop-blur-md border-border shadow-sm py-3"
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* 로고 */}
          <Link 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            환상몽원도
          </Link>

          {/* 데스크탑 메뉴 */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors hover:underline underline-offset-4"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* 우측 버튼 그룹 */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsLoginModalOpen(true)}
              className="gap-2 rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <User size={16} />
              부스 참가자
            </Button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="메뉴 열기"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* 모바일 메뉴 드롭다운 */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg animate-in slide-in-from-top-2">
            <div className="flex flex-col p-4 gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between px-4">
                <span className="text-sm font-medium">테마 설정</span>