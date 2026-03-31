import { useState } from "react";
import {
  Tag,
  Bell,
  Calendar,
  Clock,
  Mail,
  Smartphone,
  Users,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import {
  type Severity,
  type NotificationTarget,
  type ScheduleWindow,
  SEVERITY_OPTIONS,
} from "./builderTypes";

/* ═══════════════════════════════════════════════════
   RULE CONFIG — Name, severity, notifications,
   schedule, save controls
   ═══════════════════════════════════════════════════ */

interface RuleConfigProps {
  ruleName: string;
  onNameChange: (name: string) => void;
  ruleDescription: string;
  onDescriptionChange: (desc: string) => void;
  severity: Severity;
  onSeverityChange: (s: Severity) => void;
  notifications: NotificationTarget[];
  onNotificationsChange: (n: NotificationTarget[]) => void;
  schedule: ScheduleWindow;
  onScheduleChange: (s: ScheduleWindow) => void;
}

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CHANNEL_ICONS = { email: Mail, sms: Smartphone, group: Users };

export function RuleConfig({
  ruleName,
  onNameChange,
  ruleDescription,
  onDescriptionChange,
  severity,
  onSeverityChange,
  notifications,
  onNotificationsChange,
  schedule,
  onScheduleChange,
}: RuleConfigProps) {
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [newNotifType, setNewNotifType] = useState<"email" | "sms" | "group">("email");
  const [newNotifValue, setNewNotifValue] = useState("");

  const addNotification = () => {
    if (!newNotifValue.trim()) return;
    const target: NotificationTarget = {
      id: `notif-${Date.now()}`,
      type: newNotifType,
      value: newNotifValue.trim(),
      label:
        newNotifType === "group"
          ? newNotifValue.trim()
          : newNotifValue.trim(),
    };
    onNotificationsChange([...notifications, target]);
    setNewNotifValue("");
    setShowNotifForm(false);
  };

  const removeNotification = (id: string) => {
    onNotificationsChange(notifications.filter((n) => n.id !== id));
  };

  const toggleDay = (day: string) => {
    const days = schedule.days.includes(day)
      ? schedule.days.filter((d) => d !== day)
      : [...schedule.days, day];
    onScheduleChange({ ...schedule, days });
  };

  return (
    <div className="space-y-5">
      {/* ── Rule Identity ── */}
      <section className="space-y-3">
        <h4 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3 h-3" />
          Rule Identity
        </h4>
        <div className="space-y-2">
          <input
            type="text"
            value={ruleName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Rule name (e.g. Heat Wave Critical)"
            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-[13px] text-foreground font-medium outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
          />
          <textarea
            value={ruleDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Description (optional)..."
            rows={2}
            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-[12px] text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50 resize-none"
          />
        </div>
      </section>

      {/* ── Severity ── */}
      <section className="space-y-2">
        <h4 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
          Severity Level
        </h4>
        <div className="flex gap-1.5 flex-wrap">
          {SEVERITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSeverityChange(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                severity === opt.value
                  ? "bg-primary/10 border-primary/30 text-primary ring-1 ring-primary/20"
                  : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${opt.color}`} />
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Notifications ── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-3 h-3" />
            Notifications
          </h4>
          <button
            onClick={() => setShowNotifForm(!showNotifForm)}
            className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>

        {/* Existing targets */}
        <div className="space-y-1.5">
          {notifications.length === 0 && !showNotifForm && (
            <p className="text-[11px] text-muted-foreground/50 italic">No notification targets configured</p>
          )}
          {notifications.map((n) => {
            const ChannelIcon = CHANNEL_ICONS[n.type];
            return (
              <div
                key={n.id}
                className="flex items-center gap-2 px-2.5 py-2 bg-secondary/30 border border-border/50 rounded-lg"
              >
                <ChannelIcon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground font-medium truncate">{n.value}</p>
                </div>
                <span className="text-[9px] text-muted-foreground uppercase font-semibold px-1.5 py-0.5 rounded bg-secondary">
                  {n.type}
                </span>
                <button
                  onClick={() => removeNotification(n.id)}
                  className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add form */}
        {showNotifForm && (
          <div className="flex items-center gap-1.5 p-2 border border-border/50 rounded-lg bg-secondary/20 animate-in slide-in-from-top-1 duration-150">
            <select
              value={newNotifType}
              onChange={(e) => setNewNotifType(e.target.value as "email" | "sms" | "group")}
              className="bg-secondary border border-border rounded-md px-2 py-1.5 text-[11px] text-foreground font-medium outline-none cursor-pointer"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="group">Group</option>
            </select>
            <input
              type="text"
              value={newNotifValue}
              onChange={(e) => setNewNotifValue(e.target.value)}
              placeholder={newNotifType === "email" ? "user@tatapower.com" : newNotifType === "sms" ? "+91 XXXXX" : "Group name"}
              className="flex-1 px-2 py-1.5 bg-transparent border border-border rounded-md text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
              onKeyDown={(e) => { if (e.key === "Enter") addNotification(); }}
            />
            <button
              onClick={addNotification}
              className="px-2.5 py-1.5 bg-primary text-primary-foreground rounded-md text-[10px] font-medium hover:bg-primary/90 transition-colors"
            >
              Add
            </button>
          </div>
        )}
      </section>

      {/* ── Schedule ── */}
      <section className="space-y-2">
        <h4 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3 h-3" />
          Active Schedule
        </h4>

        {/* Days */}
        <div className="flex gap-1">
          {DAYS_SHORT.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`w-9 h-8 rounded-lg text-[10px] font-medium transition-all ${
                schedule.days.includes(day)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/50 border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Time range */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 flex-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <input
              type="time"
              value={schedule.startTime}
              onChange={(e) => onScheduleChange({ ...schedule, startTime: e.target.value })}
              className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none cursor-pointer flex-1"
            />
          </div>
          <span className="text-[11px] text-muted-foreground">to</span>
          <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 flex-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <input
              type="time"
              value={schedule.endTime}
              onChange={(e) => onScheduleChange({ ...schedule, endTime: e.target.value })}
              className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none cursor-pointer flex-1"
            />
          </div>
        </div>

        {/* Timezone */}
        <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase">TZ</span>
          <select
            value={schedule.timezone}
            onChange={(e) => onScheduleChange({ ...schedule, timezone: e.target.value })}
            className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none cursor-pointer flex-1"
          >
            <option value="Asia/Kolkata" className="bg-popover text-foreground">Asia/Kolkata (IST)</option>
            <option value="UTC" className="bg-popover text-foreground">UTC</option>
          </select>
        </div>
      </section>
    </div>
  );
}
