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
            동방프로젝트 비공식 온리전으로서
            <br /> 온리전 중 처음으로 대전에서 열리는 종합 온리전입니다.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "부스 참여 활동",
              description:
                [
                "자신만의 굿즈를 만들어서 ",
                <br / >,
                "부스를 운영 할 수 있는 기회"],
              icon: "🎨",
            },
            {
              title: "커뮤니티",
              description: "전국의 동방 팬들과 만날 수 있는 장",
              icon: "👥",
            },
            {
              title: "특별한 이벤트",
              description:
                ["환상몽원도만의 특별한 이벤트를",
                <br / >,
                "즐길 수 있습니다"],
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
