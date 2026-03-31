import {
  ClipboardList,
  CalendarDays,
  ShieldCheck,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Sparkles,
  Copy,
  AlertCircle,
} from "lucide-react";
import {
  REPORT_TEMPLATES,
  type ReportTemplate,
} from "./reportsExportData";
import type { UserRole } from "../RoleContext";

/* ═══════════════════════════════════════════════════
   TEMPLATE LIST — Left panel with report templates,
   last-run status, category badges, role-based filtering,
   clone functionality
   ═══════════════════════════════════════════════════ */

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  "clipboard-list": ClipboardList,
  "calendar-days": CalendarDays,
  "shield-check": ShieldCheck,
  "target": Target,
};

const CATEGORY_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  operations: { label: "Operations", color: "text-chart-1", bg: "bg-chart-1/10" },
  analytics:  { label: "Analytics",  color: "text-chart-3", bg: "bg-chart-3/10" },
  compliance: { label: "Compliance", color: "text-chart-4", bg: "bg-chart-4/10" },
  custom:     { label: "Custom",     color: "text-primary",  bg: "bg-primary/10" },
};

const STATUS_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  success: { icon: CheckCircle2, color: "text-chart-3" },
  failed:  { icon: XCircle,      color: "text-destructive" },
  pending: { icon: Clock,        color: "text-chart-2" },
};

interface TemplateListProps {
  selectedTemplate: string | null;
  onSelectTemplate: (id: string) => void;
  onCreateNew: () => void;
  userRole: UserRole; // NEW: For role-based filtering
  onCloneTemplate?: (id: string) => void; // NEW: Clone functionality
}

export function TemplateList({ selectedTemplate, onSelectTemplate, onCreateNew, userRole, onCloneTemplate }: TemplateListProps) {
  // Filter templates based on user role
  const visibleTemplates = REPORT_TEMPLATES.filter((tpl) => {
    if (!tpl.allowedRoles) return true; // If no role restriction, show to all
    return tpl.allowedRoles.includes(userRole);
  });

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/60 bg-secondary/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[12px] text-foreground font-medium">Report Templates</h4>
            <p className="text-[9px] text-muted-foreground mt-0.5">{visibleTemplates.length} templates available</p>
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-medium hover:bg-primary/15 transition-colors"
          >
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>
      </div>

      {/* Template list */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/15">
        {visibleTemplates.map((tpl) => {
          const Icon = TEMPLATE_ICONS[tpl.icon] || ClipboardList;
          const catStyle = CATEGORY_STYLES[tpl.category];
          const statusConf = tpl.lastStatus ? STATUS_ICONS[tpl.lastStatus] : null;
          const StatusIcon = statusConf?.icon;
          const isSelected = selectedTemplate === tpl.id;

          return (
            <div
              key={tpl.id}
              className={`w-full text-left transition-all group relative ${
                isSelected
                  ? "bg-primary/5 border-l-2 border-l-primary"
                  : "hover:bg-secondary/20 border-l-2 border-l-transparent"
              }`}
            >
              <button
                onClick={() => onSelectTemplate(tpl.id)}
                className="w-full text-left px-4 py-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? "bg-primary/10" : "bg-secondary/50"
                  }`}>
                    <Icon className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-[11px] font-medium truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {tpl.name}
                      </p>
                    </div>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5 line-clamp-2">{tpl.description}</p>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-[7px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${catStyle.bg} ${catStyle.color}`}>
                        {catStyle.label}
                      </span>
                      <span className="text-[8px] text-muted-foreground/40 capitalize">{tpl.frequency}</span>

                      {/* Enhanced last-run status indicator */}
                      {tpl.lastRun && StatusIcon && (
                        <span className={`flex items-center gap-0.5 text-[8px] font-medium px-1.5 py-0.5 rounded ${
                          tpl.lastStatus === "failed" 
                            ? "bg-destructive/10 text-destructive" 
                            : tpl.lastStatus === "pending"
                            ? "bg-chart-2/10 text-chart-2"
                            : "bg-chart-3/10 text-chart-3"
                        }`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {tpl.lastRun.split(" ")[0].slice(5)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>

              {/* Clone button - shows on hover */}
              {onCloneTemplate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloneTemplate(tpl.id);
                  }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground shadow-sm"
                  title="Clone this template"
                >
                  <Copy className="w-3 h-3" />
                </button>
              )}

              {/* Failure indicator for failed last run */}
              {tpl.lastStatus === "failed" && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
              )}
            </div>
          );
        })}

        {/* Custom template placeholder */}
        <button
          onClick={onCreateNew}
          className="w-full text-left px-4 py-4 hover:bg-secondary/10 transition-colors group"
        >
          <div className="flex items-center gap-2.5 justify-center">
            <div className="w-8 h-8 rounded-lg bg-secondary/30 border border-dashed border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground/50 font-medium group-hover:text-foreground transition-colors">Create Custom Report</p>
              <p className="text-[9px] text-muted-foreground/30">Build from scratch with drag-in components</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
