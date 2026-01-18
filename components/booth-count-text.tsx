"use client"

import { useEffect, useState } from "react"

// ★ API에서 어떤 데이터가 오는지 미리 정의합니다.
interface BoothCountResponse {
  count: number;
}

export default function BoothCountText() {
  const [count, setCount] = useState(0) 

  useEffect(() => {
    fetch("/api/booth-count")
      .then((res) => res.json())
      .then((data) => {
        // ★ 여기서 data를 'BoothCountResponse' 타입이라고 알려줍니다 (as 사용)
        const response = data as BoothCountResponse;
        
        if (typeof response.count === 'number') {
          setCount(response.count)
        }
      })
      .catch((err) => console.error("부스 카운트 로딩 실패", err))
  }, [])

  return (
    <span className="text-2xl font-bold text-primary">
      {count}
    </span>
  )
}