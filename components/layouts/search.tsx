'use client'

import { useState, useRef, useEffect } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCustomers } from '@/hooks/use-customers'
import { useEnhancedInvoices } from '@/hooks/use-enhanced-invoices'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { Invoice, Customer } from '@/types'

export function Search() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  // Fetch data using hooks
  const { customers } = useCustomers({ limit: 100 })
  const { invoices } = useEnhancedInvoices({ limit: 100 })
  
  // Filter results based on query
  const filteredInvoices = invoices.filter((invoice: Invoice) => {
    const invoiceNumber = invoice.invoiceNumber.toLowerCase()
    const customer = customers.find((c: Customer) => c.id === invoice.customerId)
    const customerName = customer?.name.toLowerCase() || ''
    
    return query && (
      invoiceNumber.includes(query.toLowerCase()) || 
      customerName.includes(query.toLowerCase()) ||
      invoice.items.some((item) => typeof item.description === 'string' && item.description.toLowerCase().includes(query.toLowerCase()))
    )
  })
  
  const filteredCustomers = customers.filter((customer: Customer) => {
    return query && (
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(query.toLowerCase())) ||
      (customer.phone && customer.phone.toLowerCase().includes(query.toLowerCase()))
    )
  })
  
  // Handle outside click to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  // Handle escape key to close results
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])
  
  // Show results when typing
  useEffect(() => {
    if (query) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [query])
  
  // Handle navigation and close results
  const handleNavigate = (url: string) => {
    router.push(url)
    setIsOpen(false)
    setQuery('')
  }
  
  return (
    <div className="relative">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search invoices, customers..."
          className="pl-10 pr-4 py-2 w-64 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      
      {/* Search Results */}
      {isOpen && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 mt-1 w-80 max-h-96 overflow-y-auto bg-background border border-border rounded-lg shadow-lg z-50"
        >
          {query && (filteredInvoices.length === 0 && filteredCustomers.length === 0) && (
            <div className="p-4 text-center text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}
          
          {/* Invoices Results */}
          {filteredInvoices.length > 0 && (
            <div className="p-2">
              <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                Invoices
              </h3>
              <div className="gap-1">
                {filteredInvoices.slice(0, 5).map((invoice: Invoice) => {
                  const customer = customers.find((c: Customer) => c.id === invoice.customerId)
                  return (
                    <button
                      key={invoice.id}
                      onClick={() => handleNavigate(`/dashboard/invoices/${invoice.id}`)}
                      className="w-full px-2 py-2 text-left rounded hover:bg-muted flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {customer?.name} • {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(invoice.total)}
                      </div>
                    </button>
                  )
                })}
                {filteredInvoices.length > 5 && (
                  <button
                    onClick={() => handleNavigate('/dashboard/invoices')}
                    className="w-full px-2 py-1 text-xs text-center text-muted-foreground hover:text-foreground"
                  >
                    View all {filteredInvoices.length} invoices
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Customers Results */}
          {filteredCustomers.length > 0 && (
            <div className="p-2 border-t border-border">
              <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                Customers
              </h3>
              <div className="gap-1">
                {filteredCustomers.slice(0, 5).map((customer: Customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleNavigate(`/dashboard/customers/${customer.id}`)}
                    className="w-full px-2 py-2 text-left rounded hover:bg-muted"
                  >
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {customer.email || 'No email'} • {customer.phone || 'No phone'}
                    </div>
                  </button>
                ))}
                {filteredCustomers.length > 5 && (
                  <button
                    onClick={() => handleNavigate('/dashboard/customers')}
                    className="w-full px-2 py-1 text-xs text-center text-muted-foreground hover:text-foreground"
                  >
                    View all {filteredCustomers.length} customers
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
