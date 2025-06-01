import { Metadata } from 'next'
import { HomePageContent } from '@/components/home/home-page-content'

export const metadata: Metadata = {
  title: 'InvoicePro - Invoice Management System',
  description: 'Create, send, and track professional invoices with ease. Manage customers and payments all in one place.',
}

export default function HomePage() {
  return <HomePageContent />
}