import type { Metadata } from "next";
import { Geist, Geist_Mono, Varela_Round } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { getMessages } from '@/i18n.config';
import { RootLayout } from '@/components/layouts/root-layout';
import "../globals.css";
import "../../styles/rtl-fixes.css";
import "../../styles/rtl-mobile-fixes.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const varelaRound = Varela_Round({
  variable: "--font-varela-round",
  weight: ["400"],
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "Invoice Management System",
  description: "Manage your invoices and customers efficiently",
};

export default async function AppLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: { locale?: string };
}>) {
  const locale = params.locale || 'en';
  const messages = await getMessages(locale);
  
  return (
    <ClerkProvider>
      <html lang={locale} dir={locale === 'he' ? 'rtl' : 'ltr'} suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${varelaRound.variable} antialiased min-h-screen bg-background`}
        >
          <RootLayout locale={locale} messages={messages}>
            {children}
          </RootLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}