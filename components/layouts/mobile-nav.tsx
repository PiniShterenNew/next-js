'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTranslation } from '@/hooks/use-translation';
import { SidebarContent } from './sidebar';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={t('navigation.menu')}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-6 pr-4 ">
        <SidebarContent setIsOpen={setIsOpen} />
        <div className="md:hidden flex flex-col gap-2 p-4 text-muted-foreground">
          <h2 className="text-lg font-semibold mb-2 hidden md:block">{t('navigation.settings')}</h2>
          <div className="flex text-sm items-center rtl:flex-row-reverse rtl:justify-end">
            {/* <span>{t('settings.appearance')}</span> */}
            <ThemeToggle />
          </div>
          <div className="flex text-sm items-center rtl:flex-row-reverse rtl:justify-end">
            {/* <span>{t('settings.language')}</span> */}
            <LanguageSwitcher />
          </div>
        </div>
        {/* Footer */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground text-center">
            {t('footer.copyright')}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
