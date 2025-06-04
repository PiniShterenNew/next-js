// components/layout/sidebar.tsx - עדכון עם התראות
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useUnreadNotificationsCount } from '@/hooks/use-notifications'
import { useTranslation } from '@/hooks/use-translation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Receipt,
  Plus,
  Bell
} from 'lucide-react'
import { useLocale } from 'next-intl'

export const SidebarContent = ({setIsOpen}: {setIsOpen: (isOpen: boolean) => void}) => {
  const pathname = usePathname()
  const { unreadCount } = useUnreadNotificationsCount()
  const { t } = useTranslation()

  const sidebarItems = useMemo(() => [
    {
      title: t('navigation.dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('navigation.invoices'),
      href: '/dashboard/invoices',
      icon: FileText,
      children: [
        {
          title: t('navigation.allInvoices'),
          href: '/dashboard/invoices',
          icon: Receipt,
        },
        {
          title: t('navigation.createInvoice'),
          href: '/dashboard/invoices/new',
          icon: Plus,
        },
      ],
    },
    {
      title: t('navigation.customers'),
      href: '/dashboard/customers',
      icon: Users,
      children: [
        {
          title: t('navigation.allCustomers'),
          href: '/dashboard/customers',
          icon: Users,
        },
        {
          title: t('navigation.addCustomer'),
          href: '/dashboard/customers/new',
          icon: Plus,
        },
      ],
    },
    {
      title: t('navigation.notifications'),
      href: '/dashboard/notifications',
      icon: Bell,
    },
    {
      title: t('navigation.settings'),
      href: '/dashboard/settings',
      icon: Settings,
    },
  ], [t])

  return (
    <div className="flex flex-col lg:h-full lg:border-l border-border bg-card">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Receipt className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">{t('appName')}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-1 p-4 gap-2">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            pathname={pathname}
            unreadCount={item.title === t('navigation.notifications') ? unreadCount : undefined}
            onItemClick={() => setIsOpen(false)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="hidden lg:block p-4">
        <p className="text-xs text-muted-foreground text-center">
          {t('footer.copyright')}
        </p>
      </div>
    </div>
  )
}

export function Sidebar() {


  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-card">
        <SidebarContent setIsOpen={() => {}} />
      </div>
    </>
  )
}

interface SidebarItem {
  title: string
  href: string
  icon: React.ElementType
  children?: Array<{
    title: string
    href: string
    icon: React.ElementType
  }>
}

interface SidebarItemProps {
  item: SidebarItem
  pathname: string
  unreadCount?: number
  onItemClick: () => void
}

function normalizePath(path: string, locale: string) {
  // מסיר את הקידומת (למשל /he/ או /en/) מהנתיב
  return path.startsWith(`/${locale}/`)
    ? path.replace(`/${locale}`, '')
    : path === `/${locale}`
      ? '/'
      : path;
}

export function SidebarItem({ item, pathname, unreadCount, onItemClick }: SidebarItemProps) {
  const locale = useLocale();
  const normalizedPath = normalizePath(pathname, locale);
  const isRtl = locale === 'he';

  const [isExpanded, setIsExpanded] = useState(
    item.children ? item.children.some(child => normalizedPath === child.href) : false
  );

  const isActive = normalizedPath === item.href ||
    (item.children && item.children.some(child => normalizedPath === child.href));

  if (item.children) {
    return (
      <div className="gap-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-4 h-4" />
            <span>{item.title}</span>
          </div>
          <div >
            {isRtl ? (isExpanded ? '▼' : '◀') : (isExpanded ? '▼' : '▶')}
          </div>
        </button>

        {isExpanded && (
          <div className="flex flex-col my-2 ml-4 gap-2">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  normalizedPath === child.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <child.icon className="w-4 h-4" />
                <span>{child.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onItemClick}
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        normalizedPath === item.href
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <div className="flex items-center gap-3">
        <item.icon className="w-4 h-4" />
        <span>{item.title}</span>
      </div>
      {unreadCount && unreadCount > 0 && (
        <Badge variant="destructive" className="text-xs">
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Link>
  );
}