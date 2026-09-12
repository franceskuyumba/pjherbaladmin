import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import AnalyticsScripts from '@/components/AnalyticsScripts';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'PJHERBAL CLINIC – Segerea Branch | Natural Herbal Wellness Tanzania',
  description: 'Premium herbal remedies and wellness products from PJHERBAL CLINIC Segerea Branch, Dar es Salaam. Free delivery across Tanzania. Shop Men\'s Health, Women\'s Wellness, Weight Management, and more.',
  keywords: ['herbal remedies', 'natural wellness', 'Tanzania', 'Dar es Salaam', 'PJHERBAL', 'herbal clinic', 'men health', 'women wellness'],
  openGraph: {
    type: 'website',
    locale: 'en_TZ',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pjherbalad2363.builtwithrocket.new',
    siteName: 'PJHERBAL CLINIC',
    title: 'PJHERBAL CLINIC – Natural Herbal Wellness Tanzania',
    description: 'Premium herbal remedies and wellness products from PJHERBAL CLINIC Segerea Branch, Dar es Salaam.',
    images: [
      {
        url: '/assets/images/app_logo.png',
        width: 512,
        height: 512,
        alt: 'PJHERBAL CLINIC Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PJHERBAL CLINIC – Natural Herbal Wellness Tanzania',
    description: 'Premium herbal remedies and wellness products from PJHERBAL CLINIC Segerea Branch.',
    images: ['/assets/images/app_logo.png'],
  },
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <AnalyticsScripts />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-plus-jakarta-sans)',
              fontSize: '14px',
            },
          }}
        />
</body>
    </html>
  );
}