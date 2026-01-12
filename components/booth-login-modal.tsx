"use client";

import { useState } from "react";
import { X, Mail, ArrowRight, AlertCircle, Lock } from "lucide-react";

interface BoothLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

interface LoginResponse {
  booth?: {
    id: string;
  };
  error?: string;
}

export default function BoothLoginModal({
  isOpen,
  onClose,
  onSuccess,
}: BoothLoginModalProps) {
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState(""); // ★ 인증 코드 상태 추가
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !authCode.trim()) return;

    setLoading(true);
    setError("");

    try {
      // ★ 이메일과 인증 코드를 함께 전송
      const res = await fetch(
        `/api/booths?email=${encodeURIComponent(email)}&code=${encodeURIComponent(authCode)}`
      );

      if (res.status === 401) {
        throw new Error("이메일 또는 인증 코드가 올바르지 않습니다.");
      }

      if (!res.ok) {
        throw new Error("서버 통신 오류");
      }

      const data = (await res.json()) as LoginResponse;

      if (data.booth) {
        onSuccess(email);
        setEmail("");
        setAuthCode("");
        setError("");
      } else {
        setError("정보를 찾을 수 없습니다.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-primary" size={24} />
            </div>
            <h2 className="text-2xl font-bold mb-2">부스 참가자 로그인</h2>
            <p className="text-muted-foreground text-sm">
              전달받은 이메일과 인증 코드를 입력해주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 입력 */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium ml-1">
                이메일 주소
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* ★ 인증 코드 입력 (추가됨) */}
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium ml-1">
                인증 코드
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  id="code"
                  type="password"
                  placeholder="인증 코드 입력"
                  value={authCode}
                  onChange={(e) => {
                    setAuthCode(e.target.value);
                    setError("");
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    error
                      ? "border-red-500 focus:ring-red-200"
                      : "border-input focus:ring-primary/20 focus:border-primary"
                  }`}
                  required
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs mt-1 ml-1 animate-in slide-in-from-left-1">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {loading ? (
                "확인 중..."
              ) : (
                <>
                  부스 관리 시작하기 <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-muted/30 p-4 text-center text-xs text-muted-foreground border-t border-border">
          인증 코드는 행사 주최측에 문의해주세요.
        </div>
      </div>
    </div>
  );
}
