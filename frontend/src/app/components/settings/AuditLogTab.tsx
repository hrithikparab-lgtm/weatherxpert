import { useState } from "react";
import {
  ScrollText, Search, Filter, LogIn, Plus, Edit2, Trash2,
  Download, Settings, ChevronDown, Calendar, User
} from "lucide-react";
import { AUDIT_LOG, type AuditLogEntry, type AuditAction } from "./settingsData";

const ACTION_CONF: Record<AuditAction, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  create:        { label: "Create",  color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Plus },
  update:        { label: "Update",  color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-500/10",    border: "border-blue-500/20",    icon: Edit2 },
  delete:        { label: "Delete",  color: "text-red-600 dark:text-red-400",         bg: "bg-red-500/10",     border: "border-red-500/20",     icon: Trash2 },
  login:         { label: "Login",   color: "text-purple-600 dark:text-purple-400",    bg: "bg-purple-500/10",  border: "border-purple-500/20",  icon: LogIn },
  export:        { label: "Export",  color: "text-amber-600 dark:text-amber-400",      bg: "bg-amber-500/10",   border: "border-amber-500/20",   icon: Download },
  config_change: { label: "Config",  color: "text-indigo-600 dark:text-indigo-400",    bg: "bg-indigo-500/10",  border: "border-indigo-500/20",  icon: Settings },
};

export function AuditLogTab() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
  const [showAll, setShowAll] = useState(false);

  const filtered = AUDIT_LOG.filter(e => {
    if (actionFilter !== "all" && e.action !== actionFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return e.user.toLowerCase().includes(s) || e.resource.toLowerCase().includes(s) || e.details.toLowerCase().includes(s);
    }
    return true;
  });

  const displayed = showAll ? filtered : filtered.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm group">
          <Search className="w-3.5 h-3.5 text-muted-foreground/50 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search audit log..."
            className="w-full pl-9 pr-4 py-2 bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-muted-foreground/50 transition-all shadow-sm" 
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setActionFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
              actionFilter === "all" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "bg-white/50 dark:bg-black/20 text-muted-foreground hover:text-foreground hover:bg-white/80 dark:hover:bg-black/30 border border-transparent hover:border-black/5"
            }`}>
            All
          </button>
          {(Object.keys(ACTION_CONF) as AuditAction[]).map(a => {
            const ac = ACTION_CONF[a];
            return (
              <button key={a} onClick={() => setActionFilter(a)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
                  actionFilter === a 
                    ? `${ac.bg} ${ac.color} ${ac.border} shadow-sm` 
                    : "bg-white/50 dark:bg-black/20 text-muted-foreground border-transparent hover:text-foreground hover:bg-white/80 dark:hover:bg-black/30 hover:border-black/5"
                }`}>
                {ac.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Log table */}
      <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                <th className="text-left px-5 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Action</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Resource</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider hidden lg:table-cell">Details</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider hidden lg:table-cell">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {displayed.map(entry => {
                const ac = ACTION_CONF[entry.action];
                const AcIcon = ac.icon;
                return (
                  <tr key={entry.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 font-mono">
                        <Calendar className="w-3 h-3 opacity-50" />
                        {entry.timestamp}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[9px] font-bold">
                           {entry.user.substring(0, 1)}
                        </div>
                        <span className="text-[11px] text-foreground font-medium">{entry.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${ac.bg} ${ac.color} ${ac.border}`}>
                        <AcIcon className="w-3 h-3" /> {ac.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-foreground font-medium truncate max-w-[180px] block">{entry.resource}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-[10px] text-muted-foreground/70 truncate max-w-[300px] block">{entry.details}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-[10px] text-muted-foreground/50 font-mono bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">{entry.ip}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 10 && (
          <button onClick={() => setShowAll(!showAll)}
            className="w-full px-4 py-3 text-center text-[10px] text-primary font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-1 border-t border-black/5 dark:border-white/5 uppercase tracking-wider">
            {showAll ? "Show less" : `View all ${filtered.length} entries`}
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showAll ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
    </div>
  );
}
