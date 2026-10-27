import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
