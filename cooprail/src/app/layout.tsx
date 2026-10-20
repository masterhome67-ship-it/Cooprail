import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cooprail • Cotações e suprimentos para obras e indústria",
  description: "Plataforma inteligente de suprimentos para obras e indústria. Cotações integradas, equalização técnica automática e governança rigorosa de chamados de campo.",
  openGraph: {
    title: "Cooprail • Cotações e suprimentos para obras e indústria",
    description: "Plataforma inteligente de suprimentos para obras e indústria. Cotações integradas, equalização técnica automática e governança rigorosa de chamados de campo.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
