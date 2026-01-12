"use client";
import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-provider";
import BoothLoginModal from "@/components/booth-login-modal";
import BoothAdminModal from "@/components/booth-admin-modal";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 모달 상태 관리
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // 인증 정보 상태
  const [adminEmail, setAdminEmail] = useState("");
  const [adminAuthCode, setAdminAuthCode] = useState(""); // 인증 코드 상태

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // 로컬 스토리지에서 인증 정보 복구
    const savedEmail = localStorage.getItem("booth_user_email");
    const savedCode = localStorage.getItem("booth_user_code");

    if (savedEmail && savedCode) {
      setAdminEmail(savedEmail);
      setAdminAuthCode(savedCode);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 로그인 성공 시 실행
  const handleLoginSuccess = (email: string, code: string) => {
    setAdminEmail(email);
    setAdminAuthCode(code);
    localStorage.setItem("booth_user_email", email);
    localStorage.setItem("booth_user_code", code);

    setIsLoginModalOpen(false);
    setIsAdminModalOpen(true);
  };

  // 로그아웃
  const handleLogout = () => {
    setAdminEmail("");
    setAdminAuthCode("");
    localStorage.removeItem("booth_user_email");
    localStorage.removeItem("booth_user_code");
    setIsAdminModalOpen(false);
  };

  const handleBoothButtonClick = () => {
    if (adminEmail && adminAuthCode) {
      setIsAdminModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const navItems = [
    { name: "홈", href: "/" },
    { name: "행사 소개", href: "/#about" },
    { name: "참가 부스", href: "/booths" },
    { name: "오시는 길", href: "/#location" },
  ];

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
              onClick={handleBoothButtonClick}
              className="gap-2 rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <User size={16} />
              {adminEmail ? "내 부스 관리" : "부스 참가자"}
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
                  setIsOpen(false);
                  handleBoothButtonClick();
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

      {/* ★ 여기가 에러가 나던 부분입니다. authCode를 넘겨주도록 수정했습니다. */}
      <BoothAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        email={adminEmail}
        authCode={adminAuthCode}
        onLogout={handleLogout}
      />
    </>
  );
}
