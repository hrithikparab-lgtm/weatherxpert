import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileUp,
  X,
  FileText,
  FileSpreadsheet,
  FileJson,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { MAX_FILE_SIZE_MB, ERROR_TOOLTIPS, type FileFormat } from "./uploadData";

/* ═══════════════════════════════════════════════════
   DROP ZONE — Drag-and-drop upload area with
   file type validation, size check, progress sim
   ═══════════════════════════════════════════════════ */

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  acceptedFile: File | null;
  onClear: () => void;
  isMobile?: boolean;
}

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls", ".json"];
const ACCEPTED_MIME: string[] = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/json",
];

function getFileIcon(name: string) {
  if (name.endsWith(".csv")) return <FileText className="w-5 h-5 text-chart-3" />;
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return <FileSpreadsheet className="w-5 h-5 text-chart-1" />;
  if (name.endsWith(".json")) return <FileJson className="w-5 h-5 text-chart-2" />;
  return <FileUp className="w-5 h-5 text-muted-foreground" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DropZone({ onFileAccepted, isUploading, uploadProgress, acceptedFile, onClear, isMobile }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type "${ext}". Accepted: ${ACCEPTED_EXTENSIONS.join(", ")}`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File too large (${formatFileSize(file.size)}). Maximum: ${MAX_FILE_SIZE_MB} MB`;
    }
    return null;
  }, []);

  const handleFile = useCallback((file: File) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onFileAccepted(file);
  }, [validateFile, onFileAccepted]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  }, [handleFile]);

  // ── Accepted file state ──
  if (acceptedFile && !isUploading) {
    return (
      <div className="rounded-xl border border-chart-3/20 bg-chart-3/3 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center flex-shrink-0">
            {getFileIcon(acceptedFile.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-chart-3" />
              <p className="text-[12px] text-foreground font-medium truncate">{acceptedFile.name}</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatFileSize(acceptedFile.size)} · Ready for preview
            </p>
          </div>
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Uploading state ──
  if (isUploading) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/3 p-6 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
          <Upload className="w-5 h-5 text-primary animate-bounce" />
        </div>
        <p className="text-[12px] text-foreground font-medium mb-2">Parsing file...</p>
        <div className="w-full max-w-xs mx-auto bg-secondary rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 tabular-nums">{uploadProgress}%</p>
      </div>
    );
  }

  // ── Drop zone ──
  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer group ${
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : error
            ? "border-destructive/30 bg-destructive/3"
            : "border-border hover:border-primary/30 hover:bg-primary/2"
        } ${isMobile ? "p-6" : "p-8"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="text-center">
          <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 transition-all ${
            isDragOver ? "bg-primary/15 scale-110" : "bg-secondary/60 group-hover:bg-primary/10"
          }`}>
            <Upload className={`w-6 h-6 transition-colors ${isDragOver ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
          </div>
          <p className="text-[13px] text-foreground font-medium mb-1">
            {isMobile ? "Tap to select a file" : "Drop your file here, or click to browse"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            CSV, Excel (.xlsx), or JSON · Max {MAX_FILE_SIZE_MB} MB
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
          <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] text-destructive font-medium">{error}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{ERROR_TOOLTIPS.format}</p>
          </div>
        </div>
      )}

      {/* Format hint */}
      {!error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
          <Info className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
          <p className="text-[9px] text-muted-foreground/60">
            {isMobile
              ? "Upload station observations or forecast data. Use templates for correct column format."
              : "Drag & drop station observations, solar irradiance, wind data, or forecast verification files. Download a template above for the correct column format."}
          </p>
        </div>
      )}
    </div>
  );
}
