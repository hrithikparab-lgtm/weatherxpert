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
} from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   PLAYBACK CONTROL — Animated 6-hour cloud/wind map
   ═══════════════════════════════════════════════════ */

interface Frame {
  time: string;
  label: string;
  cloudCover: number;  // percentage
  windDir: number;     // degrees
  windSpeed: number;
  visibility: string;
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

    // Simulate increasing cloud cover over time
    const cloudCover = Math.min(95, Math.round(35 + progress * 45 + Math.random() * 10));
    const windSpeed = Math.round(12 + progress * 16 + Math.random() * 4);
    const windDir = Math.round(200 + progress * 25 + Math.random() * 10);

    frames.push({
      time: timeStr,
      label: `${timeStr}`,
      cloudCover,
      windDir,
      windSpeed,
      visibility: cloudCover > 70 ? "Low" : cloudCover > 50 ? "Moderate" : "Good",
    });
  }
  return frames;
}

const FRAMES = generateFrames();

// Mini cloud/wind visualization rendered with CSS
function MapThumbnail({ frame, isPlaying }: { frame: Frame; isPlaying: boolean }) {
  // Generate cloud positions based on frame data
  const clouds = Array.from({ length: Math.floor(frame.cloudCover / 12) }, (_, i) => ({
    x: (i * 37 + frame.windDir / 4) % 100,
    y: (i * 23 + frame.cloudCover / 3) % 80 + 10,
    size: 20 + (i % 3) * 12,
    opacity: 0.15 + (frame.cloudCover / 100) * 0.35,
  }));

  return (
    <div className="relative w-full aspect-[2.2/1] rounded-lg bg-secondary/50 border border-border overflow-hidden">
      {/* Base map area */}
      <div className="absolute inset-0 opacity-40">
        <svg viewBox="0 0 400 180" className="w-full h-full" preserveAspectRatio="none">
          {/* Stylized Mumbai coastline */}
          <path
            d="M0,90 Q50,85 80,100 Q100,110 120,95 Q150,80 180,85 Q200,90 220,80 Q260,65 300,70 Q340,75 380,60 L400,60 L400,180 L0,180 Z"
            fill="var(--primary)"
            opacity="0.08"
          />
          <path
            d="M0,90 Q50,85 80,100 Q100,110 120,95 Q150,80 180,85 Q200,90 220,80 Q260,65 300,70 Q340,75 380,60"
            stroke="var(--primary)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.25"
          />
          {/* Grid lines */}
          {[40, 80, 120, 160].map((y) => (
            <line key={`h-${y}`} x1="0" y1={y} x2="400" y2={y} stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
          ))}
          {[80, 160, 240, 320].map((x) => (
            <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="180" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
          ))}
        </svg>
      </div>

      {/* Cloud patches */}
      {clouds.map((cloud, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-md transition-all duration-700"
          style={{
            left: `${cloud.x}%`,
            top: `${cloud.y}%`,
            width: `${cloud.size}%`,
            height: `${cloud.size * 0.6}%`,
            backgroundColor: "var(--muted-foreground)",
            opacity: cloud.opacity,
            transform: `translateX(${isPlaying ? "2px" : "0"})`,
          }}
        />
      ))}

      {/* Wind arrows */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <Wind
          className="w-10 h-10 text-primary"
          style={{ transform: `rotate(${frame.windDir - 180}deg)` }}
        />
      </div>

      {/* Location pin */}
      <div className="absolute" style={{ left: "45%", top: "40%" }}>
        <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50 ring-2 ring-primary/30" />
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-card/80 backdrop-blur-sm border border-border/60 rounded-md px-2 py-1">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Cloud className="w-3 h-3" />
          <span className="tabular-nums">{frame.cloudCover}%</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Wind className="w-3 h-3" />
          <span className="tabular-nums">{frame.windSpeed} km/h</span>
        </div>
      </div>

      {/* Time stamp */}
      <div className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm border border-border/60 rounded-md px-2 py-0.5 text-[10px] text-muted-foreground font-medium tabular-nums">
        {frame.time}
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

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const skipBack = useCallback(() => {
    setCurrentFrame(0);
    setIsPlaying(false);
  }, []);

  const skipForward = useCallback(() => {
    setCurrentFrame(FRAMES.length - 1);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= FRAMES.length - 1) {
            setIsPlaying(false);
            return FRAMES.length - 1;
          }
          return prev + 1;
        });
      }, 600 / speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed]);

  const progress = ((currentFrame / (FRAMES.length - 1)) * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-border bg-card transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-chart-4/10 ring-1 ring-chart-4/20 flex items-center justify-center">
            <Cloud className="w-4 h-4 text-chart-4" />
          </div>
          <div>
            <h3 className="text-[14px] text-foreground font-medium">
              Cloud & Wind Playback
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Last 6 hours · 15-min intervals
            </p>
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
                  speed === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
          <button
            onClick={() => toast.info("Fullscreen Playback", { description: "Expanded cloud & wind view opened." })}
            className="p-1.5 rounded-md bg-secondary/50 border border-border text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Thumbnail */}
      <div className="px-5 pb-3">
        <MapThumbnail frame={frame} isPlaying={isPlaying} />
      </div>

      {/* Transport Controls */}
      <div className="px-5 pb-5 space-y-3">
        {/* Timeline Slider */}
        <div className="relative">
          <input
            type="range"
            min={0}
            max={FRAMES.length - 1}
            value={currentFrame}
            onChange={(e) => {
              setCurrentFrame(Number(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full h-1.5 appearance-none bg-secondary rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-primary/30 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background"
            style={{
              background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${progress}%, var(--secondary) ${progress}%, var(--secondary) 100%)`,
            }}
          />
        </div>

        {/* Controls + Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={skipBack}
              className="p-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={isPlaying ? pause : play}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={skipForward}
              className="p-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="font-medium tabular-nums">{frame.time}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              Visibility:
              <span
                className={`font-medium ${
                  frame.visibility === "Low"
                    ? "text-destructive"
                    : frame.visibility === "Moderate"
                    ? "text-chart-2"
                    : "text-chart-3"
                }`}
              >
                {frame.visibility}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}