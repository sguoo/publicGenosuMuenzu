export default function About() {
  return (
    <section id="about" className="py-20 px-4 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              환상몽원도란?
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            그림을 전시하고, 굿즈들 즉매회를 합니다.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "창작의 자유",
              description:
                "동방 세계관 내에서 여러분의 상상력을 펼칠 수 있습니다",
              icon: "🎨",
            },
            {
              title: "커뮤니티",
              description: "전국의 동방 팬들과 만나 교류할 수 있는 장",
              icon: "👥",
            },
            {
              title: "경험 공유",
              description:
                "창작자들의 다양한 작품을 한자리에서 감상할 수 있습니다",
              icon: "✨",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-background border border-border rounded-xl p-8 hover:border-primary/50 transition"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-primary">
                {item.title}
              </h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
