"use client"

import { useEffect, useState } from "react"

export default function DDayCounter() {
  const [dDayText, setDDayText] = useState("")

  useEffect(() => {
    // ★ 여기에 행사 날짜를 적어주세요! (YYYY-MM-DD 형식)
    const EVENT_DATE = new Date("2026-02-21") // 예: 2025년 5월 25일
    
    const today = new Date()

    // 정확한 날짜 계산을 위해 시/분/초는 0으로 초기화 (자정 기준)
    EVENT_DATE.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    // 차이 계산 (밀리초 단위 -> 일 단위 변환)
    const diffTime = EVENT_DATE.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // 상황별 텍스트 설정
    if (diffDays > 0) {
      setDDayText(`D-${diffDays}`) // 아직 안 지남 (예: D-30)
    } else if (diffDays === 0) {
      setDDayText("D-Day") // 당일
    } else {
      setDDayText("행사 종료") // 지남
    }
  }, [])

  // 아직 계산 전(로딩)에는 아무것도 안 보여줌
  if (!dDayText) return null

  return (
    <span className="text-2xl font-bold text-red-500">
      {dDayText}
    </span>
  )
}