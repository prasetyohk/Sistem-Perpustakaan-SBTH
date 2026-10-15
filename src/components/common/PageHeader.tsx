'use client';

import React from 'react';

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  iconBgClass?: string;
  iconTextClass?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  subtitle,
  badge,
  iconBgClass = 'bg-amber-500/15',
  iconTextClass = 'text-amber-500',
  actions,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border ${className}`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border border-border/80 shadow-2xs ${iconBgClass} ${iconTextClass}`}
        >
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-text">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-text-muted mt-0.5 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
};
