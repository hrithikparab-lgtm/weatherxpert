import { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronDown,
} from "lucide-react";
import { TIME_STEPS, PLAYBACK_SPEEDS } from "./mapData";

/* ═══════════════════════════════════════════════════
   TIMELINE PLAYER — Bottom playback bar
   Time slider · Play/Pause · Speed selector
   ═══════════════════════════════════════════════════ */

interface TimelinePlayerProps {
  progress: number;
  onProgressChange: (p: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  playbackHours: number;
  onPlaybackHoursChange: (h: number) => void;
}

export function TimelinePlayer({
  progress,
  onProgressChange,
  isPlaying,
  onPlayToggle,
  onSkipBack,
  onSkipForward,
  playbackHours,
  onPlaybackHoursChange,
}: TimelinePlayerProps) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Current timestamp label
  const currentHour = (progress / 100) * playbackHours;
  const timeLabel =
    currentHour < 0.05
      ? "Now"
      : `+${currentHour.toFixed(1)}h`;

  return (
    <div className="bg-popover/90 backdrop-blur-md border border-border rounded-xl p-3 shadow-2xl transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Play controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onSkipBack}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onPlayToggle}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>
          <button
            onClick={onSkipForward}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 relative">
          {/* Track */}
          <div className="relative h-8 flex items-center">
            <div
              className="absolute inset-x-0 h-1.5 bg-secondary rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                onProgressChange(pct);
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Thumb */}
            <div
              className="absolute h-4 w-4 bg-card border-2 border-primary rounded-full shadow-lg cursor-pointer hover:scale-125 transition-transform z-10"
              style={{ left: `${progress}%`, transform: "translateX(-50%)" }}
              onMouseDown={(e) => {
                const track = e.currentTarget.parentElement!;
                const rect = track.getBoundingClientRect();
                const onMove = (ev: MouseEvent) => {
                  const pct = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100));
                  onProgressChange(pct);
                };
                const onUp = () => {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
            />

            {/* Time labels */}
            <div className="absolute top-5 inset-x-0 flex justify-between pointer-events-none">
              {Array.from({ length: playbackHours + 1 }, (_, i) => (
                <span key={i} className="text-[8px] text-muted-foreground/60 tabular-nums font-medium">
                  {i === 0 ? "Now" : `+${i}h`}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Current time badge */}
        <div className="text-[11px] text-foreground font-medium tabular-nums bg-secondary/60 border border-border px-2 py-1 rounded-md min-w-[50px] text-center">
          {timeLabel}
        </div>

        {/* Speed selector */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-secondary/60 border border-border rounded-lg text-[11px] text-foreground font-medium hover:bg-secondary transition-colors"
          >
            {playbackHours}h
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          {showSpeedMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSpeedMenu(false)} />
              <div className="absolute bottom-full mb-1 right-0 bg-popover border border-border rounded-lg shadow-xl z-20 py-0.5 w-24 animate-in fade-in slide-in-from-bottom-1 duration-150">
                {PLAYBACK_SPEEDS.map((speed) => (
                  <button
                    key={speed.hours}
                    onClick={() => {
                      onPlaybackHoursChange(speed.hours);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-[11px] text-left transition-colors ${
                      playbackHours === speed.hours
                        ? "text-primary bg-primary/5 font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {speed.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
