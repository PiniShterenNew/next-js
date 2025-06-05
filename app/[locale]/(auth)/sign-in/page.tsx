"use client"

import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Shield,
  Chrome
} from 'lucide-react';
import { getClerkErrorMessage } from '@/lib/clerk/getClerkErrorMessage'
import { ClerkError } from '@/types'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

export default function SignInForm() {
  const t = useTranslations("auth");
  const tAuthErrors = useTranslations("auth-errors");

  const { isLoaded, signIn, setActive } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        await fetchWithAuth('/api/ensure-user', { method: 'POST' })
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      const error = err as ClerkError
      const code = error.errors?.[0]?.code
      setError(getClerkErrorMessage(code, 'signIn', tAuthErrors))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return

    setIsLoading(true)
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard'
      })
    } catch (err: unknown) {
      const error = err as ClerkError
      const code = error.errors?.[0]?.code
      setError(getClerkErrorMessage(code, 'oauth', tAuthErrors))
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="flex flex-col items-center justify-center w-full gap-6">
        {/* Logo and Welcome */}
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div className="sm:gap-2">
            <h1 className="text-2xl font-bold text-center">{t('signIn.title')}</h1>
            <p className="text-muted-foreground">{t('signIn.subtitle')}</p>
          </div>
        </div>
        {/* Security Badge */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-xs gap-1">
            <Shield className="w-3 h-3 mr-1" />
            {t('secure')}
          </Badge>
        </div>
        {/* Sign In Card */}
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 ">
          <CardHeader className="gap-1 pb-4">
            <CardTitle className="text-xl text-center">{t('signIn.cardTitle')}</CardTitle>
            <CardDescription className="text-center">
              {t('signIn.cardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Google Sign In */}
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-11 font-medium"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Chrome className="w-4 h-4 mr-2" />
              )}
              {t('signIn.googleButton')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t('signIn.orContinueWith')}</span>
              </div>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t('fields.email')}
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('placeholders.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-11"
                    required
                  />
                  <Mail className="absolute rtl:left-3 ltr:right-3 top-3 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t('fields.password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('placeholders.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 ltr:pr-10 h-11"
                    required
                  />
                  <Lock className="absolute rtl:left-3 ltr:right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link
                  href="/forgot-password"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  {t('signIn.forgotPassword')}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('signIn.submitting')}
                  </>
                ) : (
                  <>
                    {t('signIn.submitButton')}
                    <ArrowRight className="w-4 h-4 ml-2 rtl:rotate-180" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">{t('signIn.noAccount')} </span>
              <Link
                href="/sign-up"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {t('signIn.signUpLink')}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="text-center gap-2">
          <p className="text-xs text-muted-foreground">
            {t('securedBy')}
          </p>
          <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground">
            <span>{t('footer.terms')}</span>
            <span>•</span>
            <span>{t('footer.privacy')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}