import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

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
    // suppressHydrationWarning: 테마 적용 시 깜빡임/경고 방지 (필수)
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system" // ★ 수정: 기본값을 'system'으로 설정
          enableSystem={true} // ★ 수정: 시스템 설정 감지 활성화
          disableTransitionOnChange
        >
          <Header />
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ThemeProvider>
        <Script
          src={
            "//dapi.kakao.com/v2/maps/sdk.js?appkey=65268e8c91eb7f0d158f4f7a60b0b070&autoload=false"
          }
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
