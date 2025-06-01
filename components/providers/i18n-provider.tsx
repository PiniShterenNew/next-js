'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

type I18nProviderProps = {
  locale: string;
  messages: Record<string, any>;
  children: ReactNode;
};

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
