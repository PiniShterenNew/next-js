import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, getMessages } from '../i18n.config';

export default getRequestConfig(async ({ locale }) => {
  // Load messages for the current locale using the existing getMessages function
  const messages = await getMessages(locale);

  return {
    messages,
    // Pass along the locales information
    locales,
    defaultLocale
  };
});
