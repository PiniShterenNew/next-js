"use client"

import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
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
  Chrome,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { ClerkError } from '@/types'
import { getClerkErrorMessage } from '@/lib/clerk/getClerkErrorMessage'

export default function SignUpForm() {
  const t = useTranslations("auth");
  const tAuthErrors = useTranslations("auth-errors");

  const { isLoaded, signUp, setActive } = useSignUp()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: form, 2: verification
  const [verificationCode, setVerificationCode] = useState('')
  const router = useRouter()

  const passwordValidation = {
    length: formData.password.length >= 8,
    match: formData.password === formData.confirmPassword && formData.confirmPassword !== ''
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    if (!passwordValidation.length) {
      setError(tAuthErrors('signUp.passwordTooShort'))
      return
    }

    if (!passwordValidation.match) {
      setError(tAuthErrors('signUp.passwordMismatch'))
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await signUp.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        password: formData.password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setStep(2)
    } catch (err: unknown) {
      const error = err as ClerkError;
      const code = error.errors?.[0]?.code
      setError(getClerkErrorMessage(code, 'signUp', tAuthErrors))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setIsLoading(true)
    setError('')

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      const code = (err as ClerkError).errors?.[0]?.code;
      setError(getClerkErrorMessage(code, 'signUp', tAuthErrors))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return

    setIsLoading(true)
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard'
      })
    } catch (err: unknown) {
     const code = (err as ClerkError).errors?.[0]?.code;
      setError(getClerkErrorMessage(code, 'oauth', tAuthErrors))
      setIsLoading(false)
    }
  }

  const resendVerification = async () => {
    if (!isLoaded) return

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
    } catch (err: unknown) {
      const code =(err as ClerkError)?.errors?.[0]?.code;
      setError(getClerkErrorMessage(code, 'signUp', tAuthErrors))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="flex flex-col items-center justify-center w-full max-w-md gap-6">
        {/* Logo and Welcome */}
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div className="">
            <h1 className="text-2xl font-bold text-center">
              {step === 1 ? t('signUp.title') : t('signUp.verification.title')}
            </h1>
            <p className="text-muted-foreground">
              {step === 1
                ? t('signUp.subtitle')
                : t('signUp.verification.description', { email: formData.email })
              }
            </p>
          </div>
        </div>
        {/* Security Badge */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-xs gap-1">
            <Shield className="w-3 h-3 mr-1" />
            {t('secure')}
          </Badge>
        </div>
        {/* Sign Up Card */}
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="gap-1 pb-4">
            <CardTitle className="text-xl text-center">
              {step === 1 ? t('signUp.cardTitle') : t('signUp.verification.cardTitle')}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1
                ? t('signUp.cardDescription')
                : t('signUp.verification.cardDescription')
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {step === 1 ? (
              <>
                {/* Google Sign Up */}
                <Button
                  variant="outline"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  className="w-full h-11 font-medium"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Chrome className="w-4 h-4 mr-2" />
                  )}
                  {t('signUp.googleButton')}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t('signUp.orContinueWith')}</span>
                  </div>
                </div>

                {/* Sign Up Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        {t('fields.firstName')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="firstName"
                          type="text"
                          placeholder={t('placeholders.firstName')}
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={isLoading}
                          className="pl-10 h-11"
                          required
                        />
                        <User className="absolute rtl:left-3 ltr:right-3 top-3 h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        {t('fields.lastName')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="lastName"
                          type="text"
                          placeholder={t('placeholders.lastName')}
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          disabled={isLoading}
                          className="pl-10 h-11"
                          required
                        />
                        <User className="absolute rtl:left-3 ltr:right-3 top-3 h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      {t('fields.email')}
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('placeholders.email')}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
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
                        placeholder={t('placeholders.newPassword')}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        disabled={isLoading}
                        className="pl-10 pr-10 h-11"
                        required
                      />
                      <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-3 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      {t('fields.confirmPassword')}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder={t('placeholders.confirmPassword')}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        disabled={isLoading}
                        className="pl-10 pr-10 h-11"
                        required
                      />
                      <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-3 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Validation */}
                  {formData.password && (
                    <div className="gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        {passwordValidation.length ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={passwordValidation.length ? 'text-green-700' : 'text-muted-foreground'}>
                          {t('validation.minLength')}
                        </span>
                      </div>
                      {formData.confirmPassword && (
                        <div className="flex items-center gap-2">
                          {passwordValidation.match ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          )}
                          <span className={passwordValidation.match ? 'text-green-700' : 'text-destructive'}>
                            {t('validation.passwordsMatch')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 font-medium"
                    disabled={isLoading || !passwordValidation.length || !passwordValidation.match}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('signUp.submitting')}
                      </>
                    ) : (
                      <>
                        {t('signUp.submitButton')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              // Verification Step
              <form onSubmit={handleVerification} className="gap-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="gap-2">
                  <Label htmlFor="verificationCode" className="text-sm font-medium">
                    {t('fields.verificationCode')}
                  </Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder={t('placeholders.verificationCode')}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={isLoading}
                    className="h-11 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-medium"
                  disabled={isLoading || verificationCode.length < 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('signUp.verification.submitting')}
                    </>
                  ) : (
                    t('signUp.verification.submitButton')
                  )}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">{t('noCode')} </span>
                  <button
                    type="button"
                    onClick={resendVerification}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {t('resend')}
                  </button>
                </div>
              </form>
            )}

            <div className="text-center text-sm">
              <span className="text-muted-foreground">{t('signUp.hasAccount')} </span>
              <Link
                href="/sign-in"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {t('signUp.signInLink')}
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