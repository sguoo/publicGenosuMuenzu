"use client"

import { useState } from "react"
import { X, Mail, ArrowRight, AlertCircle } from "lucide-react"

interface BoothLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (email: string) => void 
}

export default function BoothLoginModal({ isOpen, onClose, onSuccess }: BoothLoginModalProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("") // 에러 메시지 상태 추가

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError("") // 기존 에러 초기화

    try {
      // 1. 서버(DB)에 이메일이 있는지 확인 요청
      const res = await fetch(`/api/booths?email=${encodeURIComponent(email)}`)
      
      if (!res.ok) {
        throw new Error("서버 통신 오류")
      }

      const data = await res.json()

      // 2. DB에 해당 이메일을 가진 부스가 있는지 체크
      if (data.booth) {
        // 성공: 부모 컴포넌트에게 알림
        onSuccess(email)
        setEmail("")
        setError("")
      } else {
        // 실패: DB에 없음
        setError("등록된 부스 정보가 없습니다. 이메일을 확인해주세요.")
      }
    } catch (err) {
      console.error(err)
      setError("로그인 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

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
              <Mail className="text-primary" size={24} />
            </div>
            <h2 className="text-2xl font-bold mb-2">부스 참가자 로그인</h2>
            <p className="text-muted-foreground text-sm">
              사전에 등록된 이메일을 입력해주세요.<br/>
              (등록되지 않은 이메일은 접속할 수 없습니다)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium ml-1">이메일 주소</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("") // 타이핑하면 에러 메시지 지움
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    error 
                      ? "border-red-500 focus:ring-red-200" 
                      : "border-input focus:ring-primary/20 focus:border-primary"
                  }`}
                  required
                  autoFocus
                />
              </div>
              {/* 에러 메시지 표시 영역 */}
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
          비밀번호 없이 이메일로 간편하게 인증합니다.
        </div>
      </div>
    </div>
  )
}