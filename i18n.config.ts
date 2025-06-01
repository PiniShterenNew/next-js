import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

// Define the locales we support
export const locales = ['en', 'he'];
export const defaultLocale = 'en';

// Load messages for a specific locale
export async function getMessages(locale: string) {
  try {
    return (await import(`./locales/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}
