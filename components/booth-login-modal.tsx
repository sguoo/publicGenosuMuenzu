"use client";

import { useState } from "react";
import { X, Mail, ArrowRight, AlertCircle, Lock } from "lucide-react";

interface BoothLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ★ 수정됨: 이메일과 인증코드를 함께 전달
  onSuccess: (email: string, code: string) => void;
}

interface LoginResponse {
  booth?: { id: string };
  error?: string;
}

export default function BoothLoginModal({
  isOpen,
  onClose,
  onSuccess,
}: BoothLoginModalProps) {
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !authCode.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/booths?email=${encodeURIComponent(email)}&code=${encodeURIComponent(authCode)}`
      );

      if (res.status === 401)
        throw new Error("이메일 또는 인증 코드가 올바르지 않습니다.");
      if (!res.ok) throw new Error("서버 통신 오류");

      const data = (await res.json()) as LoginResponse;

      if (data.booth) {
        // ★ 인증 코드도 함께 전달
        onSuccess(email, authCode);
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

  // ... (UI 부분은 그대로 유지: return문 아래는 변경 없음)
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">부스 참가자 로그인</h2>
            <p className="text-muted-foreground text-sm">
              이메일과 인증 코드를 입력해주세요.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">인증 코드</label>
              <input
                type="password"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold"
            >
              {loading ? "확인 중..." : "로그인"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
