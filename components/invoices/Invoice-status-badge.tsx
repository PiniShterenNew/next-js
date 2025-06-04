// components/InvoiceStatusBadge.tsx - FIXED VERSION

import { getStatusConfig, cn } from '@/lib/utils';

interface InvoiceStatusProps {
  status: string;
  t: (key: string) => string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  // אופציונלי: אם רוצה להשתמש עם Badge קיים
  Badge?: React.ComponentType<{ className: string; children: React.ReactNode }>;
}

export function InvoiceStatusBadge({ 
  status, 
  t, 
  showIcon = true,
  size = 'md',
  className = '',
  Badge
}: InvoiceStatusProps) {
  const config = getStatusConfig(status);
  const IconComponent = config.icon;
  
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
      "inline-flex items-center font-medium rounded-full border transition-all duration-200",
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