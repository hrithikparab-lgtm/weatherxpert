import { useState } from "react";
import {
  Bookmark,
  Plus,
  X,
  Calendar,
  Tag,
  AlignLeft,
  Trash2,
  ChevronDown,
} from "lucide-react";
import {
  type Annotation,
  ANNOTATION_TYPES,
} from "./accuracyData";

/* ═══════════════════════════════════════════════════
   ANNOTATION TOOL — Mark events on the chart timeline
   Create, list, delete annotations
   ═══════════════════════════════════════════════════ */

interface AnnotationToolProps {
  annotations: Annotation[];
  onAdd: (ann: Omit<Annotation, "id">) => void;
  onRemove: (id: string) => void;
}

export function AnnotationTool({ annotations, onAdd, onRemove }: AnnotationToolProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<Annotation["type"]>("custom");
  const [newDesc, setNewDesc] = useState("");

  const handleAdd = () => {
    if (!newDate || !newLabel) return;
    onAdd({ date: newDate, label: newLabel, type: newType, description: newDesc });
    setNewDate("");
    setNewLabel("");
    setNewType("custom");
    setNewDesc("");
    setIsAdding(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-secondary/10">
        <div className="flex items-center gap-2">
          <Bookmark className="w-3.5 h-3.5 text-chart-4" />
          <h4 className="text-[12px] text-foreground font-medium">Event Annotations</h4>
          <span className="text-[9px] text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-secondary tabular-nums">
            {annotations.length}
          </span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
            isAdding
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary hover:bg-primary/15"
          }`}
        >
          {isAdding ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {isAdding ? "Cancel" : "Add Event"}
        </button>
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="px-4 py-3 border-b border-border/40 bg-secondary/5 space-y-2.5 animate-in slide-in-from-top-1 duration-150">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Date Label</label>
              <div className="relative">
                <Calendar className="w-3 h-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="e.g. 08 Jan"
                  className="w-full pl-7 pr-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as Annotation["type"])}
                className="w-full px-2.5 py-1.5 bg-secondary/50 border border-border rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {ANNOTATION_TYPES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-popover">{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Event Name</label>
            <div className="relative">
              <Tag className="w-3 h-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Cyclone MAHA"
                className="w-full pl-7 pr-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
              />
            </div>
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Description</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Brief description of the event and its impact on accuracy..."
              rows={2}
              className="w-full px-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40 resize-none"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newDate || !newLabel}
            className="w-full py-1.5 bg-primary text-primary-foreground rounded-lg text-[11px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Add Annotation
          </button>
        </div>
      )}

      {/* List */}
      <div className="max-h-[250px] overflow-y-auto">
        {annotations.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <Bookmark className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-[11px] text-muted-foreground/50">No annotations yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {annotations.map((ann) => {
              const typeConf = ANNOTATION_TYPES.find((t) => t.id === ann.type);
              return (
                <div key={ann.id} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-secondary/10 transition-colors group">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: typeConf?.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-foreground font-medium">{ann.label}</span>
                      <span className="text-[8px] text-muted-foreground/50 font-mono">{ann.date}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5 line-clamp-1">{ann.description}</p>
                    <span
                      className="inline-block text-[8px] font-semibold uppercase tracking-wider mt-0.5 px-1 py-0.5 rounded"
                      style={{ color: typeConf?.color, backgroundColor: `color-mix(in srgb, ${typeConf?.color ?? "gray"} 10%, transparent)` }}
                    >
                      {typeConf?.label}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemove(ann.id)}
                    className="p-1 rounded text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
