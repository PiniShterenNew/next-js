"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Settings,
  BarChart,
  Printer,
  Layers,
  Shield,
  Zap,
  Globe,
  ChevronRight,
  Star,
  Sparkles,
  Clock,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/use-translation'
import { useEffect, useState } from 'react'

export function LandingPage() {
  const { t } = useTranslation()
  const [isRTL, setIsRTL] = useState(false)

  useEffect(() => {
    // Check if document direction is RTL
    const dir = document.documentElement.dir
    setIsRTL(dir === 'rtl')
  }, [])

  const features = [
    {
      icon: FileText,
      title: t('home.features.invoiceManagement.title'),
      description: t('home.features.invoiceManagement.description'),
    },
    {
      icon: Users,
      title: t('home.features.customerManagement.title'),
      description: t('home.features.customerManagement.description'),
    },
    {
      icon: BarChart,
      title: t('home.features.businessAnalytics.title'),
      description: t('home.features.businessAnalytics.description'),
    },
    {
      icon: Shield,
      title: t('home.features.security.title'),
      description: t('home.features.security.description'),
    },
  ]

  const benefits = [
    t('home.benefits.templates'),
    t('home.benefits.reminders'),
    t('home.benefits.multiCurrency'),
    t('home.benefits.tracking'),
    t('home.benefits.portal'),
    t('home.benefits.responsive'),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b border-border bg-glass sticky top-0 z-50 py-4">
        <div className="container-responsive">
          <div className="flex items-center justify-between gap-4 sm:h-16 flex-col sm:flex-row">
            <div className="flex items-center gap-3 w-full">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight font-hebrew">{t('appName')}</span>
            </div>
            <div className="flex items-center gap-4 w-full justify-center hidden sm:flex">
              <Link href="/sign-in">
                <Button variant="ghost" className="hover:bg-secondary/80">
                  {t('home.nav.signIn')}
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="shadow-sm">
                  {t('home.nav.getStarted')}
                  {isRTL ? (
                    <ArrowRight className="me-2 w-4 h-4 rtl-icon" style={{ transform: 'scaleX(-1)' }} />
                  ) : (
                    <ArrowRight className="ms-2 w-4 h-4" />
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="section-spacing pt-16 sm:pt-24 overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute top-20 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl opacity-70 -z-10"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-70 -z-10"></div>

        <div className="container-responsive text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <Badge variant="secondary" className="text-sm py-1.5 px-3 shadow-sm bg-accent/10 text-accent border border-accent/20">
              <Zap className="w-3.5 h-3.5 me-1.5" />
              {t('home.badge.aiFeatures')}
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight sm:space-x-2 flex flex-col sm:flex-row items-center justify-center">
              <span> {t('home.hero.titleStart')}</span>
              <span
                className=" bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent relative inline-block "
              >
                <span> {t('home.hero.titleHighlight')}</span>
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('home.hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto shadow-md bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300">
                  {t('home.hero.startFreeTrial')}
                  {isRTL ? (
                    <ArrowRight className="w-4 h-4 me-2 rtl-icon" style={{ transform: 'scaleX(-1)' }} />
                  ) : (
                    <ArrowRight className="w-4 h-4 ms-2" />
                  )}
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-secondary/50 transition-colors duration-300">
                  {t('home.hero.signInToDashboard')}
                </Button>
              </Link>
            </div>

            <div className="pt-12 opacity-90">
              <p className="text-sm text-muted-foreground mb-5">
                {t('home.trusted')}
              </p>
              <div className="flex items-center justify-center gap-2 sm:gap-8 flex-col sm:flex-row">
                <div className="flex items-center gap-2 bg-secondary/40 py-2 px-4 rounded-full border border-border/30">
                  <Globe className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">{t('home.global')}</span>
                </div>
                <div className="h-8 w-px bg-border/60 mx-2 hidden sm:block"></div>
                <div className="flex items-center gap-2 bg-secondary/40 py-2 px-4 rounded-full border border-border/30">
                  <Users className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">{t('home.clients')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing bg-card relative overflow-hidden">
        <div className="container-responsive">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.features.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="card-hover card-hover-accent border-border/40 transition-all duration-300 animate-fade-in relative group overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="pb-2">
                    <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-md bg-gradient-to-br from-accent/20 to-background relative">
                      <div className="absolute inset-0 rounded-full bg-accent/5 animate-pulse"></div>
                      <Icon className="text-accent w-7 h-7 relative z-10" />
                    </div>
                    <CardTitle className="text-xl text-center">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed text-center">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent"></div>
      </section>

      {/* Benefits Section */}
      <section className="section-spacing overflow-hidden">
        <div className="container-responsive">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 animate-slide-in-left">
              <div className="accent-border">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="relative">
                    <span className="relative">{t('home.benefits.title')}</span>
                    <span className="absolute bottom-0 left-0 right-0 h-3 bg-accent/20 -z-10"></span>
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {t('home.benefits.subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse group bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-border/30 hover:border-accent/30 transition-all duration-200">
                    <div className="flex-shrink-0 mt-1 transition-transform duration-300 group-hover:scale-110">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-accent" />
                      </div>
                    </div>
                    <div className="font-medium text-start rtl:text-right">
                      {benefit}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Link href="/sign-up">
                  <Button size="lg" className="shadow-md bg-gradient-to-r from-accent to-accent/80 hover:from-accent/80 hover:to-accent text-accent-foreground">
                    {t('home.benefits.getStarted')}
                    {isRTL ? (
                      <ArrowRight className="w-4 h-4 me-2 rtl-icon" style={{ transform: 'scaleX(-1)' }} />
                    ) : (
                      <ArrowRight className="w-4 h-4 ms-2" />
                    )}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative animate-slide-in-right hidden sm:block">
              <Card className="p-8 shadow-xl bg-card/95 backdrop-blur-sm border-border/50 rounded-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/80 to-accent"></div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t('home.demo.invoiceNumber')}</h3>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-100 px-2.5 py-1 rounded-full text-xs font-medium">{t('home.demo.paid')}</Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('home.demo.client')}:</span>
                      <span>{t('home.demo.clientName')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('home.demo.amount')}:</span>
                      <span className="font-semibold text-accent">{t('home.demo.amountValue')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('home.demo.status')}:</span>
                      <span className="text-green-600 font-medium">{t('home.demo.statusValue')}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/60">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{t('home.demo.reminder')}</span>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-accent/5 rounded-full blur-xl -z-10"></div>
              </Card>

              {/* Floating secondary card for depth */}
              <Card className="absolute -bottom-6 -right-6 w-32 h-24 rotate-6 shadow-lg border-border/40 z-[-1] hidden md:block"></Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground relative overflow-hidden rounded-3xl my-8 mx-4 lg:mx-8 shadow-lg">
        <div className="container-responsive text-center relative z-10">
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="inline-flex mb-4">
              <Badge variant="outline" className="text-sm py-2 px-4 text-primary-foreground border-primary-foreground/30 bg-primary-foreground/10 rounded-full">
                <Shield className="w-3.5 h-3.5 me-1.5" />
                {t('home.cta.badge')}
              </Badge>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold">
              {t('home.cta.title')}
            </h2>
            <p className="text-xl opacity-90 leading-relaxed">
              {t('home.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-accent/20">
                  {t('home.cta.startTrial')}
                  {isRTL ? (
                    <ArrowRight className="w-4 h-4 me-2 rtl-icon" style={{ transform: 'scaleX(-1)' }} />
                  ) : (
                    <ArrowRight className="w-4 h-4 ms-2" />
                  )}
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-primary-foreground border-2 border-primary-foreground/70 hover:bg-primary-foreground/10 hover:border-primary-foreground transition-colors bg-primary/30">
                  {t('home.cta.signIn')}
                </Button>
              </Link>
            </div>
            <div className="pt-6 opacity-90 flex items-center justify-center gap-2 flex-col sm:flex-row sm:rtl:flex-row-reverse">
              <CheckCircle className="w-8 h-8 sm:w-4 h-4 flex-shrink-0" />
              <p className="text-sm text-center sm:rtl:text-right">
                {t('home.cta.noCreditCard')}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDBoMTAwdjEwMEgxMDBWMFptLTEwMCAwaDEwMHYxMDBIMFYwWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-foreground/30 to-transparent"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-accent/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-primary-foreground/10 rounded-full blur-3xl"></div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-card/30">
        <div className="container-responsive">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary/90 to-accent/80 rounded-lg flex items-center justify-center shadow-sm">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">{t('common.appName')}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <Link href="#" className="hover:text-accent transition-colors duration-200 flex items-center gap-1.5">
                <span className="accent-dot"></span>
                {t('home.footer.terms')}
              </Link>
              <Link href="#" className="hover:text-accent transition-colors duration-200 flex items-center gap-1.5">
                <span className="accent-dot"></span>
                {t('home.footer.privacy')}
              </Link>
              <Link href="#" className="hover:text-accent transition-colors duration-200 flex items-center gap-1.5">
                <span className="accent-dot"></span>
                {t('home.footer.help')}
              </Link>
              <Link href="#" className="hover:text-accent transition-colors duration-200 flex items-center gap-1.5">
                <span className="accent-dot"></span>
                {t('home.footer.contact')}
              </Link>
            </div>
            <div className="text-sm text-muted-foreground bg-secondary/40 py-2 px-4 rounded-full">
              {new Date().getFullYear()} {t('common.appName')}. {t('home.footer.copyright')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
