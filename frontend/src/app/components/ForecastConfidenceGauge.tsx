import React from "react";

interface Props {
  today: number;    // 0–1
  sevenDay: number; // 0–1
}

export function ForecastConfidenceGauge({ today, sevenDay }: Props) {
  // ─── Geometry helpers ────────────────────────────────────────────────────
  const CX = 100, CY = 85, R = 64, SW = 14;

  const toRad = (d: number) => (d * Math.PI) / 180;
  const p2c = (deg: number, r: number = R) => ({
    x: CX + r * Math.cos(toRad(deg)),
    y: CY + r * Math.sin(toRad(deg)),
  });

  /** SVG arc path: startDeg clockwise by sweepDeg */
  const arcPath = (startDeg: number, sweepDeg: number, r: number = R): string => {
    if (sweepDeg <= 0) return "";
    const s = sweepDeg >= 360 ? 359.99 : sweepDeg;
    const from = p2c(startDeg, r);
    const to   = p2c(startDeg + s, r);
    const la   = s > 180 ? 1 : 0;
    return `M ${from.x.toFixed(3)} ${from.y.toFixed(3)} A ${r} ${r} 0 ${la} 1 ${to.x.toFixed(3)} ${to.y.toFixed(3)}`;
  };

  const START = 135;  // 8-o'clock in SVG coord system
  const SPAN  = 270;  // total gauge sweep
  const ZR    = R - SW / 2 + 3; // zone-stripe radius (inside the track)

  // ─── Semantics ────────────────────────────────────────────────────────────
  const color      = today >= 0.8 ? "#10b981" : today >= 0.6 ? "#f59e0b" : "#ef4444";
  const colorLight = today >= 0.8 ? "#6ee7b7" : today >= 0.6 ? "#fcd34d" : "#fca5a5";

  const textCls = today >= 0.8
    ? "text-emerald-500 dark:text-emerald-400"
    : today >= 0.6
    ? "text-amber-500 dark:text-amber-400"
    : "text-red-500 dark:text-red-400";

  const statusLabel = today >= 0.8 ? "High Confidence" : today >= 0.6 ? "Moderate" : "Low";

  const statusCls = today >= 0.8
    ? "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/40"
    : today >= 0.6
    ? "bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/40"
    : "bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/40";

  // ─── SVG path data ────────────────────────────────────────────────────────
  const trackPath    = arcPath(START, SPAN);
  const cToday       = Math.max(0.02, Math.min(0.98, today));
  const progressPath = arcPath(START, cToday * SPAN);

  // Three colour-zone stripes on the inner ring
  const redPath = arcPath(START,               0.40 * SPAN, ZR);
  const ambPath = arcPath(START + 0.40 * SPAN, 0.30 * SPAN, ZR);
  const grnPath = arcPath(START + 0.70 * SPAN, 0.30 * SPAN, ZR);

  // ─── Needle dot position ──────────────────────────────────────────────────
  const dot = p2c(START + today * SPAN);

  // ─── Tick marks at 0 / 25 / 50 / 75 / 100 % ─────────────────────────────
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    inner: p2c(START + t * SPAN, R - SW / 2 - 4),
    outer: p2c(START + t * SPAN, R + SW / 2 + 4),
  }));

  // ─── Scale-end labels ─────────────────────────────────────────────────────
  const LR = R + SW / 2 + 11;
  const l0 = p2c(START,        LR);
  const l1 = p2c(START + SPAN, LR);

  // ─── 7-Day bar ────────────────────────────────────────────────────────────
  const sdColor   = sevenDay >= 0.8 ? "#10b981" : sevenDay >= 0.6 ? "#f59e0b" : "#ef4444";
  const sdGlow    = sevenDay >= 0.8 ? "#6ee7b7" : sevenDay >= 0.6 ? "#fcd34d" : "#fca5a5";
  const sdTextCls = sevenDay >= 0.8
    ? "text-emerald-500 dark:text-emerald-400"
    : sevenDay >= 0.6
    ? "text-amber-500 dark:text-amber-400"
    : "text-red-500 dark:text-red-400";
  const sdLabel = sevenDay >= 0.8 ? "High" : sevenDay >= 0.6 ? "Moderate" : "Low";

  const VH = 148; // viewBox / container height

  return (
    <div className="flex flex-col items-center w-full gap-3 select-none">

      {/* ====== 270deg Speedometer ====== */}
      <div className="relative w-full" style={{ height: VH }}>
        <svg
          viewBox={`0 0 200 ${VH}`}
          className="w-full h-full"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Gradient aligned to the arc's horizontal span */}
            <linearGradient
              id="fcg-grad"
              gradientUnits="userSpaceOnUse"
              x1={CX - R} y1={CY}
              x2={CX + R} y2={CY}
            >
              <stop offset="0%"   stopColor={colorLight} stopOpacity={0.9} />
              <stop offset="100%" stopColor={color}      stopOpacity={1}   />
            </linearGradient>

            {/* Soft glow on progress arc */}
            <filter id="fcg-arc-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="cb" />
              <feMerge>
                <feMergeNode in="cb" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Stronger glow for needle dot */}
            <filter id="fcg-dot-glow" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="4" result="cb" />
              <feMerge>
                <feMergeNode in="cb" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Muted track (full 270-deg background) */}
          <path
            d={trackPath} fill="none"
            stroke="currentColor" strokeOpacity={0.12}
            strokeWidth={SW} strokeLinecap="round"
            className="text-foreground"
          />

          {/* Zone stripes (thin inner arcs) */}
          <path d={redPath} fill="none" stroke="#ef4444" strokeOpacity={0.6} strokeWidth={3} strokeLinecap="butt" />
          <path d={ambPath} fill="none" stroke="#f59e0b" strokeOpacity={0.6} strokeWidth={3} strokeLinecap="butt" />
          <path d={grnPath} fill="none" stroke="#10b981" strokeOpacity={0.6} strokeWidth={3} strokeLinecap="butt" />

          {/* Filled progress arc */}
          <path
            d={progressPath} fill="none"
            stroke="url(#fcg-grad)"
            strokeWidth={SW} strokeLinecap="round"
            filter="url(#fcg-arc-glow)"
          />

          {/* Tick marks */}
          {ticks.map((tk, i) => (
            <line
              key={i}
              x1={tk.inner.x} y1={tk.inner.y}
              x2={tk.outer.x} y2={tk.outer.y}
              stroke="currentColor" strokeOpacity={0.22} strokeWidth={1.5}
              className="text-foreground"
            />
          ))}

          {/* Needle dot: halo -> ring -> white body -> colour pip */}
          <circle cx={dot.x} cy={dot.y} r={SW / 2 + 5}
            fill={color} fillOpacity={0.18} filter="url(#fcg-dot-glow)" />
          <circle cx={dot.x} cy={dot.y} r={SW / 2 + 1} fill={color} />
          <circle cx={dot.x} cy={dot.y} r={SW / 2 - 3} fill="white" />
          <circle cx={dot.x} cy={dot.y} r={3.5}         fill={color} />

          {/* Scale labels at arc ends */}
          <text
            x={l0.x} y={l0.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={8} fill="currentColor" fillOpacity={0.45}
            className="text-foreground"
          >0%</text>
          <text
            x={l1.x} y={l1.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={8} fill="currentColor" fillOpacity={0.45}
            className="text-foreground"
          >100%</text>
        </svg>

        {/* Percentage + label + badge centred over gauge circle */}
        <div
          className="absolute left-0 right-0 flex flex-col items-center pointer-events-none"
          style={{ top: `${(CY / VH) * 100}%`, transform: "translateY(-46%)" }}
        >
          <span className={`text-[1.9rem] font-black tabular-nums leading-none ${textCls}`}>
            {Math.round(today * 100)}%
          </span>
          <span className="text-[10px] text-muted-foreground tracking-wide mt-1">Today</span>
          <span className={`text-[9px] font-semibold px-2.5 py-[3px] rounded-full mt-2 ${statusCls}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* ====== 7-Day Avg Bar ====== */}
      

    </div>
  );
}
