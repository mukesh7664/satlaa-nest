import type { Metadata } from "next";
import { Red_Hat_Display, Geist_Mono } from "next/font/google";
import "./globals.css";

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EPxWEB - Build website in secs",
  description: "The most powerful e-commerce SaaS platform. Build your website in seconds and launch your store with EPxWEB.",
  openGraph: {
    title: "EPxWEB - Build website in secs",
    description: "Build your website in seconds and launch your store with EPxWEB.",
    url: "https://epxweb.satlaa.in/",
    siteName: "EPxWEB",
    images: [
      {
        url: "/assets/hero_new.png",
        width: 1200,
        height: 630,
        alt: "EPxWEB - Build website in secs",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EPxWEB - Build website in secs",
    description: "Build your website in seconds and launch your store with EPxWEB.",
    images: ["/assets/hero_new.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${redHatDisplay.variable} ${geistMono.variable} antialiased font-sans`} suppressHydrationWarning>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
