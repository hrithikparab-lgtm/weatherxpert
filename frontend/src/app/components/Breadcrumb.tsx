import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12px]">
      <button className="text-slate-500 hover:text-blue-400 transition-colors p-0.5">
        <Home className="w-3.5 h-3.5" />
      </button>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 text-slate-700" />
            {isLast ? (
              <span className="text-slate-200 font-medium">
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="text-slate-500 hover:text-blue-400 transition-colors"
              >
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
