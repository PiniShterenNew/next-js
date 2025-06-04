'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Customer } from '@/types'
import { useCustomers } from '@/hooks/use-customers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  MapPin,
  FileText,
  Users,
  Loader2
} from 'lucide-react'
import { formatDate, debounce } from '@/lib/utils'
import { useCallback } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function CustomersList() {
  const t = useTranslations('customers')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  
  const { 
    customers, 
    loading, 
    error, 
    pagination,
    deleteCustomer,
    refreshCustomers 
  } = useCustomers({ search, page, limit: 10 })

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

  const handleDeleteCustomer = async (customer: Customer) => {
    const success = await deleteCustomer(customer.id)
    if (success) {
      setCustomerToDelete(null)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>{t('error', { message: error })}</p>
            <Button onClick={refreshCustomers} className="mt-4">
              {t('tryAgain')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('addCustomer')}
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('search')}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>
                {pagination ? t('customersCount', { count: pagination.total }) : t('loading')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>{t('empty')}</p>
              <Link href="/dashboard/customers/new">
                <Button className="mt-4">
                  {t('createFirst')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <CustomerCard 
              key={customer.id} 
              customer={customer}
              onDelete={() => setCustomerToDelete(customer)}
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
      <AlertDialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteCustomer.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteCustomer.description', { name: customerToDelete?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteCustomer.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => customerToDelete && handleDeleteCustomer(customerToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('deleteCustomer.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface CustomerCardProps {
  customer: Customer
  onDelete: () => void
}

function CustomerCard({ customer, onDelete }: CustomerCardProps) {
  const t = useTranslations('customers')
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{customer.name}</CardTitle>
            <div className="flex items-center gap-1 mt-1">
              <Mail className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{customer.email}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/customers/${customer.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  {t('card.viewDetails')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/customers/${customer.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  {t('card.editCustomer')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('card.deleteCustomer')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-col gap-2">
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span>{customer.phone}</span>
            </div>
          )}
          
          {customer.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{customer.address}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <FileText className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {t('card.invoices', { count: (customer as any)._count?.invoices || 0 })}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {formatDate(customer.createdAt, 'MMM yyyy')}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}