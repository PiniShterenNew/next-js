'use client';

import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { I18nProvider } from '@/components/providers/i18n-provider';

interface RootLayoutProps {
  children: ReactNode;
  locale: string;
  messages: Record<string, any>;
}

export function RootLayout({ children, locale, messages }: RootLayoutProps) {
  return (
   
      <ThemeProvider>
        <I18nProvider locale={locale} messages={messages}>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </I18nProvider>
      </ThemeProvider>
  );
}
