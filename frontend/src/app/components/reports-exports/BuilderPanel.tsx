import { useState, useCallback } from "react";
import {
  GripVertical,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  Users,
  Mail,
  Filter,
  Layers,
  BarChart3,
  Table2,
  Map,
  Type,
  Minus,
  Lock,
  Info,
} from "lucide-react";
import {
  BUILDER_COMPONENTS,
  COMPONENT_TYPE_CONFIG,
  REGIONS,
  STATIONS_LIST,
  PROVIDERS_LIST,
  DATE_RANGE_OPTIONS,
  RECIPIENT_SUGGESTIONS,
  DAY_NAMES,
  TIMEZONE,
  type BuilderComponent,
  type ComponentType,
  type ScheduleConfig,
  type ScheduleFrequency,
  type ReportFilter,
} from "./reportsExportData";

/* ═══════════════════════════════════════════════════
   BUILDER PANEL — Center panel with component palette,
   active components list, filters, recipients, schedule
   ═══════════════════════════════════════════════════ */

const TYPE_ICONS: Record<ComponentType, React.ElementType> = {
  kpi: BarChart3, chart: BarChart3, table: Table2,
  map_snapshot: Map, text: Type, divider: Minus,
};

interface BuilderPanelProps {
  activeComponents: string[];
  onAddComponent: (id: string) => void;
  onRemoveComponent: (id: string) => void;
  onReorderComponent: (id: string, dir: "up" | "down") => void;
  filters: ReportFilter;
  onUpdateFilters: (filters: ReportFilter) => void;
  recipients: string[];
  onUpdateRecipients: (r: string[]) => void;
  schedule: ScheduleConfig;
  onUpdateSchedule: (s: ScheduleConfig) => void;
  canSchedule: boolean;
  reportName: string;
  onUpdateName: (n: string) => void;
}

export function BuilderPanel({
  activeComponents, onAddComponent, onRemoveComponent, onReorderComponent,
  filters, onUpdateFilters, recipients, onUpdateRecipients,
  schedule, onUpdateSchedule, canSchedule, reportName, onUpdateName,
}: BuilderPanelProps) {
  const [section, setSection] = useState<"components" | "filters" | "recipients" | "schedule">("components");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [recipientInput, setRecipientInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const activeComps = activeComponents
    .map((id) => BUILDER_COMPONENTS.find((c) => c.id === id))
    .filter(Boolean) as BuilderComponent[];

  const availableComps = BUILDER_COMPONENTS.filter(
    (c) => !activeComponents.includes(c.id)
  );

  const addRecipient = useCallback((email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (trimmed && !recipients.includes(trimmed)) {
      onUpdateRecipients([...recipients, trimmed]);
    }
    setRecipientInput("");
    setShowSuggestions(false);
  }, [recipients, onUpdateRecipients]);

  const filteredSuggestions = RECIPIENT_SUGGESTIONS.filter(
    (s) => s.includes(recipientInput.toLowerCase()) && !recipients.includes(s)
  );

  const tabs = [
    { id: "components" as const, label: "Components", icon: Layers, count: activeComponents.length },
    { id: "filters" as const,    label: "Filters",    icon: Filter },
    { id: "recipients" as const, label: "Recipients", icon: Mail, count: recipients.length },
    { id: "schedule" as const,   label: "Schedule",   icon: Clock },
  ];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col h-full">
      {/* Report name */}
      <div className="px-4 py-3 border-b border-border/60 bg-secondary/10 flex-shrink-0">
        <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Report Name</label>
        <input
          type="text"
          value={reportName}
          onChange={(e) => onUpdateName(e.target.value)}
          className="w-full px-3 py-1.5 bg-secondary/40 border border-border rounded-lg text-[12px] text-foreground font-medium outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
          placeholder="e.g. Daily Operations Summary"
        />
      </div>

      {/* Section tabs */}
      <div className="flex border-b border-border/40 flex-shrink-0 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-medium whitespace-nowrap transition-all border-b-2 ${
                section === tab.id
                  ? "border-b-primary text-primary"
                  : "border-b-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-[8px] tabular-nums px-1 py-0.5 rounded bg-secondary">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Components tab ── */}
        {section === "components" && (
          <div className="p-3 space-y-2">
            {/* Active components */}
            {activeComps.length === 0 ? (
              <div className="py-6 text-center border-2 border-dashed border-border rounded-xl">
                <Layers className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-[11px] text-muted-foreground/50">No components added yet</p>
                <p className="text-[9px] text-muted-foreground/30 mt-0.5">Click "Add Component" to start building</p>
              </div>
            ) : (
              <div className="space-y-1">
                {activeComps.map((comp, idx) => {
                  const typeConf = COMPONENT_TYPE_CONFIG[comp.type];
                  const TypeIcon = TYPE_ICONS[comp.type];
                  return (
                    <div
                      key={comp.id}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/40 bg-secondary/5 hover:bg-secondary/15 transition-colors group"
                    >
                      <GripVertical className="w-3 h-3 text-muted-foreground/20 flex-shrink-0 cursor-grab" />
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${typeConf.bgColor}`}>
                        <TypeIcon className={`w-2.5 h-2.5 ${typeConf.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-foreground font-medium truncate">{comp.label}</p>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onReorderComponent(comp.id, "up")}
                          disabled={idx === 0}
                          className="p-0.5 rounded text-muted-foreground/50 hover:text-foreground disabled:opacity-20"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onReorderComponent(comp.id, "down")}
                          disabled={idx === activeComps.length - 1}
                          className="p-0.5 rounded text-muted-foreground/50 hover:text-foreground disabled:opacity-20"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onRemoveComponent(comp.id)}
                          className="p-0.5 rounded text-muted-foreground/30 hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add component button */}
            <button
              onClick={() => setPaletteOpen(!paletteOpen)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-border rounded-lg text-[10px] text-muted-foreground font-medium hover:text-primary hover:border-primary/30 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Component
              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${paletteOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Palette */}
            {paletteOpen && (
              <div className="border border-border rounded-lg bg-card overflow-hidden animate-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-2 bg-secondary/10 border-b border-border/30">
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Available Components</p>
                </div>
                <div className="max-h-[200px] overflow-y-auto divide-y divide-border/10">
                  {availableComps.map((comp) => {
                    const typeConf = COMPONENT_TYPE_CONFIG[comp.type];
                    const TypeIcon = TYPE_ICONS[comp.type];
                    return (
                      <button
                        key={comp.id}
                        onClick={() => { onAddComponent(comp.id); setPaletteOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-secondary/10 transition-colors"
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${typeConf.bgColor}`}>
                          <TypeIcon className={`w-2.5 h-2.5 ${typeConf.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-foreground font-medium truncate">{comp.label}</p>
                          <p className="text-[8px] text-muted-foreground/50 truncate">{comp.description}</p>
                        </div>
                        <span className={`text-[7px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded ${typeConf.bgColor} ${typeConf.color}`}>
                          {typeConf.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Filters tab ── */}
        {section === "filters" && (
          <div className="p-3 space-y-3">
            <div>
              <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => onUpdateFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-secondary/40 border border-border rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {DATE_RANGE_OPTIONS.map((o) => (
                  <option key={o} value={o} className="bg-popover">{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Region</label>
              <select
                value={filters.region}
                onChange={(e) => onUpdateFilters({ ...filters, region: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-secondary/40 border border-border rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r} className="bg-popover">{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Stations</label>
              <select
                value={filters.stations[0] || "All Stations"}
                onChange={(e) => onUpdateFilters({ ...filters, stations: [e.target.value] })}
                className="w-full px-2.5 py-1.5 bg-secondary/40 border border-border rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {STATIONS_LIST.map((s) => (
                  <option key={s} value={s} className="bg-popover">{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Providers</label>
              <select
                value={filters.providers[0] || "All Providers"}
                onChange={(e) => onUpdateFilters({ ...filters, providers: [e.target.value] })}
                className="w-full px-2.5 py-1.5 bg-secondary/40 border border-border rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {PROVIDERS_LIST.map((p) => (
                  <option key={p} value={p} className="bg-popover">{p}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ── Recipients tab ── */}
        {section === "recipients" && (
          <div className="p-3 space-y-3">
            <div className="relative">
              <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Add Recipient</label>
              <div className="relative">
                <Mail className="w-3 h-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={recipientInput}
                  onChange={(e) => { setRecipientInput(e.target.value); setShowSuggestions(true); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && recipientInput) addRecipient(recipientInput); }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="email@tatapower.com"
                  className="w-full pl-7 pr-3 py-1.5 bg-secondary/40 border border-border rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
                />
              </div>
              {showSuggestions && recipientInput && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-popover border border-border rounded-lg shadow-xl overflow-hidden">
                  {filteredSuggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => addRecipient(s)}
                      className="w-full text-left px-3 py-1.5 text-[10px] text-foreground hover:bg-secondary transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current recipients */}
            {recipients.length > 0 ? (
              <div className="space-y-1">
                {recipients.map((email) => (
                  <div key={email} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-secondary/20 border border-border/30">
                    <Mail className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                    <span className="text-[10px] text-foreground font-mono flex-1 truncate">{email}</span>
                    <button
                      onClick={() => onUpdateRecipients(recipients.filter((r) => r !== email))}
                      className="p-0.5 rounded text-muted-foreground/30 hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <Users className="w-5 h-5 text-muted-foreground/15 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground/40">No recipients added</p>
              </div>
            )}

            {/* Quick-add */}
            <div>
              <p className="text-[9px] text-muted-foreground/50 font-semibold uppercase tracking-wider mb-1">Quick Add</p>
              <div className="flex flex-wrap gap-1">
                {RECIPIENT_SUGGESTIONS.filter((s) => !recipients.includes(s)).slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => addRecipient(s)}
                    className="px-2 py-1 bg-secondary/30 border border-border/30 rounded text-[8px] text-muted-foreground font-mono hover:text-foreground hover:border-border transition-colors truncate max-w-[160px]"
                  >
                    + {s.split("@")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Schedule tab ── */}
        {section === "schedule" && (
          <div className="p-3 space-y-3">
            {!canSchedule && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-chart-2/5 border border-chart-2/15">
                <Lock className="w-3 h-3 text-chart-2 flex-shrink-0" />
                <p className="text-[10px] text-chart-2 font-medium">Only Admins and Super Admins can schedule reports</p>
              </div>
            )}

            {/* Enable / disable */}
            <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/20 border border-border/40 cursor-pointer">
              <input
                type="checkbox"
                checked={schedule.enabled}
                onChange={(e) => onUpdateSchedule({ ...schedule, enabled: e.target.checked })}
                disabled={!canSchedule}
                className="w-3.5 h-3.5 rounded accent-primary cursor-pointer disabled:opacity-40"
              />
              <span className="text-[11px] text-foreground font-medium">Enable automatic scheduling</span>
            </label>

            <div className={`space-y-3 ${!schedule.enabled ? "opacity-40 pointer-events-none" : ""}`}>
              <div>
                <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Frequency</label>
                <div className="grid grid-cols-4 gap-1">
                  {(["daily", "weekly", "monthly", "once"] as ScheduleFrequency[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => onUpdateSchedule({ ...schedule, frequency: f })}
                      className={`py-1.5 rounded-lg text-[10px] font-medium capitalize transition-all ${
                        schedule.frequency === f
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {schedule.frequency === "weekly" && (
                <div>
                  <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Day of Week</label>
                  <div className="flex gap-1">
                    {DAY_NAMES.map((d, i) => (
                      <button
                        key={d}
                        onClick={() => onUpdateSchedule({ ...schedule, dayOfWeek: i })}
                        className={`flex-1 py-1.5 rounded text-[9px] font-medium transition-all ${
                          schedule.dayOfWeek === i
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {schedule.frequency === "monthly" && (
                <div>
                  <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Day of Month</label>
                  <select
                    value={schedule.dayOfMonth || 1}
                    onChange={(e) => onUpdateSchedule({ ...schedule, dayOfMonth: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-secondary/40 border border-border rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d} className="bg-popover">{d}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Time</label>
                <input
                  type="time"
                  value={schedule.time}
                  onChange={(e) => onUpdateSchedule({ ...schedule, time: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-secondary/40 border border-border rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Info className="w-2.5 h-2.5 text-muted-foreground/30" />
                <p className="text-[8px] text-muted-foreground/40">{TIMEZONE}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
