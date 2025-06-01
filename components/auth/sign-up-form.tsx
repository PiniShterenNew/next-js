"use client"

import { SignUp } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'

export function SignUpForm() {
  const t = useTranslations('auth.signUp')
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">{t('getStarted')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('subtitle')}
        </p>
      </div>
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-primary hover:bg-primary/90 text-primary-foreground",
            card: "bg-card border border-border shadow-lg"
          }
        }}
      />
    </div>
  )
}
