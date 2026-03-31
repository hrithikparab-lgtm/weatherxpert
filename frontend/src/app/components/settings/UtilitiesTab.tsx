import { useState } from "react";
import { Zap, Edit2, Plus, CheckCircle2, X, MapPin, Radio, Activity } from "lucide-react";
import { UTILITY_CONFIGS, type UtilityConfig } from "./settingsData";

const TYPE_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  Distribution: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Generation:   { color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  Renewable:    { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

interface UtilitiesTabProps { isMobile: boolean; }

export function UtilitiesTab({ isMobile }: UtilitiesTabProps) {
  const [utilities] = useState(UTILITY_CONFIGS);
  const [editModal, setEditModal] = useState<UtilityConfig | null>(null);

  return (
    <div className="space-y-4">
      {!isMobile && (
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:shadow-primary/20 active:scale-95">
            <Plus className="w-3.5 h-3.5" /> Add Utility
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                <th className="text-left px-5 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Utility</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Code</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Region</th>
                <th className="text-center px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Stations</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider hidden lg:table-cell">Contact</th>
                <th className="text-center px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Status</th>
                {!isMobile && <th className="w-12 px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {utilities.map(u => {
                const tc = TYPE_COLORS[u.type] || { color: "text-foreground", bg: "bg-secondary", border: "border-border" };
                return (
                  <tr key={u.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 flex items-center justify-center shadow-inner">
                          <Zap className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-[12px] text-foreground font-semibold tracking-tight">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className="text-[11px] text-muted-foreground font-mono font-medium">{u.code}</span></td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tc.bg} ${tc.color} ${tc.border}`}>
                        {u.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                        <MapPin className="w-3 h-3 opacity-50" />
                        {u.region}
                      </div>
                    </td>
                    <td className="text-center px-4 py-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/5 dark:bg-white/5">
                        <Radio className="w-3 h-3 text-muted-foreground/60" />
                        <span className="text-[11px] text-foreground font-bold tabular-nums">{u.stations}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-[10px] text-muted-foreground/70 font-mono truncate max-w-[160px] block">{u.contactEmail}</span>
                    </td>
                    <td className="text-center px-4 py-3.5">
                      {u.active ? (
                        <div className="inline-flex justify-center"><div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /></div></div>
                      ) : (
                        <div className="inline-flex justify-center"><div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center"><X className="w-3.5 h-3.5 text-red-500/50" /></div></div>
                      )}
                    </td>
                    {!isMobile && (
                      <td className="px-4 py-3.5 text-right">
                        <button onClick={() => setEditModal(u)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-all">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5">
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Edit Utility</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Update details for <span className="font-medium text-foreground">{editModal.name}</span>
                </p>
              </div>
              <button onClick={() => setEditModal(null)} className="p-1.5 rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground hover:text-foreground hover:bg-black/10 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              {[["Name", editModal.name], ["Code", editModal.code], ["Region", editModal.region], ["Contact", editModal.contactEmail]].map(([k, v]) => (
                <div key={k} className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">{k}</label>
                  <input defaultValue={v} className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 bg-transparent border border-black/10 dark:border-white/10 rounded-xl text-xs text-muted-foreground font-semibold hover:text-foreground hover:bg-black/5 transition-colors">Cancel</button>
              <button onClick={() => setEditModal(null)} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
