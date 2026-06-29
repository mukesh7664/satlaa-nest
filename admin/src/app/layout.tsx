'use client';

import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import './globals.css';
import StoreProvider from '@/components/StoreProvider';
import ThemeWrapper from '@/components/ThemeWrapper';
import { Toaster } from 'sonner';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + " bg-gray-50"} suppressHydrationWarning>
        <StoreProvider>
          <AppRouterCacheProvider>
            <ThemeWrapper>
              <Toaster position="top-right" richColors closeButton />
              {children}
            </ThemeWrapper>
          </AppRouterCacheProvider>
        </StoreProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
