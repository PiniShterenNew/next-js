// components/InvoiceStatusBadge.tsx

import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  Send,
  Clock,
  AlertTriangle,
  FileText,
  X,
  HelpCircle
} from 'lucide-react';

interface StatusConfig {
  color: string;
  icon: typeof CheckCircle;
  translationKey: string;
}

// קונפיגורציה מקומית בתוך הרכיב
const STATUS_CONFIG: Record<string, StatusConfig> = {
  paid: {
    color: 'bg-green-100 text-green-800 border border-green-300',
    icon: CheckCircle,
    translationKey: 'invoices.status.paid'
  },

  sent: {
    color: 'bg-blue-100 text-blue-800 border border-blue-300',
    icon: Send,
    translationKey: 'invoices.status.sent'
  },

  pending: {
    color: 'bg-blue-100 text-blue-800 border border-blue-300',
    icon: Clock,
    translationKey: 'invoices.status.pending'
  },

  overdue: {
    color: 'bg-red-100 text-red-800 border border-red-300',
    icon: AlertTriangle,
    translationKey: 'invoices.status.overdue'
  },

  draft: {
    color: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    icon: FileText,
    translationKey: 'invoices.status.draft'
  },

  cancelled: {
    color: 'bg-gray-100 text-gray-800 border border-gray-300',
    icon: X,
    translationKey: 'invoices.status.cancelled'
  },

  default: {
    color: 'bg-gray-100 text-gray-800 border border-gray-300',
    icon: HelpCircle,
    translationKey: 'invoices.status.unknown'
  }
};

interface InvoiceStatusBadgeProps {
  status: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  Badge?: React.ComponentType<{ className: string; children: React.ReactNode }>;
}

export function InvoiceStatusBadge({
  status,
  showIcon = true,
  size = 'md',
  className = '',
  Badge
}: InvoiceStatusBadgeProps) {
  // קבלת הקונפיגורציה המקומית עם toLowerCase
  const config = STATUS_CONFIG[status.toLowerCase()] || STATUS_CONFIG.default;
  const IconComponent = config.icon;
  const { t } = useTranslation()

  const sizeConfig = {
    sm: {
      padding: 'px-2 py-1',
      text: 'text-xs',
      gap: 'gap-1',
      iconSize: 12
    },
    md: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      gap: 'gap-1.5',
      iconSize: 14
    },
    lg: {
      padding: 'px-4 py-2',
      text: 'text-base',
      gap: 'gap-2',
      iconSize: 16
    }
  };

  const currentSize = sizeConfig[size];

  const content = (
    <div className={cn("flex items-center", currentSize.gap)}>
      {showIcon && (
        <IconComponent
          size={currentSize.iconSize}
          className="shrink-0"
        />
      )}
      <span className="leading-none">
        {t(config.translationKey)}
      </span>
    </div>
  );

  // אם יש Badge - השתמש בו
  if (Badge) {
    return (
      <Badge className={cn(config.color, className)}>
        {content}
      </Badge>
    );
  }

  // אחרת - רכיב עצמאי
  return (
    <span className={cn(
      "inline-flex items-center font-medium rounded-full transition-all duration-200",
      config.color,
      currentSize.padding,
      currentSize.text,
      currentSize.gap,
      className
    )}>
      {showIcon && (
        <IconComponent
          size={currentSize.iconSize}
          className="shrink-0"
        />
      )}
      <span className="leading-none">
        {t(config.translationKey)}
      </span>
    </span>
  );
}