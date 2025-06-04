// User types (for Clerk integration)
export interface User {
  id: string;
  clerkId: string; // Clerk's user ID
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer types
export interface Customer {
  id: string;
  userId: string; // Foreign key to User
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string; // מספר עוסק מורשה
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export type UpdateCustomerData = Partial<CreateCustomerData>;
// This file contains TypeScript types and interfaces for the invoicing application.

// Invoice types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string; // Foreign key to User
  customerId: string;
  customer?: Customer; // עבור populated queries
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface CreateInvoiceData {
  customerId: string;
  dueDate: Date;
  notes?: string;
  discount?: number;
  items: CreateInvoiceItemData[];
}

export interface CreateInvoiceItemData {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: InvoiceStatus;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface InvoiceFormData {
  customerId: string;
  dueDate: string; // HTML date input מחזיר string
  notes: string;
  discount: string; // HTML input מחזיר string
  items: InvoiceItemFormData[];
}

export interface InvoiceItemFormData {
  description: string;
  quantity: string; // HTML input מחזיר string
  unitPrice: string; // HTML input מחזיר string
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
}

// Search and Filter types
export interface InvoiceFilters {
  status?: InvoiceStatus[];
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface CustomerFilters {
  search?: string; // חיפוש בשם או אימייל
}

// Dashboard/Analytics types
export interface DashboardStats {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalCustomers: number;
  recentInvoices: Invoice[];
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  invoiceCount: number;
}

// Settings types
export interface UserSettings {
  id: string;
  userId: string;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  taxRate: number; // Default tax rate percentage
  currency: string; // ISO currency code (e.g., 'ILS', 'USD')
  invoicePrefix: string; // Prefix for invoice numbers
  nextInvoiceNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export type UpdateUserSettingsData = Partial<Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

// Table/List component types
export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Utility types
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: ValidationError[];
}


// Notification types
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  read: boolean
  actionUrl?: string
  createdAt: Date
  updatedAt: Date
}

export enum NotificationType {
  INVOICE_CREATED = 'INVOICE_CREATED',
  INVOICE_OVERDUE = 'INVOICE_OVERDUE',
  INVOICE_PAID = 'INVOICE_PAID',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  REMINDER = 'REMINDER',
  CUSTOMER_CREATED = 'CUSTOMER_CREATED',
  CUSTOMER_UPDATED = 'CUSTOMER_UPDATED',
  CUSTOMER_DELETED = 'CUSTOMER_DELETED',
  SETTINGS_UPDATED = 'SETTINGS_UPDATED'
}

export interface CreateNotificationData {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  actionUrl?: string
}

// Notification API responses
export interface NotificationsResponse extends ApiResponse<Notification[]> {
  unreadCount: number
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 
export interface ClerkError {
  errors: {
    code: string
    message: string
    meta?: Record<string, any>
  }[]
}