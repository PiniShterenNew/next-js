'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useInvoice, useInvoices } from '@/hooks/use-invoices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  DollarSign,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Copy,
  Users
} from 'lucide-react'
import { formatDate, formatCurrency, getInvoiceStatusColor, getInvoiceStatusText } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { InvoiceStatus } from '@/types'
import { toast } from 'sonner'

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const { invoice, loading, error, refetch } = useInvoice(invoiceId)
  const { deleteInvoice, updateInvoiceStatus } = useInvoices()

  const handleDeleteInvoice = async () => {
    if (!invoice) return
    
    const success = await deleteInvoice(invoice.id)
    if (success) {
      router.push('/dashboard/invoices')
    }
    setShowDeleteDialog(false)
  }

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    if (!invoice) return
    await updateInvoiceStatus(invoice.id, newStatus)
    refetch()
  }

  const handleCopyInvoiceNumber = () => {
    if (invoice) {
      navigator.clipboard.writeText(invoice.invoiceNumber)
      toast.success('Invoice number copied to clipboard')
    }
  }

  if (loading) {
    return <InvoiceDetailSkeleton />
  }

  if (error || !invoice) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Invoice Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'The invoice you are looking for does not exist.'}
            </p>
            <Link href="/dashboard/invoices">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canEdit = invoice.status === InvoiceStatus.DRAFT
  const canDelete = invoice.status === InvoiceStatus.DRAFT

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Invoices
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCopyInvoiceNumber}
                className="h-8 w-8"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getInvoiceStatusColor(invoice.status)}>
                {getInvoiceStatusText(invoice.status)}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                Due {formatDate(invoice.dueDate)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
                <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.SENT)}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invoice
                </DropdownMenuItem>
              )}
              
              {(invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE) && (
                <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.PAID)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Paid
                </DropdownMenuItem>
              )}
              
              {invoice.status === InvoiceStatus.SENT && (
                <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.OVERDUE)}>
                  <Clock className="w-4 h-4 mr-2" />
                  Mark as Overdue
                </DropdownMenuItem>
              )}
              
              {(invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.SENT) && (
                <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.CANCELLED)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Invoice
                </DropdownMenuItem>
              )}
              
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Invoice Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Bill To</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">{invoice.customer.name}</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{invoice.customer.email}</span>
                  </div>
                  
                  {invoice.customer.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{invoice.customer.phone}</span>
                    </div>
                  )}
                  
                  {invoice.customer.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{invoice.customer.address}</span>
                    </div>
                  )}
                  
                  {invoice.customer.taxId && (
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span>Tax ID: {invoice.customer.taxId}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                
                {/* Items */}
                {invoice.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 py-2 border-b border-border/50 last:border-0">
                    <div className="col-span-6">
                      <p className="font-medium">{item.description}</p>
                    </div>
                    <div className="col-span-2 text-center text-muted-foreground">
                      {Number(item.quantity)}
                    </div>
                    <div className="col-span-2 text-right text-muted-foreground">
                      {formatCurrency(Number(item.unitPrice))}
                    </div>
                    <div className="col-span-2 text-right font-medium">
                      {formatCurrency(Number(item.total))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(Number(invoice.subtotal))}</span>
                </div>
                
                {Number(invoice.discount) > 0 && (
                  <div className="flex items-center justify-between text-sm text-destructive">
                    <span>Discount:</span>
                    <span>-{formatCurrency(Number(invoice.discount))}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatCurrency(Number(invoice.tax))}</span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-lg">{formatCurrency(Number(invoice.total))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Issue Date</p>
                  <p className="text-muted-foreground">{formatDate(invoice.issueDate)}</p>
                </div>
                <div>
                  <p className="font-medium">Due Date</p>
                  <p className="text-muted-foreground">{formatDate(invoice.dueDate)}</p>
                </div>
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-muted-foreground">{formatDate(invoice.createdAt)}</p>
                </div>
                {invoice.updatedAt !== invoice.createdAt && (
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-muted-foreground">{formatDate(invoice.updatedAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href={`/dashboard/customers/${invoice.customer.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    View Customer
                  </Button>
                </Link>
                
                <Link href={`/dashboard/invoices/new?customerId=${invoice.customer.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    New Invoice for Customer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {invoice.invoiceNumber}? 
              This action cannot be undone.
              {invoice.status !== InvoiceStatus.DRAFT && (
                <span className="block mt-2 text-destructive">
                  Warning: Only draft invoices can be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInvoice}
              disabled={invoice.status !== InvoiceStatus.DRAFT}
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

function InvoiceDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-9 w-32" />
          <div>
            <Skeleton className="h-8 w-48" />
            <div className="flex items-center space-x-2 mt-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-16" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 py-2">
                    <div className="col-span-6">
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-8 mx-auto" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}