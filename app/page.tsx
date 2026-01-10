import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "환상몽원도",
  description: "동방 프로젝트 온리전 환상몽원도",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
          <Footer />
          <Toaster />
          {/* 여기에 있던 <BoothLoginModal /> 코드가 에러 원인이었습니다. 삭제 완료! */}
        </ThemeProvider>
      </body>
    </html>
  );
}