import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Palette,
  Type,
  Layers,
  Grid3x3,
  Zap,
  Copy,
  Check,
  Sun,
  Moon,
  ChevronRight,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Bell,
  Search,
  Settings,
  Plus,
  Download,
  Eye,
  Shield,
  Activity,
  BarChart3,
  Sparkles,
  Box,
  Code2,
  Sliders,
} from "lucide-react";
import { useTheme } from "next-themes";

/* ═══════════════════════════════════════════════
   WEATHERXPERT — DESIGN SYSTEM PAGE
   Style Guidelines & Component Reference
   ═══════════════════════════════════════════════ */

type DSTab = "foundation" | "components" | "patterns" | "tokens";

// ── Copy-to-clipboard hook ──────────────────────
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };
  return { copied, copy };
}

// ── Section wrapper ─────────────────────────────
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <div className="mb-5">
        <h2 className="text-foreground text-lg font-bold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>
        )}
        <div className="h-px bg-border/60 mt-3" />
      </div>
      {children}
    </div>
  );
}

// ── Color swatch ────────────────────────────────
function ColorSwatch({
  name,
  cssVar,
  lightHex,
  darkHex,
  description,
}: {
  name: string;
  cssVar: string;
  lightHex: string;
  darkHex: string;
  description: string;
}) {
  const { copied, copy } = useCopy();
  const id = `color-${cssVar}`;
  return (
    <div className="group flex flex-col gap-0 rounded-xl overflow-hidden border border-border/60 hover:border-primary/30 transition-colors shadow-sm">
      {/* Swatch */}
      <div
        className="h-20 w-full relative cursor-pointer"
        style={{ background: `var(${cssVar})` }}
        onClick={() => copy(cssVar, id)}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-t-xl">
          {copied === id ? (
            <Check className="w-5 h-5 text-white" />
          ) : (
            <Copy className="w-4 h-4 text-white" />
          )}
        </div>
      </div>
      {/* Meta */}
      <div className="px-3 py-2.5 bg-card flex flex-col gap-0.5">
        <p className="text-foreground text-[13px] font-semibold">{name}</p>
        <p className="text-muted-foreground text-[11px] font-mono">{cssVar}</p>
        <div className="flex gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground">
            <span className="text-yellow-500">☀</span> {lightHex}
          </span>
          <span className="text-[10px] text-muted-foreground">
            <span className="text-blue-400">☾</span> {darkHex}
          </span>
        </div>
        <p className="text-muted-foreground/70 text-[10px] mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// ── Token row ────────────────────────────────────
function TokenRow({
  token,
  value,
  description,
}: {
  token: string;
  value: string;
  description: string;
}) {
  const { copied, copy } = useCopy();
  const id = `token-${token}`;
  return (
    <tr className="border-b border-border/40 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-2.5">
        <code className="text-primary text-[12px] font-mono bg-primary/5 px-2 py-0.5 rounded">
          {token}
        </code>
      </td>
      <td className="px-4 py-2.5">
        <span className="text-foreground text-[12px] font-mono">{value}</span>
      </td>
      <td className="px-4 py-2.5">
        <span className="text-muted-foreground text-[12px]">{description}</span>
      </td>
      <td className="px-4 py-2.5">
        <button
          onClick={() => copy(token, id)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
        >
          {copied === id ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </td>
    </tr>
  );
}

// ── Button showcase ─────────────────────────────
function ButtonShowcase() {
  return (
    <Section
      title="Buttons"
      subtitle="Action elements with consistent visual hierarchy"
    >
      <div className="space-y-6">
        {/* Primary variants */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Variants
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md active:scale-95">
              Primary
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/80 transition-all border border-border active:scale-95">
              Secondary
            </button>
            <button className="px-5 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-muted transition-all active:scale-95 bg-transparent">
              Outline
            </button>
            <button className="px-5 py-2.5 rounded-xl text-foreground text-sm font-semibold hover:bg-muted transition-all active:scale-95 bg-transparent">
              Ghost
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold hover:bg-destructive/90 transition-all active:scale-95">
              Destructive
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-blue-500/25 active:scale-95">
              Gradient
            </button>
          </div>
        </div>
        {/* Sizes */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Sizes
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
              XS
            </button>
            <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
              SM
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
              MD (Default)
            </button>
            <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-base font-semibold">
              LG
            </button>
          </div>
        </div>
        {/* Icon buttons */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Icon Buttons
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              Create Alert
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-muted transition-all active:scale-95">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-muted transition-all active:scale-95 border border-border">
              <Settings className="w-4 h-4 text-foreground" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all active:scale-95">
              <Search className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
        {/* States */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            States
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold opacity-50 cursor-not-allowed">
              Disabled
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold cursor-wait">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Loading…
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ── Badge showcase ───────────────────────────────
function BadgeShowcase() {
  return (
    <Section title="Badges & Status Chips" subtitle="Lightweight status indicators">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Severity / Status
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Critical", bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/30" },
              { label: "Warning", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30" },
              { label: "Info", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/30" },
              { label: "Success", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30" },
              { label: "Inactive", bg: "bg-muted", text: "text-muted-foreground", border: "border-border" },
            ].map((b) => (
              <span
                key={b.label}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${b.bg} ${b.text} ${b.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${b.label === "Critical" ? "bg-red-500 animate-pulse" : b.label === "Warning" ? "bg-amber-500" : b.label === "Info" ? "bg-blue-500" : b.label === "Success" ? "bg-emerald-500" : "bg-muted-foreground/50"}`} />
                {b.label}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Provider Tags
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              IMD
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Tomorrow.io
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Notification Dot
          </p>
          <div className="flex items-center gap-4">
            <div className="relative inline-flex">
              <Bell className="w-6 h-6 text-foreground" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                3
              </span>
            </div>
            <div className="relative inline-flex">
              <Settings className="w-6 h-6 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ── Card showcase ────────────────────────────────
function CardShowcase() {
  return (
    <Section title="Cards & Containers" subtitle="Surface patterns for grouping content">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Default card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-foreground text-sm font-semibold">Default Card</span>
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
              bg-card
            </span>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Standard card surface with border and subtle shadow. Used for primary content grouping.
          </p>
          <div className="mt-4 pt-3 border-t border-border flex justify-end">
            <button className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
              View more <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Glass card */}
        <div
          className="rounded-xl p-5 border border-white/10 shadow-lg"
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-foreground text-sm font-semibold">Glass Card</span>
            <span className="text-xs text-blue-400 px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">
              glassmorphism
            </span>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Frosted-glass effect. Used in overlays, modals, and premium sections. Requires a colored background.
          </p>
          <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
            <button className="text-blue-400 text-xs font-semibold hover:underline flex items-center gap-1">
              Explore <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric KPI card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
          <div className="relative">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Forecast Accuracy
            </p>
            <p className="text-foreground text-3xl font-bold mt-1">94.2%</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">↑ 2.1%</span>
              <span className="text-muted-foreground text-xs">vs last week</span>
            </div>
            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-[94%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ── Input showcase ───────────────────────────────
function InputShowcase() {
  return (
    <Section title="Form Elements" subtitle="Input, select, and control primitives">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Text input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Default Input
          </label>
          <input
            type="text"
            defaultValue=""
            placeholder="Enter alert name…"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        {/* Input with icon */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            With Icon
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search locations…"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>
        {/* Error state */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Error State
          </label>
          <input
            type="text"
            defaultValue="bad-input"
            className="w-full px-4 py-2.5 rounded-lg border border-red-400 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition-all"
          />
          <p className="flex items-center gap-1.5 text-xs text-red-500">
            <XCircle className="w-3.5 h-3.5" /> This field is required
          </p>
        </div>
        {/* Select */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Select Dropdown
          </label>
          <div className="relative">
            <select className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
              <option>Temperature (°C)</option>
              <option>Wind Speed (km/h)</option>
              <option>Rainfall (mm)</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
          </div>
        </div>
      </div>
    </Section>
  );
}

// ── Alert/feedback showcase ──────────────────────
function FeedbackShowcase() {
  return (
    <Section title="Alerts & Feedback" subtitle="Inline status messages and notifications">
      <div className="space-y-3">
        {[
          {
            icon: Info,
            title: "Informational",
            msg: "IMD data sync completed. 847 records updated.",
            bg: "bg-blue-500/8 dark:bg-blue-500/10",
            border: "border-blue-500/25",
            icon_color: "text-blue-600 dark:text-blue-400",
          },
          {
            icon: CheckCircle2,
            title: "Success",
            msg: "Alert 'High Temperature — Mumbai' was created successfully.",
            bg: "bg-emerald-500/8 dark:bg-emerald-500/10",
            border: "border-emerald-500/25",
            icon_color: "text-emerald-600 dark:text-emerald-400",
          },
          {
            icon: AlertTriangle,
            title: "Warning",
            msg: "Tomorrow.io API rate limit at 85%. Throttling may occur.",
            bg: "bg-amber-500/8 dark:bg-amber-500/10",
            border: "border-amber-500/25",
            icon_color: "text-amber-600 dark:text-amber-400",
          },
          {
            icon: XCircle,
            title: "Error",
            msg: "Failed to fetch forecast data. Check API credentials.",
            bg: "bg-red-500/8 dark:bg-red-500/10",
            border: "border-red-500/25",
            icon_color: "text-red-600 dark:text-red-400",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`flex items-start gap-3 p-4 rounded-xl border ${item.bg} ${item.border}`}
            >
              <Icon className={`w-4.5 h-4.5 mt-0.5 flex-shrink-0 ${item.icon_color}`} />
              <div>
                <p className={`text-sm font-semibold ${item.icon_color}`}>{item.title}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{item.msg}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ══ FOUNDATION TAB ══════════════════════════════
function FoundationTab() {
  const colors = [
    { name: "Primary", cssVar: "--color-primary", lightHex: "#2563EB", darkHex: "#3B82F6", description: "Brand blue — actions, links, focus rings" },
    { name: "Background", cssVar: "--color-background", lightHex: "#F8FAFC", darkHex: "#0B1221", description: "Page and app shell background" },
    { name: "Card", cssVar: "--color-card", lightHex: "#FFFFFF", darkHex: "#151e32", description: "Surface for cards and containers" },
    { name: "Foreground", cssVar: "--color-foreground", lightHex: "#334155", darkHex: "#E2E8F0", description: "Primary text color" },
    { name: "Muted", cssVar: "--color-muted", lightHex: "#F1F5F9", darkHex: "#1E293B", description: "Subdued backgrounds and placeholders" },
    { name: "Muted FG", cssVar: "--color-muted-foreground", lightHex: "#64748B", darkHex: "#94A3B8", description: "Secondary / helper text" },
    { name: "Border", cssVar: "--color-border", lightHex: "#E2E8F0", darkHex: "#1E293B", description: "Dividers and card borders" },
    { name: "Destructive", cssVar: "--color-destructive", lightHex: "#EF4444", darkHex: "#EF4444", description: "Error, delete, critical actions" },
  ];

  const chartColors = [
    { name: "Chart 1 — Blue", cssVar: "--color-chart-1", lightHex: "#2563EB", darkHex: "#60A5FA", description: "Primary data series / IMD" },
    { name: "Chart 2 — Amber", cssVar: "--color-chart-2", lightHex: "#F59E0B", darkHex: "#FBBF24", description: "Secondary data / warnings" },
    { name: "Chart 3 — Green", cssVar: "--color-chart-3", lightHex: "#10B981", darkHex: "#34D399", description: "Success / positive trends" },
    { name: "Chart 4 — Purple", cssVar: "--color-chart-4", lightHex: "#8B5CF6", darkHex: "#A78BFA", description: "Tertiary / Tomorrow.io" },
    { name: "Chart 5 — Red", cssVar: "--color-chart-5", lightHex: "#EF4444", darkHex: "#F87171", description: "Critical / alerts" },
  ];

  const typographyScale = [
    { name: "Display", size: "2.25rem / 36px", weight: "700", sample: "WeatherXpert" },
    { name: "Headline", size: "1.5rem / 24px", weight: "700", sample: "Command Center" },
    { name: "Title", size: "1.125rem / 18px", weight: "600", sample: "Forecast Analytics" },
    { name: "Body (Base)", size: "0.875rem / 14px", weight: "400", sample: "IMD data refreshed at 14:30 IST" },
    { name: "Label", size: "0.75rem / 12px", weight: "600", sample: "WEATHER PARAMETER" },
    { name: "Caption", size: "0.6875rem / 11px", weight: "400", sample: "Updated 5 min ago" },
  ];

  return (
    <div>
      {/* Colors */}
      <Section title="Color System" subtitle="Semantic tokens mapped to light and dark mode CSS variables">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
          {colors.map((c) => (
            <ColorSwatch key={c.cssVar} {...c} />
          ))}
        </div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Chart Color Palette
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {chartColors.map((c) => (
            <ColorSwatch key={c.cssVar} {...c} />
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography" subtitle="Inter font family — enterprise-optimised scale">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="border-b border-border/60">
                <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Style</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Size / Weight</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sample</th>
              </tr>
            </thead>
            <tbody>
              {typographyScale.map((t, i) => (
                <tr key={t.name} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-foreground text-sm font-medium">{t.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-muted-foreground text-xs font-mono">{t.size} / {t.weight}</code>
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: t.size.split(" / ")[0], fontWeight: t.weight }}>
                    <span className="text-foreground">{t.sample}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Spacing */}
      <Section title="Spacing Scale" subtitle="4px base unit — Tailwind spacing tokens">
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div
                className="bg-primary/20 border border-primary/40 rounded"
                style={{ width: s * 4, height: s * 4, minWidth: 4 }}
              />
              <span className="text-muted-foreground text-[10px] font-mono">
                {s} ({s * 4}px)
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Border Radius */}
      <Section title="Border Radius" subtitle="Consistent rounding for cards, buttons, inputs">
        <div className="flex flex-wrap gap-6 items-end">
          {[
            { name: "sm", value: "4px" },
            { name: "md (default)", value: "8px" },
            { name: "lg", value: "10px" },
            { name: "xl", value: "14px" },
            { name: "2xl", value: "16px" },
            { name: "full", value: "9999px" },
          ].map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 bg-primary/15 border-2 border-primary/40"
                style={{ borderRadius: r.value }}
              />
              <div className="text-center">
                <p className="text-foreground text-xs font-semibold">{r.name}</p>
                <p className="text-muted-foreground text-[10px]">{r.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ══ COMPONENTS TAB ══════════════════════════════
function ComponentsTab() {
  return (
    <div>
      <ButtonShowcase />
      <BadgeShowcase />
      <CardShowcase />
      <InputShowcase />
      <FeedbackShowcase />
    </div>
  );
}

// ══ PATTERNS TAB ════════════════════════════════
function PatternsTab() {
  const glassCode = `/* Glassmorphism — Light Mode */
.glass-card {
  background: rgba(255, 255, 255, 0.70);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.40);
}

/* Glassmorphism — Dark Mode */
.dark .glass-card {
  background: rgba(15, 23, 42, 0.60);
  border: 1px solid rgba(255, 255, 255, 0.08);
}`;

  const iconGroups = [
    { label: "Weather", icons: [Activity, BarChart3, Zap, Sparkles] },
    { label: "Actions", icons: [Plus, Download, Eye, Copy] },
    { label: "Status", icons: [CheckCircle2, AlertTriangle, XCircle, Info] },
    { label: "Navigation", icons: [Settings, Shield, Search, ChevronRight] },
  ];

  return (
    <div>
      {/* Glassmorphism */}
      <Section title="Glassmorphism" subtitle="iOS-inspired frosted glass surfaces — signature WeatherXpert aesthetic">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Backdrop demo */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #0f172a 100%)", minHeight: 180 }}
          >
            <div
              className="absolute inset-4 rounded-xl p-5 border border-white/20 shadow-xl"
              style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
            >
              <p className="text-white text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Glass Card</p>
              <p className="text-white text-2xl font-bold">42°C</p>
              <p className="text-white/70 text-xs">Mumbai — High Temp Alert</p>
            </div>
          </div>
          {/* Light glass */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-sky-100 to-blue-200 dark:from-slate-800 dark:to-slate-900" style={{ minHeight: 180 }}>
            <div
              className="absolute inset-4 rounded-xl p-5 shadow-xl"
              style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.5)" }}
            >
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1">IMD Provider</p>
              <p className="text-slate-900 text-2xl font-bold">94.2%</p>
              <p className="text-slate-500 text-xs">Accuracy Score</p>
            </div>
          </div>
          {/* Elevated */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xl" style={{ minHeight: 180 }}>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Elevated Card</p>
            <p className="text-foreground text-2xl font-bold">Tomorrow.io</p>
            <p className="text-muted-foreground text-xs">Active Provider</p>
            <div className="mt-auto pt-6">
              <div className="flex gap-1">
                {[80, 60, 90, 75, 95, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/20 rounded-sm" style={{ height: h * 0.5 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Code snippet */}
        <div className="rounded-xl bg-slate-900 dark:bg-slate-950 border border-border/60 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/5">
            <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground text-xs font-medium">CSS Pattern</span>
          </div>
          <pre className="p-4 text-xs text-slate-300 overflow-x-auto font-mono leading-relaxed">
            {glassCode}
          </pre>
        </div>
      </Section>

      {/* Elevation / Shadows */}
      <Section title="Elevation & Shadows" subtitle="Depth through shadows — 4 levels">
        <div className="flex flex-wrap gap-6">
          {[
            { name: "Level 0", class: "shadow-none border border-border", desc: "Flat, no elevation" },
            { name: "Level 1", class: "shadow-sm", desc: "Cards, inline elements" },
            { name: "Level 2", class: "shadow-md", desc: "Dropdowns, popovers" },
            { name: "Level 3", class: "shadow-xl", desc: "Modals, drawers" },
          ].map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-3">
              <div className={`w-24 h-24 bg-card rounded-xl ${s.class}`} />
              <div className="text-center">
                <p className="text-foreground text-xs font-semibold">{s.name}</p>
                <p className="text-muted-foreground text-[10px]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Icons */}
      <Section title="Icon System" subtitle="Lucide React — consistent 18px stroke icons throughout the platform">
        <div className="space-y-5">
          {iconGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-3">
                {group.icons.map((Icon, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-border"
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border/60">
          <p className="text-muted-foreground text-xs leading-relaxed">
            <strong className="text-foreground">Rule:</strong> Always use{" "}
            <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[11px]">w-[18px] h-[18px]</code>{" "}
            for standard icons in navigation and actions,{" "}
            <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[11px]">w-5 h-5</code> in form labels,
            and <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[11px]">w-6 h-6</code> for hero/display icons.
          </p>
        </div>
      </Section>

      {/* Motion guidelines */}
      <Section title="Motion & Animation" subtitle="Motion — spring-based transitions for a premium feel">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: "Enter (Page)", config: "opacity 0→1, y 20→0\nspring: stiffness 200, damping 25", color: "bg-blue-500/10 border-blue-500/20 text-blue-600" },
            { name: "Hover (Button)", config: "scale 1→1.02\nduration: 200ms ease", color: "bg-purple-500/10 border-purple-500/20 text-purple-600" },
            { name: "Modal Open", config: "opacity 0→1, scale 0.95→1\nspring: stiffness 300, damping 30", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" },
          ].map((m) => (
            <div key={m.name} className={`p-4 rounded-xl border ${m.color}`}>
              <p className={`text-sm font-semibold mb-2 ${m.color.split(" ")[2]}`}>{m.name}</p>
              <pre className="text-[11px] text-muted-foreground font-mono whitespace-pre-wrap">{m.config}</pre>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ══ TOKENS TAB ══════════════════════════════════
function TokensTab() {
  const tokens = [
    { token: "--color-background", value: "#F8FAFC / #0B1221", description: "App background" },
    { token: "--color-foreground", value: "#334155 / #E2E8F0", description: "Primary text" },
    { token: "--color-card", value: "#FFFFFF / #151e32", description: "Card surface" },
    { token: "--color-card-foreground", value: "#334155 / #E2E8F0", description: "Card text" },
    { token: "--color-primary", value: "#2563EB / #3B82F6", description: "Brand action color" },
    { token: "--color-primary-foreground", value: "#FFFFFF", description: "Text on primary bg" },
    { token: "--color-secondary", value: "#F1F5F9 / #1E293B", description: "Secondary surface" },
    { token: "--color-muted", value: "#F1F5F9 / #1E293B", description: "Muted background" },
    { token: "--color-muted-foreground", value: "#64748B / #94A3B8", description: "Secondary text" },
    { token: "--color-destructive", value: "#EF4444", description: "Error / danger" },
    { token: "--color-border", value: "#E2E8F0 / #1E293B", description: "Dividers & strokes" },
    { token: "--color-ring", value: "#2563EB / #3B82F6", description: "Focus ring" },
    { token: "--color-chart-1", value: "#2563EB / #60A5FA", description: "Chart series 1" },
    { token: "--color-chart-2", value: "#F59E0B / #FBBF24", description: "Chart series 2" },
    { token: "--color-chart-3", value: "#10B981 / #34D399", description: "Chart series 3" },
    { token: "--color-chart-4", value: "#8B5CF6 / #A78BFA", description: "Chart series 4" },
    { token: "--color-chart-5", value: "#EF4444 / #F87171", description: "Chart series 5" },
    { token: "--radius", value: "0.5rem", description: "Base border radius" },
    { token: "--topbar-height", value: "64px", description: "Global top bar height" },
    { token: "--color-sidebar", value: "#F9FAFB / #0B1221", description: "Sidebar background" },
  ];

  return (
    <div>
      <Section title="Design Tokens Reference" subtitle="All CSS custom properties — copy the token name to use in your styles">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[600px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Token</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value (Light / Dark)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">Copy</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <TokenRow key={t.token} {...t} />
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Tailwind class cheatsheet */}
      <Section title="Tailwind Class Reference" subtitle="Semantic Tailwind classes powered by the design token system">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              category: "Backgrounds",
              items: ["bg-background", "bg-card", "bg-muted", "bg-primary", "bg-secondary", "bg-destructive"],
            },
            {
              category: "Text",
              items: ["text-foreground", "text-card-foreground", "text-muted-foreground", "text-primary", "text-destructive"],
            },
            {
              category: "Borders",
              items: ["border-border", "border-primary", "border-destructive", "ring-ring", "border-muted"],
            },
            {
              category: "Charts",
              items: ["text-chart-1", "text-chart-2", "text-chart-3", "text-chart-4", "text-chart-5"],
            },
          ].map((group) => (
            <div key={group.category} className="bg-card border border-border rounded-xl p-4">
              <p className="text-foreground text-sm font-semibold mb-3">{group.category}</p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((cls) => (
                  <code
                    key={cls}
                    className="text-[11px] font-mono px-2 py-1 bg-muted rounded text-muted-foreground border border-border"
                  >
                    {cls}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ══ MAIN PAGE ════════════════════════════════════
export function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<DSTab>("foundation");
  const { theme } = useTheme();

  const tabs: { id: DSTab; label: string; icon: React.ElementType }[] = [
    { id: "foundation", label: "Foundation", icon: Palette },
    { id: "components", label: "Components", icon: Box },
    { id: "patterns", label: "Patterns", icon: Layers },
    { id: "tokens", label: "Tokens", icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-foreground text-lg font-bold tracking-tight leading-tight">
                  Design System
                </h1>
                <p className="text-muted-foreground text-xs">
                  WeatherXpert — Style Guidelines & Component Library
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                v3.0 Current
              </span>
              <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-full">
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "foundation" && <FoundationTab />}
            {activeTab === "components" && <ComponentsTab />}
            {activeTab === "patterns" && <PatternsTab />}
            {activeTab === "tokens" && <TokensTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
