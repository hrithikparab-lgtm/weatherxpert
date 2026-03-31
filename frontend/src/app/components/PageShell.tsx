import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";

interface PageShellProps {
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, subtitle, breadcrumbs, actions, children }: PageShellProps) {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbs} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-[13px] text-slate-400 mt-1 font-normal">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
