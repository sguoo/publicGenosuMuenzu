"use client";

export default function Artists() {
  const artists = [
    { name: "임시 1", specialty: "종류 임시 1" },
    { name: "임시 2", specialty: "종류 임시 2" },
    { name: "임시 3", specialty: "종류 임시 3" },
    { name: "임시 4", specialty: "종류 임시 4" },
    { name: "임시 5", specialty: "종류 임시 5" },
    { name: "임시 6", specialty: "종류 임시 6" },
  ];

  return (
    <section id="artists" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              참가 작가 소개
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            창작의 영혼들이 모인 곳
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist, idx) => (
            <div
              key={idx}
              className="group bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6 hover:border-primary/50 transition hover:shadow-lg hover:shadow-primary/20"
            >
              <div className="w-12 h-12 bg-primary/20 rounded-lg mb-4 group-hover:bg-primary/30 transition"></div>
              <h3 className="text-lg font-bold mb-2 text-primary">
                {artist.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                📍 {artist.specialty}
              </p>
              <button className="text-accent hover:text-accent font-semibold text-sm">
                더 보기 →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
