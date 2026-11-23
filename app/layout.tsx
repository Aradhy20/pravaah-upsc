import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/lib/i18n/context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Pravaah UPSC — Civil Services Examination PYQ Learning Platform",
  description:
    "Master Previous Year Questions (PYQs) for UPSC Prelims GS Paper 1 and CSAT with concept-driven explanations, timed exam simulation, diagnostic analytics, and spaced mistake revision.",
  keywords: [
    "UPSC PYQ",
    "UPSC Prelims",
    "Civil Services Examination",
    "UPSC GS Paper 1",
    "CSAT PYQ",
    "UPSC Previous Year Questions",
    "IAS Preparation",
  ],
  authors: [{ name: "Pravaah UPSC Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lora.variable} min-h-screen bg-[#FBF7F0] text-[#261B1E] flex flex-col antialiased selection:bg-[#741A2B]/15 selection:text-[#741A2B]`}>
        <LanguageProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
