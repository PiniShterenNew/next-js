'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Invoice, InvoiceStatus } from '@/types'
import { useEnhancedInvoices as useInvoices } from '@/hooks/use-enhanced-invoices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  FileText,
  Filter,
  Calendar,
  User,
  DollarSign,
  Send,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { formatDate, formatCurrency, getInvoiceStatusColor, getInvoiceStatusText, debounce } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'

export function InvoicesList() {
  const t = useTranslations()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null)

  const {
    invoices,
    loading,
    error,
    pagination,
    deleteInvoice,
    updateInvoiceStatus,
    refreshInvoices
  } = useInvoices({ search, status: statusFilter, page, limit: 10 })

  // Debounced search to avoid too many API calls
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setSearch(value)
      setPage(1) // Reset to first page when searching
    }, 300),
    []
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearch(e.target.value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setPage(1) // Reset to first page when filtering
  }

  const handleDeleteInvoice = async (invoice: Invoice) => {
    const success = await deleteInvoice(invoice.id)
    if (success) {
      setInvoiceToDelete(null)
    }
  }

  const handleStatusChange = async (invoice: Invoice, newStatus: InvoiceStatus) => {
    await updateInvoiceStatus(invoice.id, newStatus)
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>{t('error', { message: error })}</p>
            <Button onClick={refreshInvoices} className="mt-4">
              {t('tryAgain')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('createInvoice')}
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('search')}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('filter.title')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filter.all')}</SelectItem>
                    <SelectItem value="DRAFT">{t('filter.draft')}</SelectItem>
                    <SelectItem value="SENT">{t('filter.sent')}</SelectItem>
                    <SelectItem value="PAID">{t('filter.paid')}</SelectItem>
                    <SelectItem value="OVERDUE">{t('filter.overdue')}</SelectItem>
                    <SelectItem value="CANCELLED">{t('filter.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>
                  {pagination ? t('invoicesCount', { count: pagination.total }) : t('loading')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      {loading ? (
        <div className="gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="text-right gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>{t('empty')}</p>
              <Link href="/dashboard/invoices/new">
                <Button className="mt-4">
                  {t('createFirst')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="gap-4">
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onDelete={() => setInvoiceToDelete(invoice)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1 || loading}
          >
            {t('pagination.prev')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('pagination.page', { current: page, total: pagination.totalPages })}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= pagination.totalPages || loading}
          >
            {t('pagination.next')}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteInvoice.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteInvoice.description', { number: invoiceToDelete?.invoiceNumber || '' })}
              {invoiceToDelete?.status !== InvoiceStatus.DRAFT && (
                <span className="block mt-2 text-destructive">
                  Warning: Only draft invoices can be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteInvoice.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => invoiceToDelete && handleDeleteInvoice(invoiceToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('deleteInvoice.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const getStatusIcon = (status: InvoiceStatus) => {
  switch (status) {
    case InvoiceStatus.DRAFT:
      return <Edit className="w-3 h-3" />
    case InvoiceStatus.SENT:
      return <Send className="w-3 h-3" />
    case InvoiceStatus.PAID:
      return <CheckCircle className="w-3 h-3" />
    case InvoiceStatus.OVERDUE:
      return <Clock className="w-3 h-3" />
    case InvoiceStatus.CANCELLED:
      return <XCircle className="w-3 h-3" />
    default:
      return <FileText className="w-3 h-3" />
  }
}

interface InvoiceCardProps {
  invoice: Invoice
  onDelete: () => void
  onStatusChange: (invoice: Invoice, status: InvoiceStatus) => void
}

function InvoiceCard({ invoice, onDelete, onStatusChange }: InvoiceCardProps) {
  const t = useTranslations('invoices')
  const canEdit = invoice.status === InvoiceStatus.DRAFT
  const canDelete = invoice.status === InvoiceStatus.DRAFT

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">{invoice.invoiceNumber}</h3>
              <Badge className={getInvoiceStatusColor(invoice.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(invoice.status)}
                  <span>{getInvoiceStatusText(invoice.status)}</span>
                </div>
              </Badge>
            </div>

            <div className="gap-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span>{(invoice as any).customer?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>{t('card.due', { date: formatDate(invoice.dueDate) })}</span>
              </div>
              {invoice.notes && (
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  <span className="truncate max-w-md">{invoice.notes}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right gap-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-lg font-semibold">{formatCurrency(Number(invoice.total))}</span>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/invoices/${invoice.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      {t('card.viewDetails')}
                    </Link>
                  </DropdownMenuItem>

                  {canEdit && (
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        {t('card.editInvoice')}
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{t('card.changeStatus')}</DropdownMenuLabel>

                  {invoice.status === InvoiceStatus.DRAFT && (
                    <DropdownMenuItem onClick={() => onStatusChange(invoice, InvoiceStatus.SENT)}>
                      <Send className="w-4 h-4 mr-2" />
                      {t('card.sendInvoice')}
                    </DropdownMenuItem>
                  )}

                  {(invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE) && (
                    <DropdownMenuItem onClick={() => onStatusChange(invoice, InvoiceStatus.PAID)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('card.markAsPaid')}
                    </DropdownMenuItem>
                  )}

                  {invoice.status === InvoiceStatus.SENT && (
                    <DropdownMenuItem onClick={() => onStatusChange(invoice, InvoiceStatus.OVERDUE)}>
                      <Clock className="w-4 h-4 mr-2" />
                      {t('card.markAsOverdue')}
                    </DropdownMenuItem>
                  )}

                  {(invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.SENT) && (
                    <DropdownMenuItem onClick={() => onStatusChange(invoice, InvoiceStatus.CANCELLED)}>
                      <XCircle className="w-4 h-4 mr-2" />
                      {t('card.cancelInvoice')}
                    </DropdownMenuItem>
                  )}

                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('card.deleteInvoice')}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}