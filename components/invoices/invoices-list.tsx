'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Invoice, InvoiceStatus } from '@/types'
import { useInvoices } from '@/hooks/use-invoices'
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

export function InvoicesList() {
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
            <p>Error loading invoices: {error}</p>
            <Button onClick={refreshInvoices} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track your invoices
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
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
                placeholder="Search invoices by number, customer, or notes..."
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>
                  {pagination ? `${pagination.total} invoices` : 'Loading...'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="text-right space-y-2">
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
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-muted-foreground mb-6">
                {search || statusFilter !== 'all'
                  ? "No invoices match your current filters. Try adjusting your search criteria."
                  : "Get started by creating your first invoice."
                }
              </p>
              <Link href="/dashboard/invoices/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Invoice
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= pagination.totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {invoiceToDelete?.invoiceNumber}?
              This action cannot be undone.
              {invoiceToDelete?.status !== InvoiceStatus.DRAFT && (
                <span className="block mt-2 text-destructive">
                  Warning: Only draft invoices can be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => invoiceToDelete && handleDeleteInvoice(invoiceToDelete)}
              disabled={invoiceToDelete?.status !== InvoiceStatus.DRAFT}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Invoice
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
  const canEdit = invoice.status === InvoiceStatus.DRAFT
  const canDelete = invoice.status === InvoiceStatus.DRAFT

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold">{invoice.invoiceNumber}</h3>
              <Badge className={getInvoiceStatusColor(invoice.status)}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(invoice.status)}
                  <span>{getInvoiceStatusText(invoice.status)}</span>
                </div>
              </Badge>
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <User className="w-3 h-3" />
                <span>{(invoice as any).customer?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-3 h-3" />
                <span>Due {formatDate(invoice.dueDate)}</span>
              </div>
              {invoice.notes && (
                <div className="flex items-center space-x-2">
                  <FileText className="w-3 h-3" />
                  <span className="truncate max-w-md">{invoice.notes}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-lg font-semibold">{formatCurrency(Number(invoice.total))}</span>
            </div>

            <div className="flex items-center space-x-2">
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
                      View Details
                    </Link>
                  </DropdownMenuItem>

                  {canEdit && (
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Invoice
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>

                  {invoice.status === InvoiceStatus.DRAFT && (
                    <DropdownMenuItem onClick={() => onStatusChange(invoice, InvoiceStatus.SENT)}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Invoice
                    </DropdownMenuItem>
                  )}

                  {(invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE) && (
                    <DropdownMenuItem onClick={() => onStatusChange(invoice, InvoiceStatus.PAID)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Paid
                    </DropdownMenuItem>
                  )}

                  {invoice.status === InvoiceStatus.SENT && (
                    <DropdownMenuItem onClick={() => onStatusChange(invoice, InvoiceStatus.OVERDUE)}>
                      <Clock className="w-4 h-4 mr-2" />
                      Mark as Overdue
                    </DropdownMenuItem>
                  )}

                  {(invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.SENT) && (
                    <DropdownMenuItem onClick={() => onStatusChange(invoice, InvoiceStatus.CANCELLED)}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Invoice
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
                        Delete Invoice
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