"use client"

import { SignIn } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'

export function SignInForm() {
  const t = useTranslations('auth.signIn')
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">{t('welcomeBack')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('subtitle')}
        </p>
      </div>
      <SignIn 
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
