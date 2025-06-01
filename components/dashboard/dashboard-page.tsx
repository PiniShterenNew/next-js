"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Users, 
  DollarSign, 
  Clock,
  TrendingUp,
  Plus,
  Eye,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, getInvoiceStatusColor, getInvoiceStatusText } from '@/lib/utils'
import { useEnhancedInvoiceStats as useInvoiceStats, useEnhancedInvoices as useInvoices } from '@/hooks/use-enhanced-invoices'
import { useCustomers } from '@/hooks/use-customers'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'

export function DashboardContent() {
  const t = useTranslations('dashboard')
  const { 
    totalInvoices, 
    paidInvoices, 
    pendingInvoices, 
    overdueInvoices, 
    totalRevenue, 
    loading: statsLoading 
  } = useInvoiceStats()
  
  const { invoices: recentInvoices, loading: invoicesLoading } = useInvoices({ 
    page: 1, 
    limit: 5 
  })
  
  const { pagination: customersPagination, loading: customersLoading } = useCustomers({ 
    page: 1, 
    limit: 1 
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('welcome')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/invoices/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('newInvoice')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-dashboard">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1 rtl:flex-row-reverse gap-1 rtl:justify-end">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {t('stats.fromPaidInvoices', { count: paidInvoices })}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalInvoices')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  {t('stats.paidAndPending', { paid: paidInvoices, pending: pendingInvoices })}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.overdueInvoices')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{overdueInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  {overdueInvoices > 0 
                    ? t('stats.needsAttention') 
                    : t('stats.allUpToDate')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalCustomers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {customersLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{customersPagination?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {(customersPagination?.total || 0) > 0 
                    ? t('stats.activeCustomers', { count: customersPagination?.total || 0 }) 
                    : t('stats.noCustomersYet')}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('recentInvoices.title')}</CardTitle>
            <div className="text-right">
              <Link href="/dashboard/invoices">
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  {t('recentInvoices.viewAll')}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="text-right gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {recentInvoices.length > 0 ? (
                  recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {(invoice as any).customer?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="font-medium">{formatCurrency(Number(invoice.total))}</p>
                        <Badge variant="secondary" className={getInvoiceStatusColor(invoice.status)}>
                          {getInvoiceStatusText(invoice.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('recentInvoices.noInvoices')}</p>
                    <Link href="/dashboard/invoices/new">
                      <Button className="mt-2">{t('recentInvoices.createFirst')}</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('quickActions.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link href="/dashboard/invoices/new">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-3" />
                  {t('quickActions.createInvoice')}
                </Button>
              </Link>
              <Link href="/dashboard/customers/new">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-3" />
                  {t('quickActions.addCustomer')}
                </Button>
              </Link>
              <Link href="/dashboard/invoices?status=OVERDUE">
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="w-4 h-4 mr-3" />
                  {t('quickActions.reviewOverdue')}
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-3" />
                  {t('quickActions.businessSettings')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
