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
import { Badge } from '@/components/ui/badge'
import {
    FileText,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Shield,
    CheckCircle,
    AlertCircle
} from 'lucide-react'
import { getClerkErrorMessage } from '@/lib/clerk/getClerkErrorMessage'
import { ClerkError } from '@/types'

export default function ForgotPasswordForm() {
    const t = useTranslations("auth");
    const tAuthErrors = useTranslations("auth-errors");

    const { isLoaded, signIn } = useSignIn()
    const [email, setEmail] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [step, setStep] = useState(1) // 1: email, 2: verification, 3: new password
    const router = useRouter()

    const passwordValidation = {
        length: newPassword.length >= 8,
        match: newPassword === confirmPassword && confirmPassword !== ''
    }

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoaded) return

        setIsLoading(true)
        setError('')

        try {
            await signIn.create({
                identifier: email,
            })

            const firstFactor = signIn?.supportedFirstFactors?.find((factor) => {
                return factor.strategy === 'reset_password_email_code'
            }) as any

            if (firstFactor) {
                await signIn.prepareFirstFactor({
                    strategy: 'reset_password_email_code',
                    emailAddressId: firstFactor.emailAddressId,
                })
                setStep(2)
            }
        } catch (err: unknown) {
            const code = (err as ClerkError)?.errors?.[0]?.code
            setError(getClerkErrorMessage(code, 'forgotPassword', tAuthErrors))
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerificationSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoaded) return

        setIsLoading(true)
        setError('')

        try {
            const result = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code: verificationCode,
            })

            if (result.status === 'needs_new_password') {
                setStep(3)
            }
        } catch (err: unknown) {
            const code = (err as ClerkError)?.errors?.[0]?.code
            setError(getClerkErrorMessage(code, 'forgotPassword', tAuthErrors))
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoaded) return

        if (!passwordValidation.length) {
            setError(tAuthErrors('forgotPassword.passwordTooShort'))
            return
        }

        if (!passwordValidation.match) {
            setError(tAuthErrors('forgotPassword.passwordMismatch'))
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const result = await signIn.resetPassword({
                password: newPassword,
            })

            if (result.status === 'complete') {
                router.push('/sign-in?success=password-reset')
            }
        } catch (err: unknown) {
            const code = (err as ClerkError)?.errors[0]?.code;
            setError(getClerkErrorMessage(code, 'forgotPassword', tAuthErrors))
        } finally {
            setIsLoading(false)
        }
    }

    const resendCode = async () => {
        if (!isLoaded) return

        try {
            const firstFactor = signIn?.supportedFirstFactors?.find((factor) => {
                return factor.strategy === 'reset_password_email_code'
            }) as any

            if (firstFactor) {
                await signIn.prepareFirstFactor({
                    strategy: 'reset_password_email_code',
                    emailAddressId: firstFactor.emailAddressId,
                })
            }
        } catch (err: unknown) {
            const code = (err as ClerkError)?.errors?.[0]?.code;
            setError(getClerkErrorMessage(code, 'forgotPassword', tAuthErrors))
        }
    }

    const getStepContent = () => {
        switch (step) {
            case 1:
                return {
                    title: t('forgotPassword.steps.email.title'),
                    description: t('forgotPassword.steps.email.description')
                }
            case 2:
                return {
                    title: t('forgotPassword.steps.verification.title'),
                    description: t('forgotPassword.steps.verification.description', { email })
                }
            case 3:
                return {
                    title: t('forgotPassword.steps.newPassword.title'),
                    description: t('forgotPassword.steps.newPassword.description')
                }
            default:
                return {
                    title: t('forgotPassword.steps.email.title'),
                    description: t('forgotPassword.steps.email.description')
                }
        }
    }

    const stepContent = getStepContent()

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
                    <div className="sm:gap-2">
                        <h1 className="text-2xl font-bold text-center">{stepContent.title}</h1>
                        <p className="text-muted-foreground text-center">{stepContent.description}</p>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="flex justify-center">
                    <Badge variant="secondary" className="text-xs gap-1">
                        <Shield className="w-3 h-3 mr-1" />
                        {t('secure')}
                    </Badge>
                </div>

                {/* Form Card */}
                <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="gap-1 pb-4">
                        <CardTitle className="text-xl text-center">{stepContent.title}</CardTitle>
                        <CardDescription className="text-center">
                            {stepContent.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        {/* Step 1: Email */}
                        {step === 1 && (
                            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                                {error && (
                                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
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

                                <Button
                                    type="submit"
                                    className="w-full h-11 font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t('forgotPassword.buttons.sendingCode')}
                                        </>
                                    ) : (
                                        <>
                                            {t('forgotPassword.buttons.sendCode')}
                                            <ArrowRight className="w-4 h-4 ml-2 rtl:rotate-180" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}

                        {/* Step 2: Verification */}
                        {step === 2 && (
                            <form onSubmit={handleVerificationSubmit} className="flex flex-col gap-4">
                                {error && (
                                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
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

                                <div className="flex flex-col gap-3">
                                    <Button
                                        type="submit"
                                        className="w-full h-11 font-medium"
                                        disabled={isLoading || verificationCode.length < 6}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {t('forgotPassword.buttons.verifying')}
                                            </>
                                        ) : (
                                            t('forgotPassword.buttons.verifyCode')
                                        )}
                                    </Button>

                                    <div className="text-center text-sm">
                                        <span className="text-muted-foreground">{t('noCode')} </span>
                                        <button
                                            type="button"
                                            onClick={resendCode}
                                            className="text-primary hover:text-primary/80 font-medium transition-colors"
                                        >
                                            {t('resend')}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Step 3: New Password */}
                        {step === 3 && (
                            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                                {error && (
                                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="newPassword" className="text-sm font-medium">
                                        {t('fields.newPassword')}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder={t('placeholders.newPassword')}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
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

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                        {t('fields.confirmPassword')}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder={t('placeholders.confirmPassword')}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={isLoading}
                                            className="pl-10 ltr:pr-10 h-11"
                                            required
                                        />
                                        <Lock className="absolute rtl:left-3 ltr:right-3 top-3 h-5 w-5 text-muted-foreground" />
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
                                {newPassword && (
                                    <div className="flex flex-col gap-2 text-sm">
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
                                        {confirmPassword && (
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
                                            {t('forgotPassword.buttons.updating')}
                                        </>
                                    ) : (
                                        t('forgotPassword.buttons.updatePassword')
                                    )}
                                </Button>
                            </form>
                        )}

                        {/* Back to Sign In */}
                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">{t('forgotPassword.rememberPassword')} </span>
                            <Link
                                href="/sign-in"
                                className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1"
                            >
                                <ArrowLeft className="w-3 h-3 rtl:rotate-180" />
                                {t('forgotPassword.backToSignIn')}
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