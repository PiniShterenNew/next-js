'use client'

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
import { useInvoiceStats, useInvoices } from '@/hooks/use-invoices'
import { useCustomers } from '@/hooks/use-customers'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your business.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/invoices/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  From {paidInvoices} paid invoices
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  {paidInvoices} paid, {pendingInvoices} pending
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className={`text-2xl font-bold ${overdueInvoices > 0 ? 'text-destructive' : ''}`}>
                  {overdueInvoices}
                </div>
                <p className="text-xs text-muted-foreground">
                  {overdueInvoices > 0 ? 'Requires immediate attention' : 'All invoices up to date'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {customersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{customersPagination?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active business relationships
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
              <Link href="/dashboard/invoices">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentInvoices.length > 0 ? (
                  recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {(invoice as any).customer?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
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
                    <p>No invoices yet</p>
                    <Link href="/dashboard/invoices/new">
                      <Button className="mt-2">Create Your First Invoice</Button>
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
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link href="/dashboard/invoices/new">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-3" />
                  Create New Invoice
                </Button>
              </Link>
              <Link href="/dashboard/customers/new">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-3" />
                  Add New Customer
                </Button>
              </Link>
              <Link href="/dashboard/invoices?status=OVERDUE">
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="w-4 h-4 mr-3" />
                  Review Overdue Invoices
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-3" />
                  Business Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}