import { useState } from "react";
import {
  Bell,
  BellOff,
  Mail,
  Smartphone,
  MessageSquare,
  X,
  UserPlus,
  Trash2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   NOTIFICATION SETTINGS PANEL — Push toggle,
   recipient quick-edit
   ═══════════════════════════════════════════════════ */

interface NotificationSettingsProps {
  open: boolean;
  onClose: () => void;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  channel: "email" | "sms" | "slack";
}

const INITIAL_RECIPIENTS: Recipient[] = [
  { id: "r1", name: "Rajiv Sharma", email: "rajiv.s@tatapower.com", channel: "email" },
  { id: "r2", name: "Priya Mehta", email: "priya.m@tatapower.com", channel: "sms" },
  { id: "r3", name: "Arun Desai", email: "arun.d@tatapower.com", channel: "slack" },
];

const CHANNEL_ICONS = {
  email: Mail,
  sms: Smartphone,
  slack: MessageSquare,
};

export function NotificationSettings({ open, onClose }: NotificationSettingsProps) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>(INITIAL_RECIPIENTS);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] text-foreground font-medium">Notifications</h3>
              <p className="text-[11px] text-muted-foreground">Push & recipient settings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Push notifications */}
          <div className="space-y-3">
            <h4 className="text-[12px] text-muted-foreground font-semibold uppercase tracking-wider">
              Push Notifications
            </h4>

            {/* Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                {pushEnabled ? (
                  <Bell className="w-4 h-4 text-chart-3" />
                ) : (
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-[13px] text-foreground font-medium">
                    {pushEnabled ? "Notifications enabled" : "Notifications disabled"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Real-time browser push alerts</p>
                </div>
              </div>
              <button
                onClick={() => setPushEnabled(!pushEnabled)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                  pushEnabled ? "bg-chart-3" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    pushEnabled ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Critical only filter */}
            <div className="flex items-center justify-between py-2 border-t border-border/50">
              <div>
                <p className="text-[13px] text-foreground font-medium">Critical alerts only</p>
                <p className="text-[11px] text-muted-foreground">Only show Critical & High severity</p>
              </div>
              <button
                onClick={() => setCriticalOnly(!criticalOnly)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                  criticalOnly ? "bg-destructive" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    criticalOnly ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[12px] text-muted-foreground font-semibold uppercase tracking-wider">
                Alert Recipients
              </h4>
              <button className="flex items-center gap-1 text-[11px] text-primary font-medium hover:text-primary/80 transition-colors">
                <UserPlus className="w-3 h-3" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {recipients.map((r) => {
                const ChannelIcon = CHANNEL_ICONS[r.channel];
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 px-3 py-2.5 bg-secondary/30 border border-border/50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] text-primary font-semibold flex-shrink-0">
                      {r.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-foreground font-medium truncate">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{r.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-secondary text-[9px] text-muted-foreground font-medium uppercase">
                        <ChannelIcon className="w-2.5 h-2.5" />
                        {r.channel}
                      </span>
                      <button
                        onClick={() => setRecipients(recipients.filter(x => x.id !== r.id))}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex items-center gap-2">
          <button onClick={onClose} className="flex-1 py-2 bg-secondary border border-border rounded-lg text-[12px] text-foreground font-medium hover:bg-secondary/80 transition-colors">
            Cancel
          </button>
          <button onClick={onClose} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] font-medium hover:bg-primary/90 transition-colors shadow-sm">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
