"use client"

import { useState } from "react"
import { X, Mail, ArrowRight } from "lucide-react"

interface BoothLoginModalProps {
  isOpen: boolean
  onClose: () => void
  // ★ 수정 포인트: 성공 시 이메일(string)을 전달한다고 명시
  onSuccess: (email: string) => void 
}

export default function BoothLoginModal({ isOpen, onClose, onSuccess }: BoothLoginModalProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)

    // 실제 서비스라면 여기서 비밀번호/인증번호 확인 API를 호출해야 합니다.
    // 지금은 데모 버전이므로, 이메일 입력만 하면 바로 통과시킵니다.
    
    // 약간의 딜레이를 주어 그럴듯하게 만듭니다.
    setTimeout(() => {
      setLoading(false)
      // ★ 성공 시 부모(Header)에게 이메일 전달
      onSuccess(email)
      // 입력창 초기화
      setEmail("")
    }, 500)
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
              등록한 이메일을 입력하여 부스를 관리하세요.<br/>
              (처음이라면 입력한 이메일로 자동 가입됩니다)
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                  autoFocus
                />
              </div>
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