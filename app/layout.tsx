// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartScan – Scan QR Codes & Barcodes Instantly",
  description:
    "Instantly capture QR codes, barcodes, and text with sub-second optical recognition directly from your browser. Private, secure, and fast.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300"
        suppressHydrationWarning
      >
        <ThemeProvider>
          {/* Sticky Header */}
          <Navbar />

          {/* Page Content */}
          <main className="flex-1">{children}</main>

          {/* Global Footer */}
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}