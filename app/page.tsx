"use client";
import Header from "@/components/header";
import Hero from "@/components/hero";
import About from "@/components/about";
import Booth from "@/components/booth";
import Cautions from "@/components/cautions";
import Schedule from "@/components/schedule";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <Header />
      <Hero />
      <About />
      <Booth />
      <Cautions />
      <Schedule />
      <Footer />
    </main>
  );
}
