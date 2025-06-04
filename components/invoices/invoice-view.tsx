// app/dashboard/invoices/[id]/page.tsx - הצגת חשבונית עם הגדרות
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEnhancedInvoice, useEnhancedInvoices } from '@/hooks/use-enhanced-invoices'
import { useSettings } from '@/hooks/use-settings'
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
    Users,
    Loader2
} from 'lucide-react'
import { formatDate, formatCurrency, getInvoiceStatusColor, getInvoiceStatusText } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { InvoiceStatus } from '@/types'
import { toast } from 'sonner'
import { useTranslation } from '@/hooks/use-translation'

export default function InvoiceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const invoiceId = params.id as string
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const { t } = useTranslation()

    const { invoice, loading, error, refetch } = useEnhancedInvoice(invoiceId)
    const { settings, loading: settingsLoading } = useSettings()
    const { deleteInvoice, updateInvoiceStatus } = useEnhancedInvoices()

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
            toast.success(t('invoice.numberCopied'))
        }
    }

    // פונקציה לעיצוב המטבע לפי ההגדרות
    const formatCurrencyWithSettings = (amount: number) => {
        if (!settings) return formatCurrency(amount) // fallback

        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: settings.currency,
        }).format(amount)
    }

    if (loading || settingsLoading) {
        return <InvoiceDetailSkeleton />
    }

    if (error || !invoice) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardContent className="p-12 text-center">
                        <h2 className="text-2xl font-bold mb-2">{t('invoice.notFound')}</h2>
                        <p className="text-muted-foreground mb-6">
                            {error || t('invoice.notFoundDesc')}
                        </p>
                        <Link href="/dashboard/invoices">
                            <Button>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t('invoice.backToInvoices')}
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
        <div className="flex flex-col max-w-6xl mx-auto gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <Link href="/dashboard/invoices">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('invoice.backToInvoices')}
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-3xl font-bold">{invoice.invoiceNumber}</h1>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCopyInvoiceNumber}
                                className="h-8 w-8"
                                title={t('invoice.copyNumber')}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge className={getInvoiceStatusColor(invoice.status)}>
                                {getInvoiceStatusText(invoice.status)}
                            </Badge>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                                {t('invoice.dueDate')}: {formatDate(invoice.dueDate)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" className="hidden md:flex">
                        <Download className="w-4 h-4 mr-2" />
                        {t('invoice.downloadPdf')}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="md:hidden" asChild>
                                <Link href="#" onClick={(e) => { e.preventDefault(); /* PDF download logic */ }}>
                                    <Download className="w-4 h-4 mr-2" />
                                    {t('invoice.downloadPdf')}
                                </Link>
                            </DropdownMenuItem>

                            {canEdit && (
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        {t('invoice.edit')}
                                    </Link>
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>{t('common.status')}</DropdownMenuLabel>
                            {invoice.status === InvoiceStatus.DRAFT && (
                                <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.SENT)}>
                                    <Send className="w-4 h-4 mr-2" />
                                    {t('invoice.markAsSent')}
                                </DropdownMenuItem>
                            )}

                            {(invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE) && (
                                <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.PAID)}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {t('invoice.markAsPaid')}
                                </DropdownMenuItem>
                            )}

                            {invoice.status === InvoiceStatus.SENT && (
                                <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.OVERDUE)}>
                                    <Clock className="w-4 h-4 mr-2" />
                                    {t('invoice.markAsOverdue')}
                                </DropdownMenuItem>
                            )}

                            {(invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.SENT) && (
                                <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.CANCELLED)}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    {t('invoice.cancel')}
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
                                        {t('invoice.delete')}
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3">
                {/* Main Invoice Content */}
                <div className="flex flex-col lg:col-span-2 gap-6">
                    {/* Business Information */}
                    {settings && (settings.businessName || settings.businessAddress || settings.businessEmail) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('invoice.from')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2">
                                    {settings.businessName && (
                                        <h3 className="text-lg font-semibold">{settings.businessName}</h3>
                                    )}

                                    {settings.businessEmail && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            <span>{settings.businessEmail}</span>
                                        </div>
                                    )}

                                    {settings.businessPhone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            <span>{settings.businessPhone}</span>
                                        </div>
                                    )}

                                    {settings.businessAddress && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            <span className="flex-1">{settings.businessAddress}</span>
                                        </div>
                                    )}

                                    {settings && 'taxId' in settings && (settings as any).taxId && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            <span>{t('invoice.taxId')}: {String((settings as any).taxId)}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('invoice.billTo')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <h3 className="text-lg font-semibold">{invoice?.customer?.name}</h3>
                                    <Link href={`/dashboard/customers/${invoice?.customer?.id}`}>
                                        <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                                            <Users className="w-4 h-4 mr-2" />
                                            {t('invoice.viewCustomer')}
                                        </Button>
                                    </Link>
                                </div>

                                {invoice?.customer?.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <span className="break-all">{invoice?.customer?.email}</span>
                                    </div>
                                )}

                                {invoice?.customer?.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <span>{invoice?.customer?.phone}</span>
                                    </div>
                                )}

                                {invoice?.customer?.address && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <span className="flex-1">{invoice?.customer?.address}</span>
                                    </div>
                                )}

                                {/* Handle company field which might not be in the Customer type */}
                                {invoice?.customer && 'company' in invoice.customer && (invoice.customer as any).company && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <span>{(invoice.customer as any).company}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('invoice.invoiceItems')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                {/* Header */}
                                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                                    <div className="col-span-6">{t('invoice.itemDescription')}</div>
                                    <div className="col-span-2 text-center">{t('invoice.itemQuantity')}</div>
                                    <div className="col-span-2 text-right">{t('invoice.itemUnitPrice')}</div>
                                    <div className="col-span-2 text-right">{t('invoice.itemTotal')}</div>
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
                                            {formatCurrencyWithSettings(Number(item.unitPrice))}
                                        </div>
                                        <div className="col-span-2 text-right font-medium">
                                            {formatCurrencyWithSettings(Number(item.total))}
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
                                <CardTitle>{t('invoice.notes')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="whitespace-pre-wrap">{invoice.notes}</div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-6">
                    {/* Invoice Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('invoice.summary')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span>{t('invoice.subtotal')}:</span>
                                    <span>{formatCurrencyWithSettings(Number(invoice.subtotal))}</span>
                                </div>

                                {Number(invoice.discount) > 0 && (
                                    <div className="flex items-center justify-between text-sm text-destructive">
                                        <span>{t('invoice.discount')}:</span>
                                        <span>-{formatCurrencyWithSettings(Number(invoice.discount))}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-sm">
                                    <span>{t('invoice.tax')} ({settings?.taxRate || 0}%):</span>
                                    <span>{formatCurrencyWithSettings(Number(invoice.tax))}</span>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between font-semibold">
                                    <span>{t('invoice.total')}:</span>
                                    <span className="text-lg">{formatCurrencyWithSettings(Number(invoice.total))}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('invoice.details')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-3 text-sm">
                                <div>
                                    <p className="font-medium">{t('invoice.issueDate')}</p>
                                    <p className="text-muted-foreground">{formatDate(invoice.issueDate)}</p>
                                </div>
                                <div>
                                    <p className="font-medium">{t('invoice.dueDate')}</p>
                                    <p className="text-muted-foreground">{formatDate(invoice.dueDate)}</p>
                                </div>
                                <div>
                                    <p className="font-medium">{t('invoice.created')}</p>
                                    <p className="text-muted-foreground">{formatDate(invoice.createdAt)}</p>
                                </div>
                                {invoice.updatedAt !== invoice.createdAt && (
                                    <div>
                                        <p className="font-medium">{t('invoice.lastUpdated')}</p>
                                        <p className="text-muted-foreground">{formatDate(invoice.updatedAt)}</p>
                                    </div>
                                )}
                                {settings && (
                                    <div>
                                        <p className="font-medium">{t('invoice.currency')}</p>
                                        <p className="text-muted-foreground">{settings.currency}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('invoice.quickActions')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <Link href={`/dashboard/customers/${invoice?.customer?.id}`}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Users className="w-4 h-4 mr-2" />
                                        {t('invoice.viewCustomer')}
                                    </Button>
                                </Link>

                                <Link href={`/dashboard/invoices/new?customerId=${invoice?.customer?.id}`}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t('invoice.newInvoiceForCustomer')}
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
                        <AlertDialogTitle>{t('invoice.deleteInvoice')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('invoice.deleteConfirmation', { invoiceNumber: invoice.invoiceNumber })}
                            {t('invoice.cannotBeUndone')}
                            {invoice.status !== InvoiceStatus.DRAFT && (
                                <span className="block mt-2 text-destructive">
                                    {t('invoice.onlyDraftsCanBeDeleted')}
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteInvoice}
                            disabled={invoice.status !== InvoiceStatus.DRAFT}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('invoice.deleteInvoice')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function InvoiceDetailSkeleton() {
    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-32" />
                    <div>
                        <Skeleton className="h-8 w-48" />
                        <div className="flex items-center gap-2 mt-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-9" />
                </div>
            </div>

            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3">
                {/* Main Content */}
                <div className="flex flex-col lg:col-span-2 gap-6">
                    {/* Business Info */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-16" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-3">
                                <Skeleton className="h-6 w-32" />
                                <div className="flex flex-col gap-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-4" />
                                            <Skeleton className="h-4 w-48" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-16" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-3">
                                <Skeleton className="h-6 w-32" />
                                <div className="flex flex-col gap-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-2">
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
                            <div className="flex flex-col gap-4">
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
                <div className="flex flex-col gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-3">
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