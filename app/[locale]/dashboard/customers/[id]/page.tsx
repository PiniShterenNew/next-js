'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCustomer, useCustomers } from '@/hooks/use-customers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  FileText,
  Plus,
  Eye,
  DollarSign
} from 'lucide-react'
import { formatDate, formatCurrency, getInvoiceStatusColor, getInvoiceStatusText } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/hooks/use-translation'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslation();
  const customerId = params.id as string
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { customer, loading, error, refetch } = useCustomer(customerId)
  const { deleteCustomer } = useCustomers()

  const handleDeleteCustomer = async () => {
    if (!customer) return

    const success = await deleteCustomer(customer.id)
    if (success) {
      router.push('/customers')
    }
    setShowDeleteDialog(false)
  }

  if (loading) {
    return <CustomerDetailSkeleton />
  }

  if (error || !customer) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Customer Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'The customer you are looking for does not exist.'}
            </p>
            <Link href="/dashboard/customers">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('customer.newEdit.back')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('customer.newEdit.back')}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{customer.name}</h1>
            <p className="text-muted-foreground">{t('customer.details')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/invoices/new?customerId=${customer.id}`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('customer.createInvoice')}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/customers/${customer.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  {t('customer.edit')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('customer.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Information */}
        <div className="flex flex-col lg:col-span-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('customer.contactInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('customer.email')}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              </div>

              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{t('customer.phone')}</p>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  </div>
                </div>
              )}

              {customer.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{t('customer.address')}</p>
                    <p className="text-sm text-muted-foreground">{customer.address}</p>
                  </div>
                </div>
              )}

              {customer.taxId && (
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{t('customer.taxId')}</p>
                    <p className="text-sm text-muted-foreground">{customer.taxId}</p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('customer.customerSince')}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(customer.createdAt, 'MMMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{t('customer.quickStats')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('customer.totalInvoices')}</span>
                  <span className="font-medium">
                    {(customer as any)._count?.invoices || 0}
                  </span>
                </div>
                {/* Add more stats here once we have invoice data */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('customer.recentInvoices')}</CardTitle>
                <Link href={`/invoices?customerId=${customer.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    {t('customer.viewAll')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {(customer as any).invoices?.length > 0 ? (
                <div className="gap-4">
                  {(customer as any).invoices.map((invoice: any) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(invoice.issueDate)} • {t('customer.due')} {formatDate(invoice.dueDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(Number(invoice.total))}</p>
                        <Badge className={getInvoiceStatusColor(invoice.status)}>
                          {getInvoiceStatusText(invoice.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">{t('customer.noInvoices')}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t('customer.createFirstInvoice', { customerName: customer.name })}
                  </p>
                  <Link href={`/dashboard/invoices/new?customerId=${customer.id}`}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('customer.createFirstInvoiceLink')}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {customer.name}? This action cannot be undone.
              {(customer as any)._count?.invoices > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This customer has {(customer as any)._count.invoices} invoice(s).
                  You cannot delete a customer with existing invoices.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              disabled={(customer as any)._count?.invoices > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CustomerDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-32" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Info Skeleton */}
        <div className="flex flex-col lg:col-span-1 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Invoices Skeleton */}
        <div className="flex flex-col lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4" />
                      <div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32 mt-1" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-12 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}