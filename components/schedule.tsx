import { Calendar, MapPin, Clock } from "lucide-react";

export default function Schedule() {
  return (
    <section
      id="schedule"
      className="py-20 px-4 bg-gradient-to-r from-primary/5 to-accent/5"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              행사 일정
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-background border-2 border-primary rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold text-primary">개최일</h3>
            </div>
            <p className="text-lg text-foreground mb-2">2026년 2월 21일</p>
            <p className="text-muted-foreground">11:00 ~ 17:00</p>
          </div>

          <div className="bg-background border-2 border-accent rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-bold text-accent">장소</h3>
            </div>
            <p className="text-lg text-foreground mb-2">대전 예술가의 집</p>
            <p className="text-muted-foreground">대전광역시 중구 중앙로 32</p>
          </div>
        </div>

        <div className="mt-8 bg-card border border-border rounded-xl p-8">
          <h3 className="text-xl font-bold mb-6 text-primary">타임테이블</h3>
          <div className="space-y-4">
            {[{ time: "10:30", event: "입장 시작" }].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="min-w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-primary">{item.time}</p>
                  <p className="text-muted-foreground">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
