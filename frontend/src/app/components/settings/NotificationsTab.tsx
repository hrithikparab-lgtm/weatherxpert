import { useState } from "react";
import {
  Mail, MessageSquare, Webhook, Slack, Bell, Edit2,
  CheckCircle2, X, Send, Plus, Power
} from "lucide-react";
import { NOTIFICATION_CHANNELS, type NotificationChannel, type ChannelType } from "./settingsData";

const TYPE_ICONS: Record<ChannelType, React.ElementType> = {
  email: Mail, sms: MessageSquare, webhook: Webhook, slack: Slack, teams: Bell,
};

const TYPE_COLORS: Record<ChannelType, { color: string; bg: string; border: string }> = {
  email:   { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  sms:     { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  webhook: { color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  slack:   { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  teams:   { color: "text-indigo-600 dark:text-indigo-400",  bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
};

interface NotificationsTabProps { isMobile: boolean; }

export function NotificationsTab({ isMobile }: NotificationsTabProps) {
  const [channels, setChannels] = useState(NOTIFICATION_CHANNELS);
  const [editModal, setEditModal] = useState<NotificationChannel | null>(null);

  const toggleChannel = (id: string) => {
    if (isMobile) return;
    setChannels(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const [testSending, setTestSending] = useState<string | null>(null);
  const sendTest = (id: string) => {
    setTestSending(id);
    setTimeout(() => setTestSending(null), 2000);
  };

  return (
    <div className="space-y-4">
      {!isMobile && (
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:shadow-primary/20 active:scale-95">
            <Plus className="w-3.5 h-3.5" /> Add Channel
          </button>
        </div>
      )}

      <div className="space-y-4">
        {channels.map(ch => {
          const TypeIcon = TYPE_ICONS[ch.type];
          const typeCol = TYPE_COLORS[ch.type];
          return (
            <div key={ch.id} className={`group rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden transition-all duration-300 backdrop-blur-md ${ch.enabled ? "bg-white/60 dark:bg-black/20" : "bg-white/40 dark:bg-black/10 opacity-80 hover:opacity-100"}`}>
              <div className="flex items-center gap-4 px-5 py-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeCol.bg} ${typeCol.border} border shadow-sm`}>
                  <TypeIcon className={`w-5 h-5 ${typeCol.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <p className="text-[13px] text-foreground font-bold truncate tracking-tight">{ch.name}</p>
                    <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full border border-black/5 dark:border-white/5">{ch.type}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground/60 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                      Delivery: <strong className="text-foreground/80">{ch.deliveryRate}%</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                      Last used: {ch.lastUsed}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleChannel(ch.id)}
                    disabled={isMobile}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 ${
                      ch.enabled ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "bg-zinc-200 dark:bg-zinc-700"
                    } ${isMobile ? "opacity-60 cursor-default" : "cursor-pointer"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                      ch.enabled ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                  
                  {!isMobile && (
                    <div className="flex items-center gap-1 pl-3 border-l border-black/5 dark:border-white/10">
                      <button onClick={() => sendTest(ch.id)} disabled={!ch.enabled || testSending === ch.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-[10px] text-foreground font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        {testSending === ch.id ? <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Send className="w-3 h-3 text-muted-foreground" />}
                        Test
                      </button>
                      <button onClick={() => setEditModal(ch)} className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {/* Config row */}
              <div className="px-5 py-3 bg-black/[0.03] dark:bg-white/[0.03] border-t border-black/5 dark:border-white/10 flex flex-wrap gap-4">
                {Object.entries(ch.config).slice(0, 3).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-[10px]">
                    <span className="text-muted-foreground/50 font-bold uppercase tracking-wider">{k}:</span>
                    <span className="text-foreground/70 font-mono bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded border border-black/5 dark:border-white/5">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5">
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Edit Channel</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Configure <span className="font-medium text-foreground">{editModal.name}</span>
                </p>
              </div>
              <button onClick={() => setEditModal(null)} className="p-1.5 rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground hover:text-foreground hover:bg-black/10 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              {Object.entries(editModal.config).map(([k, v]) => (
                <div key={k} className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">{k}</label>
                  <input defaultValue={v} className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground font-mono outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
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
