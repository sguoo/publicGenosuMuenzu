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
    // 1. 스크롤 감지
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)

    // 2. ★ 로그인 유지 확인 (새로고침 시 실행)
    const savedEmail = localStorage.getItem("booth_user_email")
    if (savedEmail) {
      setAdminEmail(savedEmail)
    }

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 로그인 성공 시 실행
  const handleLoginSuccess = (email: string) => {
    setAdminEmail(email)
    localStorage.setItem("booth_user_email", email) // ★ 로컬 스토리지에 저장
    setIsLoginModalOpen(false)
    setIsAdminModalOpen(true)
  }

  // 로그아웃 (원하신다면 추가)
  const handleLogout = () => {
    setAdminEmail("")
    localStorage.removeItem("booth_user_email")
    setIsAdminModalOpen(false)
  }

  // ★ 부스 참가자 버튼 클릭 핸들러
  const handleBoothButtonClick = () => {
    if (adminEmail) {
      // 이미 로그인 되어 있으면 관리자 모달 열기
      setIsAdminModalOpen(true)
    } else {
      // 아니면 로그인 모달 열기
      setIsLoginModalOpen(true)
    }
  }

  const navItems = [
    { name: "홈", href: "/" },
    { name: "행사 소개", href: "/#about" },
    { name: "참가 부스", href: "/booths" },
    { name: "오시는 길", href: "/#location" },
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
          <Link 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            환상몽원도
          </Link>

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

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBoothButtonClick} // ★ 핸들러 교체
              className="gap-2 rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <User size={16} />
              {adminEmail ? "내 부스 관리" : "부스 참가자"} {/* ★ 텍스트 변경 */}
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="메뉴 열기"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

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
                <ThemeToggle />
              </div>
              <Button 
                className="w-full mt-2" 
                onClick={() => {
                  setIsOpen(false)
                  handleBoothButtonClick() // ★ 핸들러 교체
                }}
              >
                {adminEmail ? "내 부스 관리" : "부스 참가자 로그인"}
              </Button>
            </div>
          </div>
        )}
      </header>

      <BoothLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <BoothAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        email={adminEmail}
        onLogout={handleLogout} // 로그아웃 기능 전달
      />
    </>
  )
}