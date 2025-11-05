"use client"

export default function Cautions() {
  const cautions = [
    {
      icon: "⏰",
      title: "시간 엄수",
      description: "온리전 운영 시간을 반드시 확인하고 시간 내에 방문해 주세요.",
    },
    {
      icon: "📸",
      title: "촬영 규칙",
      description: "각 부스의 촬영 가능 여부를 확인하신 후 촬영해 주세요.",
    },
    {
      icon: "💳",
      title: "결제 방식",
      description: "현금 또는 카드 결제가 가능합니다. 각 부스에 문의해 주세요.",
    },
    {
      icon: "🚫",
      title: "금지 사항",
      description: "부스 물품의 무단 복제 및 재판매는 절대 금지됩니다.",
    },
    {
      icon: "📝",
      title: "저작권",
      description: "모든 창작물의 저작권은 각 창작자에게 있습니다.",
    },
    {
      icon: "🤝",
      title: "존중하는 문화",
      description: "모든 참가자와 방문객이 즐거운 환경을 만드는데 함께해 주세요.",
    },
  ]

  return (
    <section id="cautions" className="py-20 px-4 bg-gradient-to-b from-transparent to-primary/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">주의사항</span>
          </h2>
          <p className="text-muted-foreground text-lg">환상몽환도를 즐기기 위한 안내</p>
        </div>

        {/* 주의사항 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cautions.map((caution, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="text-3xl mb-3">{caution.icon}</div>
              <h3 className="text-lg font-bold text-primary mb-2">{caution.title}</h3>
              <p className="text-sm text-muted-foreground">{caution.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
