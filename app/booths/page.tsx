import Header from "@/components/header"
import Booth from "@/components/booth"
import Footer from "@/components/footer"

export default function BoothsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <Header />
      <Booth />
      <Footer />
    </main>
  )
}
