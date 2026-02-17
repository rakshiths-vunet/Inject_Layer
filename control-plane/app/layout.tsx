import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "./components/layout/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Failure Injection Control Plane",
  description: "Chaos with guardrails for microservices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} antialiased bg-bg-900 text-text-60 font-sans min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
