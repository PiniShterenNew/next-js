// app/[locale]/layout.tsx - Enhanced responsive layout
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Varela_Round } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { getMessages } from '@/i18n.config';
import { RootLayout } from '@/components/layouts/root-layout';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

const varelaRound = Varela_Round({
  variable: "--font-varela-round",
  weight: ["400"],
  subsets: ["hebrew", "latin"],
  display: 'swap',
  preload: true,
});

// Enhanced Metadata for mobile optimization
export const metadata: Metadata = {
  title: {
    template: '%s | InvoicePro',
    default: 'InvoicePro - Invoice Management System'
  },
  description: "Create, send, and track professional invoices with ease. Manage customers and payments all in one place.",
  keywords: ["invoice", "billing", "business", "accounting", "payments"],
  authors: [{ name: "InvoicePro Team" }],
  creator: "InvoicePro",
  publisher: "InvoicePro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InvoicePro",
  },
  applicationName: "InvoicePro",
  category: "business",
  classification: "business application",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'InvoicePro - Invoice Management System',
    description: 'Create, send, and track professional invoices with ease.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['he_IL'],
    siteName: 'InvoicePro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvoicePro - Invoice Management System',
    description: 'Create, send, and track professional invoices with ease.',
  },
  verification: {
    // Add verification tokens if needed
  },
};

// Enhanced Viewport for mobile optimization
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
  colorScheme: 'light dark',
}

interface AppLayoutProps {
  children: React.ReactNode;
  params: { locale?: string };
}

export default async function AppLayout({
  children,
  params
}: AppLayoutProps) {
  const locale = params.locale || 'en';
  const messages = await getMessages(locale);
  const isRTL = locale === 'he';

  return (
    <ClerkProvider>
      <html
        lang={locale}
        dir={isRTL ? 'rtl' : 'ltr'}
        suppressHydrationWarning
        className="scroll-smooth"
      >
        <head>
          {/* Enhanced mobile meta tags */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="InvoicePro" />
          <meta name="application-name" content="InvoicePro" />
          <meta name="msapplication-TileColor" content="#3b82f6" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          <meta name="theme-color" content="#ffffff" />

          {/* Prevent auto-zoom on iOS form inputs */}
          {/* This is handled in CSS with font-size: 16px on inputs */}

          {/* Preload critical resources */}
          <link rel="preload" href="/fonts/varela-round.woff2" as="font" type="font/woff2" crossOrigin="" />

          {/* PWA manifest */}
          <link rel="manifest" href="/manifest.json" />

          {/* Touch icons for mobile */}
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        </head>

        <body
          className={`
            ${geistSans.variable} 
            ${geistMono.variable}  ${varelaRound.variable} antialiased min-h-screen bg-background`}
        >
          <RootLayout locale={locale} messages={messages}>
            {children}
          </RootLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}