import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Global Marketplace | Discover Amazing Brands",
  description: "Browse the best products from independent stores on our platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-slate-50 text-slate-900 min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
