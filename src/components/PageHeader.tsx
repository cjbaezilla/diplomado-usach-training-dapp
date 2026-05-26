import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  breadcrumbItems: BreadcrumbItem[];
  actions?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbItems,
  actions,
  icon: Icon,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "w-full border-b border-border/40 pb-6 mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-in fade-in duration-300",
        className
      )}
    >
      <div className="space-y-3 text-left flex-1 min-w-0">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-muted-foreground/80">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Inicio</span>
          </Link>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm truncate max-w-[120px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium truncate max-w-[150px] sm:max-w-none" aria-current="page">
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Title & Icon */}
        <div className="flex items-center gap-3 flex-wrap">
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0 shadow-inner">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground/95 flex items-center gap-2">
            {title}
          </h1>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl">
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap pt-2 md:pt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
