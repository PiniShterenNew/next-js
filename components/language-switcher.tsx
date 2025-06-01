'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { locales } from '@/i18n.config';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Get the current locale from the pathname
  const getCurrentLocale = () => {
    const segments = pathname.split('/');
    if (segments.length > 1 && locales.includes(segments[1])) {
      return segments[1];
    }
    return 'en'; // Default to English
  };

  const currentLocale = getCurrentLocale();

  // Get display name for the language
  const getLanguageDisplayName = (locale: string) => {
    switch (locale) {
      case 'en':
        return 'English';
      case 'he':
        return 'עברית';
      default:
        return locale;
    }
  };

  // Switch the language
  const switchLanguage = (locale: string) => {
    if (locale === currentLocale) return;

    startTransition(() => {
      // Replace the current locale in the pathname with the new one
      let newPath = pathname;
      
      if (locales.some(loc => pathname.startsWith(`/${loc}`))) {
        // If the path already has a locale, replace it
        newPath = pathname.replace(/^\/[^\/]+/, `/${locale}`);
      } else {
        // If the path doesn't have a locale, add it
        newPath = `/${locale}${pathname}`;
      }
      
      router.push(newPath);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" disabled={isPending}>
          <Globe className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLanguage(locale)}
            className={locale === currentLocale ? 'bg-accent font-medium' : ''}
          >
            {getLanguageDisplayName(locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
