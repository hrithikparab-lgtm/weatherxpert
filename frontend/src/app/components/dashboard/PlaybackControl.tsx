import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Cloud,
  Wind,
  Clock,
  Maximize2,
  Droplets,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   PLAYBACK CONTROL — Animated 6-hour cloud/wind map
   ═══════════════════════════════════════════════════ */

interface Frame {
  time: string;
  cloudCover: number;
  windDir: number;
  windSpeed: number;
  rainfall: number;
  visibility: string;
}

// Seeded random for stable frame data
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateFrames(): Frame[] {
  const frames: Frame[] = [];
  const now = new Date();
  for (let i = -24; i <= 0; i++) {
    const t = new Date(now.getTime() + i * 15 * 60 * 1000);
    const h = t.getHours();
    const m = t.getMinutes();
    const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const progress = (i + 24) / 24;
    const s = i + 100;

    const cloudCover = Math.min(95, Math.round(35 + progress * 45 + seededRand(s) * 10));
    const windSpeed = Math.round(12 + progress * 16 + seededRand(s + 1) * 4);
    const windDir = Math.round(200 + progress * 25 + seededRand(s + 2) * 10);
    const rainfall = Math.round((cloudCover > 60 ? (cloudCover - 60) * 0.3 + seededRand(s + 3) * 2 : 0) * 10) / 10;

    frames.push({
      time: timeStr,
      cloudCover,
      windDir,
      windSpeed,
      rainfall,
      visibility: cloudCover > 70 ? "Low" : cloudCover > 50 ? "Moderate" : "Good",
    });
  }
  return frames;
}

const FRAMES = generateFrames();

// Mumbai area grid points for wind visualization
const GRID_POINTS = [
  { x: 15, y: 25 }, { x: 30, y: 20 }, { x: 50, y: 18 }, { x: 70, y: 22 }, { x: 85, y: 28 },
  { x: 20, y: 45 }, { x: 38, y: 40 }, { x: 55, y: 38 }, { x: 72, y: 42 }, { x: 88, y: 48 },
  { x: 25, y: 62 }, { x: 42, y: 58 }, { x: 60, y: 55 }, { x: 78, y: 60 }, { x: 90, y: 65 },
  { x: 18, y: 78 }, { x: 35, y: 75 }, { x: 52, y: 72 }, { x: 68, y: 76 }, { x: 85, y: 80 },
];

// Cloud blobs — stable positions, opacity driven by cloudCover
const CLOUD_BLOBS = [
  { cx: 20, cy: 25, rx: 18, ry: 10, phase: 0 },
  { cx: 45, cy: 18, rx: 22, ry: 12, phase: 0.5 },
  { cx: 68, cy: 30, rx: 16, ry: 9, phase: 1.0 },
  { cx: 30, cy: 48, rx: 25, ry: 13, phase: 1.5 },
  { cx: 58, cy: 52, rx: 20, ry: 11, phase: 2.0 },
  { cx: 80, cy: 42, rx: 15, ry: 8, phase: 2.5 },
  { cx: 12, cy: 65, rx: 18, ry: 10, phase: 3.0 },
  { cx: 40, cy: 72, rx: 22, ry: 12, phase: 3.5 },
  { cx: 72, cy: 68, rx: 16, ry: 9, phase: 4.0 },
];

function WindArrow({ x, y, dir, speed }: { x: number; y: number; dir: number; speed: number }) {
  const len = 6 + (speed / 60) * 6;
  const rad = ((dir - 90) * Math.PI) / 180;
  const dx = Math.cos(rad) * len;
  const dy = Math.sin(rad) * len;
  const headLen = 2.5;
  const headAngle = 0.5;
  const ex = x + dx;
  const ey = y + dy;
  const angle = Math.atan2(dy, dx);
  return (
    <g opacity={0.55}>
      <line x1={x} y1={y} x2={ex} y2={ey} stroke="#6366f1" strokeWidth="0.9" />
      <line
        x1={ex} y1={ey}
        x2={ex - headLen * Math.cos(angle - headAngle)}
        y2={ey - headLen * Math.sin(angle - headAngle)}
        stroke="#6366f1" strokeWidth="0.9"
      />
      <line
        x1={ex} y1={ey}
        x2={ex - headLen * Math.cos(angle + headAngle)}
        y2={ey - headLen * Math.sin(angle + headAngle)}
        stroke="#6366f1" strokeWidth="0.9"
      />
    </g>
  );
}

function MapViz({ frame, isPlaying }: { frame: Frame; isPlaying: boolean }) {
  const cloudOpacity = frame.cloudCover / 100;
  const rainOpacity = frame.rainfall > 0 ? Math.min(0.7, frame.rainfall / 15) : 0;

  return (
    <div className="relative w-full rounded-xl border border-border overflow-hidden bg-gradient-to-b from-sky-50 to-blue-100 dark:from-slate-800 dark:to-slate-900" style={{ aspectRatio: "2.4/1" }}>
      <svg
        viewBox="0 0 400 165"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="seaGradDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0.6" />
          </linearGradient>
          <filter id="cloudBlur">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <radialGradient id="rainGrad" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sea background */}
        <rect x="0" y="0" width="400" height="165" fill="url(#seaGrad)" className="dark:fill-[url(#seaGradDark)]" />

        {/* Grid lines */}
        {[33, 66, 99, 132].map((y) => (
          <line key={`gy-${y}`} x1="0" y1={y} x2="400" y2={y} stroke="#94a3b8" strokeWidth="0.3" opacity="0.3" />
        ))}
        {[80, 160, 240, 320].map((x) => (
          <line key={`gx-${x}`} x1={x} y1="0" x2={x} y2="165" stroke="#94a3b8" strokeWidth="0.3" opacity="0.3" />
        ))}

        {/* Mumbai coastline (stylized) */}
        <path
          d="M180,0 L180,20 Q185,35 175,50 Q165,65 170,80 Q175,95 165,110 Q155,125 160,140 Q165,155 170,165 L400,165 L400,0 Z"
          fill="#f0fdf4"
          opacity="0.75"
          className="dark:fill-slate-700 dark:opacity-60"
        />
        {/* Coastline border */}
        <path
          d="M180,0 L180,20 Q185,35 175,50 Q165,65 170,80 Q175,95 165,110 Q155,125 160,140 Q165,155 170,165"
          stroke="#6366f1"
          strokeWidth="1.2"
          fill="none"
          opacity="0.4"
          strokeDasharray="4 3"
        />

        {/* Water ripples (animated when playing) */}
        {isPlaying && [1, 2, 3].map((i) => (
          <circle
            key={`ripple-${i}`}
            cx={80 + i * 25}
            cy={80 + i * 10}
            r={i * 8}
            fill="none"
            stroke="#6366f1"
            strokeWidth="0.5"
            opacity={0.2 - i * 0.05}
          />
        ))}

        {/* Rain overlay */}
        {rainOpacity > 0 && (
          <rect x="0" y="0" width="400" height="165" fill="url(#rainGrad)" opacity={rainOpacity} />
        )}
        {/* Rain streaks */}
        {rainOpacity > 0.2 && Array.from({ length: 18 }, (_, i) => (
          <line
            key={`rain-${i}`}
            x1={20 + i * 22}
            y1={10 + (i % 3) * 8}
            x2={15 + i * 22}
            y2={25 + (i % 3) * 8}
            stroke="#3b82f6"
            strokeWidth="0.6"
            opacity={rainOpacity * 0.6}
          />
        ))}

        {/* Cloud blobs */}
        {CLOUD_BLOBS.map((blob, i) => {
          const visible = (i / CLOUD_BLOBS.length) < cloudOpacity;
          if (!visible) return null;
          const opacity = 0.25 + cloudOpacity * 0.45;
          const bx = (blob.cx / 100) * 400;
          const by = (blob.cy / 100) * 165;
          const brx = (blob.rx / 100) * 400;
          const bry = (blob.ry / 100) * 165;
          return (
            <ellipse
              key={`cloud-${i}`}
              cx={bx}
              cy={by}
              rx={brx}
              ry={bry}
              fill="#e2e8f0"
              opacity={opacity}
              filter="url(#cloudBlur)"
              className="dark:fill-slate-400"
            />
          );
        })}

        {/* Wind arrows on grid */}
        {GRID_POINTS.map((pt, i) => (
          <WindArrow
            key={`wind-${i}`}
            x={(pt.x / 100) * 400}
            y={(pt.y / 100) * 165}
            dir={frame.windDir + (i % 5) * 4 - 10}
            speed={frame.windSpeed}
          />
        ))}

        {/* City markers */}
        {[
          { name: "Colaba", x: 195, y: 145 },
          { name: "Bandra", x: 210, y: 100 },
          { name: "Andheri", x: 230, y: 68 },
          { name: "Thane", x: 300, y: 55 },
          { name: "Borivali", x: 270, y: 30 },
        ].map((city) => (
          <g key={city.name}>
            <circle cx={city.x} cy={city.y} r="2.5" fill="#6366f1" opacity="0.9" />
            <circle cx={city.x} cy={city.y} r="5" fill="#6366f1" opacity="0.2" />
            <text
              x={city.x + 6}
              y={city.y + 3}
              fontSize="7"
              fill="#475569"
              className="dark:fill-slate-300"
              fontWeight="500"
            >
              {city.name}
            </text>
          </g>
        ))}

        {/* Stats overlay — bottom left */}
        <g>
          <rect x="4" y="140" width="110" height="22" rx="4" fill="white" fillOpacity="0.85" className="dark:fill-slate-800 dark:fill-opacity-90" />
          <text x="10" y="153" fontSize="8" fill="#64748b" fontWeight="600">
            ☁ {frame.cloudCover}%
          </text>
          <text x="50" y="153" fontSize="8" fill="#64748b" fontWeight="600">
            💨 {frame.windSpeed} km/h
          </text>
          {frame.rainfall > 0 && (
            <text x="95" y="153" fontSize="8" fill="#3b82f6" fontWeight="600">
              🌧 {frame.rainfall}mm
            </text>
          )}
        </g>

        {/* Time stamp */}
        <g>
          <rect x="330" y="4" width="66" height="16" rx="4" fill="white" fillOpacity="0.85" className="dark:fill-slate-800 dark:fill-opacity-90" />
          <text x="363" y="15" fontSize="9" fill="#475569" textAnchor="middle" fontWeight="600" className="dark:fill-slate-300">
            {frame.time}
          </text>
        </g>
      </svg>

      {/* Visibility badge */}
      <div className="absolute top-2 left-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
          frame.visibility === "Low"
            ? "bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400"
            : frame.visibility === "Moderate"
            ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
            : "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
        }`}>
          Visibility: {frame.visibility}
        </span>
      </div>
    </div>
  );
}

export function PlaybackControl() {
  const [currentFrame, setCurrentFrame] = useState(FRAMES.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const frame = FRAMES[currentFrame];

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const skipBack = useCallback(() => { setCurrentFrame(0); setIsPlaying(false); }, []);
  const skipForward = useCallback(() => { setCurrentFrame(FRAMES.length - 1); setIsPlaying(false); }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= FRAMES.length - 1) { setIsPlaying(false); return FRAMES.length - 1; }
          return prev + 1;
        });
      }, 600 / speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed]);

  const progress = ((currentFrame / (FRAMES.length - 1)) * 100).toFixed(1);

  // Timeline tick marks
  const tickFrames = [0, 6, 12, 18, 24].map((i) => FRAMES[Math.min(i, FRAMES.length - 1)]);

  return (
    <div className="rounded-xl border border-border bg-card transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500/20 flex items-center justify-center">
            <Cloud className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-[14px] text-foreground font-semibold">Cloud & Wind Playback</h3>
            <p className="text-[11px] text-muted-foreground">Last 6 hours · 15-min intervals</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <div className="flex items-center gap-0.5 bg-secondary/50 border border-border rounded-md p-0.5">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  speed === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="px-5 pb-3">
        <MapViz frame={frame} isPlaying={isPlaying} />
      </div>

      {/* Controls */}
      <div className="px-5 pb-5 space-y-2">
        {/* Slider */}
        <input
          type="range"
          min={0}
          max={FRAMES.length - 1}
          value={currentFrame}
          onChange={(e) => { setCurrentFrame(Number(e.target.value)); setIsPlaying(false); }}
          className="w-full h-1.5 appearance-none bg-secondary rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background"
          style={{
            background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${progress}%, hsl(var(--secondary)) ${progress}%, hsl(var(--secondary)) 100%)`,
          }}
        />

        {/* Timeline labels */}
        <div className="flex justify-between px-0.5">
          {tickFrames.map((f, i) => (
            <span key={i} className="text-[9px] text-muted-foreground tabular-nums">{f.time}</span>
          ))}
        </div>

        {/* Transport + Info */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <button onClick={skipBack} className="p-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={isPlaying ? pause : play}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={skipForward} className="p-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="font-semibold tabular-nums text-foreground">{frame.time}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Wind className="w-3 h-3" />
              <span className="font-medium tabular-nums">{frame.windSpeed} km/h</span>
            </div>
            {frame.rainfall > 0 && (
              <div className="flex items-center gap-1 text-blue-500">
                <Droplets className="w-3 h-3" />
                <span className="font-medium tabular-nums">{frame.rainfall}mm</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
