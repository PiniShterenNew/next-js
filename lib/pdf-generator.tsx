// lib/pdf-generator.ts - PDF Generator
import { Invoice, UserSettings } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

// PDF Generation using jsPDF (need to install: npm install jspdf html2canvas)
// For now, we'll create a solution that works with browser APIs

export interface PDFGenerationOptions {
    format?: 'A4' | 'Letter'
    orientation?: 'portrait' | 'landscape'
    includeBusinessInfo?: boolean
    includeNotes?: boolean
    watermark?: string
}

export class InvoicePDFGenerator {
    private invoice: Invoice
    private settings: UserSettings | null
    private options: PDFGenerationOptions

    constructor(
        invoice: Invoice,
        settings: UserSettings | null = null,
        options: PDFGenerationOptions = {}
    ) {
        this.invoice = invoice
        this.settings = settings
        this.options = {
            format: 'A4',
            orientation: 'portrait',
            includeBusinessInfo: true,
            includeNotes: true,
            ...options
        }
    }

    /**
     * יצירת HTML עבור החשבונית
     */
    private generateInvoiceHTML(): string {
        const { invoice, settings } = this

        return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
        }
        
        .business-info h1 {
            color: #3b82f6;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .business-info p {
            margin: 5px 0;
            color: #666;
        }
        
        .invoice-details {
            text-align: right;
        }
        
        .invoice-number {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        
        .invoice-meta {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        
        .meta-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
        }
        
        .meta-label {
            font-weight: 600;
            color: #374151;
        }
        
        .customer-info {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        
        .customer-info h3 {
            color: #1e293b;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .items-table th {
            background: #3b82f6;
            color: white;
            padding: 15px;
            text-align: right;
            font-weight: 600;
        }
        
        .items-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
            text-align: right;
        }
        
        .items-table tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .total-section {
            margin-top: 30px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
        }
        
        .total-row.final {
            border-top: 2px solid #3b82f6;
            padding-top: 15px;
            margin-top: 15px;
            font-size: 18px;
            font-weight: bold;
            color: #3b82f6;
        }
        
        .notes-section {
            margin-top: 40px;
            padding: 20px;
            background: #fefefe;
            border-right: 4px solid #3b82f6;
        }
        
        .notes-section h4 {
            color: #374151;
            margin-bottom: 10px;
        }
        
        .notes-section p {
            color: #6b7280;
            white-space: pre-wrap;
        }
        
        .footer {
            margin-top: 60px;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-paid { background: #dcfce7; color: #166534; }
        .status-pending { background: #dbeafe; color: #1d4ed8; }
        .status-overdue { background: #fee2e2; color: #dc2626; }
        .status-draft { background: #f3f4f6; color: #374151; }
        .status-cancelled { background: #f3f4f6; color: #6b7280; }
        
        @media print {
            body { padding: 20px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
            <div class="business-info">
                ${settings?.businessName ? `<h1>${settings.businessName}</h1>` : ''}
                ${settings?.businessAddress ? `<p>${settings.businessAddress}</p>` : ''}
                ${settings?.businessPhone ? `<p>טלפון: ${settings.businessPhone}</p>` : ''}
                ${settings?.businessEmail ? `<p>אימייל: ${settings.businessEmail}</p>` : ''}
            </div>
            <div class="invoice-details">
                <div class="invoice-number">${invoice.invoiceNumber}</div>
                <span class="status-badge status-${invoice.status.toLowerCase()}">
                    ${this.getStatusText(invoice.status)}
                </span>
            </div>
        </div>

        <!-- Invoice Meta -->
        <div class="invoice-meta">
            <div class="meta-row">
                <span class="meta-label">תאריך הפקה:</span>
                <span>${formatDate(invoice.issueDate)}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">תאריך פירעון:</span>
                <span>${formatDate(invoice.dueDate)}</span>
            </div>
            ${settings?.currency ? `
            <div class="meta-row">
                <span class="meta-label">מטבע:</span>
                <span>${settings.currency}</span>
            </div>
            ` : ''}
        </div>

        <!-- Customer Info -->
        <div class="customer-info">
            <h3>פרטי לקוח</h3>
            <p><strong>${invoice?.customer?.name}</strong></p>
            <p>${invoice?.customer?.email}</p>
            ${invoice?.customer?.phone ? `<p>טלפון: ${invoice?.customer?.phone}</p>` : ''}
            ${invoice?.customer?.address ? `<p>${invoice?.customer?.address}</p>` : ''}
            ${invoice?.customer?.taxId ? `<p>ח.פ/ע.מ: ${invoice?.customer?.taxId}</p>` : ''}
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>סה"כ</th>
                    <th>מחיר יחידה</th>
                    <th>כמות</th>
                    <th>תיאור</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                <tr>
                    <td>${this.formatCurrency(Number(item.total))}</td>
                    <td>${this.formatCurrency(Number(item.unitPrice))}</td>
                    <td>${Number(item.quantity)}</td>
                    <td><strong>${item.description}</strong></td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Totals -->
        <div class="total-section">
            <div class="total-row">
                <span>סכום חלקי:</span>
                <span>${this.formatCurrency(Number(invoice.subtotal))}</span>
            </div>
            ${Number(invoice.discount) > 0 ? `
            <div class="total-row" style="color: #dc2626;">
                <span>הנחה:</span>
                <span>-${this.formatCurrency(Number(invoice.discount))}</span>
            </div>
            ` : ''}
            <div class="total-row">
                <span>מע"מ (${settings?.taxRate || 0}%):</span>
                <span>${this.formatCurrency(Number(invoice.tax))}</span>
            </div>
            <div class="total-row final">
                <span>סה"כ לתשלום:</span>
                <span>${this.formatCurrency(Number(invoice.total))}</span>
            </div>
        </div>

        ${invoice.notes && this.options.includeNotes ? `
        <!-- Notes -->
        <div class="notes-section">
            <h4>הערות</h4>
            <p>${invoice.notes}</p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
            <p>חשבונית זו הופקה על ידי ${settings?.businessName || 'מערכת ניהול חשבוניות'}</p>
            <p>תאריך הפקה: ${formatDate(new Date())}</p>
        </div>
    </div>
</body>
</html>
    `
    }

    /**
     * פתיחת החשבונית בחלון חדש לצפיה/הדפסה
     */
    async viewPDF(): Promise<void> {
        const htmlContent = this.generateInvoiceHTML()

        const printWindow = window.open('', '_blank')
        if (!printWindow) {
            throw new Error('אשיית המערכת. אנא אפשר חלונות קופצים כדי לצפות ב-PDF.')
        }

        printWindow.document.write(htmlContent)
        printWindow.document.close()

        // מחכה שהתוכן ייטען ואז פותח את תיבת ההדפסה
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print()
            }, 250)
        }
    }

    /**
     * הורדת החשבונית כ-PDF (דורש html2pdf או jsPDF)
     */
    async downloadPDF(): Promise<void> {
        // זה יצריך התקנה של ספרייה חיצונית
        // כרגע נשתמש בפונקציית print של הדפדפן
        await this.viewPDF()
    }

    /**
     * שיתוף החשבונית
     */
    async sharePDF(): Promise<void> {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `חשבונית ${this.invoice.invoiceNumber}`,
                    text: `חשבונית עבור ${this.invoice.customer?.name}`,
                    url: window.location.href
                })
            } catch (error) {
                console.log('שיתוף בוטל או נכשל')
            }
        } else {
            // fallback לעותק קישור
            await navigator.clipboard.writeText(window.location.href)
            alert('קישור החשבונית הועתק ללוח')
        }
    }

    /**
     * עזר - עיצוב מטבע
     */
    private formatCurrency(amount: number): string {
        if (this.settings?.currency) {
            return new Intl.NumberFormat('he-IL', {
                style: 'currency',
                currency: this.settings.currency,
            }).format(amount)
        }
        return formatCurrency(amount)
    }

    /**
     * עזר - טקסט סטטוס
     */
    private getStatusText(status: string): string {
        const statusMap = {
            'DRAFT': 'טיוטה',
            'SENT': 'נשלח',
            'PAID': 'שולם',
            'OVERDUE': 'פג תוקף',
            'CANCELLED': 'בוטל'
        }
        return statusMap[status as keyof typeof statusMap] || status
    }
}

// Hook לשימוש ב-PDF Generator
export function useInvoicePDF() {
    const generatePDF = (
        invoice: Invoice,
        settings: UserSettings | null,
        options?: PDFGenerationOptions
    ) => {
        return new InvoicePDFGenerator(invoice, settings, options)
    }

    return { generatePDF }
}

// Component for PDF Actions
import { Button } from '@/components/ui/button'
import { Download, Eye, Share2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface PDFActionsProps {
    invoice: Invoice
    settings: UserSettings | null
}

export function PDFActions({ invoice, settings }: PDFActionsProps) {
    const { generatePDF } = useInvoicePDF()

    const handleView = async () => {
        try {
            const pdfGenerator = generatePDF(invoice, settings)
            await pdfGenerator.viewPDF()
        } catch (error) {
            console.error('Error viewing PDF:', error)
            alert('שגיאה בפתיחת ה-PDF')
        }
    }

    const handleDownload = async () => {
        try {
            const pdfGenerator = generatePDF(invoice, settings)
            await pdfGenerator.downloadPDF()
        } catch (error) {
            console.error('Error downloading PDF:', error)
            alert('שגיאה בהורדת ה-PDF')
        }
    }

    const handleShare = async () => {
        try {
            const pdfGenerator = generatePDF(invoice, settings)
            await pdfGenerator.sharePDF()
        } catch (error) {
            console.error('Error sharing PDF:', error)
            alert('שגיאה בשיתוף ה-PDF')
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                    <Eye className="w-4 h-4 mr-2" />
                    צפיה והדפסה
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    הורדה
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    שיתוף
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}