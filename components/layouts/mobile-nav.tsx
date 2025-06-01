'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTranslation } from '@/hooks/use-translation';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={t('navigation.menu')}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-6 pr-4">
        <div className="flex flex-col gap-2 mt-8">
          <h2 className="text-lg font-semibold mb-2">{t('navigation.settings')}</h2>
          <div className="flex items-center justify-between">
            <span>{t('settings.appearance')}</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between">
            <span>{t('settings.language')}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
