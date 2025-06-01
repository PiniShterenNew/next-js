'use client';

import { useTranslations } from 'next-intl';

export function useTranslation() {
  const t = useTranslations();
  
  return {
    t,
    // Helper function to translate with variables
    tVar: (key: string, variables: Record<string, string | number>) => {
      return t(key, variables);
    }
  };
}
