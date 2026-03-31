import { useState } from "react";
import {
  Trophy,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  ArrowUpDown,
  Medal,
} from "lucide-react";
import {
  PROVIDERS,
  type ProviderRank,
  type MetricId,
} from "./accuracyData";

/* ═══════════════════════════════════════════════════
   PROVIDER RANKING TABLE
   Sortable · Drill-in to region/block · Export
   ═══════════════════════════════════════════════════ */

interface ProviderRankingTableProps {
  rankings: ProviderRank[];
  activeMetric: MetricId;
}

const RANK_BADGES = [
  { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/20", icon: "🥇" },
  { bg: "bg-slate-400/10", text: "text-slate-500 dark:text-slate-400", ring: "ring-slate-400/20", icon: "🥈" },
  { bg: "bg-orange-600/10", text: "text-orange-600 dark:text-orange-400", ring: "ring-orange-600/20", icon: "🥉" },
  { bg: "bg-secondary", text: "text-muted-foreground", ring: "ring-border", icon: "#4" },
];

export function ProviderRankingTable({ rankings, activeMetric }: ProviderRankingTableProps) {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  const toggleExpand = (id: string) =>
    setExpandedProvider((prev) => (prev === id ? null : id));

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-secondary/10">
        <div className="flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-chart-2" />
          <h4 className="text-[12px] text-foreground font-medium">Provider Ranking</h4>
          <span className="text-[9px] text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-secondary">
            Sorted by composite score
          </span>
        </div>
        <button className="flex items-center gap-1 px-2 py-1 bg-secondary/50 border border-border rounded-lg text-[10px] text-muted-foreground hover:text-foreground transition-colors font-medium">
          <Download className="w-3 h-3" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px]">
          <thead>
            <tr className="bg-secondary/20 border-b border-border/40">
              <th className="w-12 px-3 py-2.5 text-center text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">#</th>
              <th className="text-left px-3 py-2.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Provider</th>
              <th className="text-right px-3 py-2.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">MAE</th>
              <th className="text-right px-3 py-2.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">RMSE</th>
              <th className="text-right px-3 py-2.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">MBE</th>
              <th className="text-right px-3 py-2.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Bias</th>
              <th className="text-right px-3 py-2.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Corr.</th>
              <th className="text-right px-3 py-2.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Score</th>
              <th className="text-center px-3 py-2.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Trend</th>
              <th className="w-10 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rankings.map((rank) => {
              const prov = PROVIDERS.find((p) => p.id === rank.providerId)!;
              const badge = RANK_BADGES[rank.rank - 1] ?? RANK_BADGES[3];
              const isExpanded = expandedProvider === rank.providerId;

              return (
                <ProviderRow
                  key={rank.providerId}
                  rank={rank}
                  prov={prov}
                  badge={badge}
                  isExpanded={isExpanded}
                  onToggle={() => toggleExpand(rank.providerId)}
                  activeMetric={activeMetric}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Row + Drill-in ── */
function ProviderRow({
  rank,
  prov,
  badge,
  isExpanded,
  onToggle,
  activeMetric,
}: {
  rank: ProviderRank;
  prov: (typeof PROVIDERS)[number];
  badge: (typeof RANK_BADGES)[number];
  isExpanded: boolean;
  onToggle: () => void;
  activeMetric: MetricId;
}) {
  // Highlight active metric column
  const highlightClass = (metric: MetricId) =>
    activeMetric === metric ? "text-primary font-semibold" : "text-foreground";

  return (
    <>
      <tr className={`border-b border-border/15 transition-colors ${isExpanded ? "bg-primary/3" : "hover:bg-secondary/20"}`}>
        {/* Rank */}
        <td className="px-3 py-3 text-center">
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-semibold ring-1 ${badge.bg} ${badge.text} ${badge.ring}`}>
            {rank.rank}
          </span>
        </td>
        {/* Provider */}
        <td className="px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: prov.color }} />
            <div>
              <p className="text-[12px] text-foreground font-medium">{prov.name}</p>
              <p className="text-[9px] text-muted-foreground/50">{prov.id.replace(/_/g, "-").toUpperCase()}</p>
            </div>
          </div>
        </td>
        {/* Metrics */}
        <td className={`text-right px-3 py-3 text-[11px] tabular-nums font-mono ${highlightClass("mae")}`}>{rank.mae.toFixed(2)}</td>
        <td className={`text-right px-3 py-3 text-[11px] tabular-nums font-mono ${highlightClass("rmse")}`}>{rank.rmse.toFixed(2)}</td>
        <td className={`text-right px-3 py-3 text-[11px] tabular-nums font-mono ${highlightClass("mbe")}`}>{rank.mbe >= 0 ? "+" : ""}{rank.mbe.toFixed(2)}</td>
        <td className={`text-right px-3 py-3 text-[11px] tabular-nums font-mono ${highlightClass("bias")}`}>{rank.bias.toFixed(1)}%</td>
        <td className={`text-right px-3 py-3 text-[11px] tabular-nums font-mono ${highlightClass("correlation")}`}>{rank.correlation.toFixed(3)}</td>
        {/* Score */}
        <td className="text-right px-3 py-3">
          <span className={`text-[13px] tabular-nums font-mono font-medium ${
            rank.score >= 90 ? "text-chart-3" : rank.score >= 85 ? "text-foreground" : "text-chart-2"
          }`}>
            {rank.score.toFixed(1)}
          </span>
        </td>
        {/* Trend */}
        <td className="text-center px-3 py-3">
          {rank.trend === "up" ? (
            <TrendingUp className="w-3.5 h-3.5 text-chart-3 mx-auto" />
          ) : rank.trend === "down" ? (
            <TrendingDown className="w-3.5 h-3.5 text-destructive mx-auto" />
          ) : (
            <Minus className="w-3.5 h-3.5 text-muted-foreground mx-auto" />
          )}
        </td>
        {/* Expand */}
        <td className="px-3 py-3 text-center">
          <button
            onClick={onToggle}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </td>
      </tr>

      {/* Drill-in: Region/Block rows */}
      {isExpanded && (
        <>
          <tr className="bg-secondary/5">
            <td colSpan={10} className="px-0 py-0">
              <div className="pl-12 pr-4 py-2 animate-in slide-in-from-top-1 duration-150">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 px-3">
                  Region Breakdown
                </p>
                <div className="bg-card rounded-lg border border-border/40 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/20">
                        <th className="text-left px-3 py-1.5 text-[8px] text-muted-foreground font-semibold uppercase tracking-wider">Region</th>
                        <th className="text-right px-3 py-1.5 text-[8px] text-muted-foreground font-semibold uppercase tracking-wider">MAE</th>
                        <th className="text-right px-3 py-1.5 text-[8px] text-muted-foreground font-semibold uppercase tracking-wider">RMSE</th>
                        <th className="text-right px-3 py-1.5 text-[8px] text-muted-foreground font-semibold uppercase tracking-wider">Score</th>
                        <th className="text-right px-3 py-1.5 text-[8px] text-muted-foreground font-semibold uppercase tracking-wider w-28">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rank.regions.map((region) => (
                        <tr key={region.region} className="border-t border-border/10 hover:bg-secondary/10 transition-colors">
                          <td className="px-3 py-1.5 text-[10px] text-foreground font-medium">{region.region}</td>
                          <td className="text-right px-3 py-1.5 text-[10px] text-foreground tabular-nums font-mono">{region.mae.toFixed(2)}</td>
                          <td className="text-right px-3 py-1.5 text-[10px] text-foreground tabular-nums font-mono">{region.rmse.toFixed(2)}</td>
                          <td className="text-right px-3 py-1.5">
                            <span className={`text-[10px] tabular-nums font-mono font-medium ${
                              region.score >= 92 ? "text-chart-3" : region.score >= 87 ? "text-foreground" : "text-chart-2"
                            }`}>
                              {region.score.toFixed(1)}
                            </span>
                          </td>
                          <td className="text-right px-3 py-1.5">
                            <div className="flex items-center gap-1.5 justify-end">
                              <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    region.score >= 92 ? "bg-chart-3" : region.score >= 87 ? "bg-primary" : "bg-chart-2"
                                  }`}
                                  style={{ width: `${region.score}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        </>
      )}
    </>
  );
}
