import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Sparkles, BrainCircuit } from "lucide-react";

/* ═══════════════════════════════════════════════════
   CINEMATIC EARTH ZOOM ANIMATION
   Premium satellite-to-location transition for Map entry
   Enterprise-grade · Professional tone · Smooth easing
   ═══════════════════════════════════════════════════ */

interface EarthZoomAnimationProps {
  onComplete: () => void;
}

export function EarthZoomAnimation({ onComplete }: EarthZoomAnimationProps) {
  const [stage, setStage] = useState<"earth" | "target" | "zoom" | "reveal" | "complete">("earth");
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    // Enable skip button after 800ms
    const skipTimer = setTimeout(() => setShowSkip(true), 800);

    // Animation timeline
    const timer1 = setTimeout(() => setStage("target"), 1500); // 1.5s - Show target location
    const timer2 = setTimeout(() => setStage("zoom"), 3000); // 3s - Start cinematic zoom
    const timer3 = setTimeout(() => setStage("reveal"), 5500); // 5.5s - Reveal map
    const timer4 = setTimeout(() => {
      setStage("complete");
      onComplete();
    }, 6500); // 6.5s - Complete

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setStage("complete");
    onComplete();
  };

  if (stage === "complete") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[150] bg-slate-950 overflow-hidden"
        onClick={showSkip ? handleSkip : undefined}
      >
        {/* Background Stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 120 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: Math.random() * 4 + 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Earth Container */}
        <div className="absolute inset-0 flex items-center justify-center perspective-1000">
          <motion.div
            className="relative"
            initial={{ scale: 0.4, opacity: 0, rotateY: 0 }}
            animate={{
              scale: stage === "earth" || stage === "target" ? 1 : 18,
              opacity: stage === "reveal" ? 0 : 1,
              rotateY: stage === "earth" || stage === "target" ? 360 : 20,
            }}
            transition={{
              scale: {
                duration: stage === "zoom" ? 2.5 : 0.8,
                ease: [0.43, 0.13, 0.23, 0.96], // Custom bezier for cinematic feel
              },
              opacity: {
                duration: stage === "reveal" ? 0.6 : 0.8,
                delay: stage === "reveal" ? 0.2 : 0,
              },
              rotateY: {
                duration: stage === "earth" || stage === "target" ? 40 : 2,
                ease: "linear",
              },
            }}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Earth Sphere with 3D effect */}
            <div className="relative w-[400px] h-[400px]">
              {/* Outer Atmosphere Glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, rgba(59, 130, 246, 0.5), rgba(37, 99, 235, 0.3), transparent 65%)",
                  boxShadow:
                    "0 0 100px rgba(59, 130, 246, 0.5), inset 0 0 80px rgba(59, 130, 246, 0.2)",
                }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Earth Globe */}
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, #1e40af 0%, #1e3a8a 40%, #0f1d4a 70%, #050a1f 100%)",
                  boxShadow: "inset -25px -25px 70px rgba(0, 0, 0, 0.9)",
                }}
              >
                {/* Landmass Overlay - India and surrounding regions */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 400 400"
                  style={{ opacity: 0.5 }}
                >
                  {/* India */}
                  <motion.path
                    d="M 200 140 Q 175 165, 185 200 Q 190 230, 210 250 Q 230 260, 250 240 Q 270 210, 265 175 Q 255 145, 230 135 Q 215 130, 200 140 Z"
                    fill="#10b981"
                    opacity={0.7}
                    initial={{ opacity: 0.7 }}
                    animate={{
                      opacity: stage === "target" ? 1 : 0.7,
                      fill: stage === "target" ? "#10b981" : "#34d399",
                    }}
                    transition={{ duration: 0.6 }}
                  />
                  {/* Asia */}
                  <path
                    d="M 250 80 Q 280 85, 310 100 Q 330 120, 340 150 Q 335 180, 310 200 Q 280 210, 250 200 Q 260 170, 270 140 Q 270 110, 250 80 Z"
                    fill="#34d399"
                    opacity={0.4}
                  />
                  {/* Africa */}
                  <ellipse cx="140" cy="230" rx="45" ry="80" fill="#34d399" opacity={0.45} />
                  {/* Europe */}
                  <ellipse cx="160" cy="100" rx="50" ry="35" fill="#34d399" opacity={0.4} />
                  {/* Australia */}
                  <ellipse cx="310" cy="280" rx="40" ry="35" fill="#34d399" opacity={0.4} />
                </svg>

                {/* Cloud Patterns */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    x: stage === "zoom" ? [-400, 0] : 0,
                  }}
                  transition={{
                    duration: 2.5,
                    ease: "easeOut",
                  }}
                >
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute bg-white/25 rounded-full blur-md"
                      style={{
                        width: `${Math.random() * 80 + 40}px`,
                        height: `${Math.random() * 50 + 25}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        x: [0, -30, 0],
                        opacity: [0.2, 0.5, 0.2],
                      }}
                      transition={{
                        duration: Math.random() * 8 + 6,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  ))}
                </motion.div>

                {/* Wind Streaks - only when not zooming */}
                {stage !== "zoom" && (
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                    {[...Array(16)].map((_, i) => {
                      const x1 = Math.random() * 400;
                      const y1 = Math.random() * 400;
                      const angle = Math.random() * 360;
                      const length = Math.random() * 60 + 40;
                      const x2 = x1 + length * Math.cos((angle * Math.PI) / 180);
                      const y2 = y1 + length * Math.sin((angle * Math.PI) / 180);

                      return (
                        <motion.line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="rgba(255, 255, 255, 0.3)"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{
                            pathLength: [0, 1, 0],
                            opacity: [0, 0.6, 0],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "linear",
                          }}
                        />
                      );
                    })}
                  </svg>
                )}
              </motion.div>

              {/* Target Location Marker (Stage 2) */}
              <AnimatePresence>
                {stage === "target" && (
                  <motion.div
                    className="absolute"
                    style={{
                      left: "52%",
                      top: "42%",
                      transform: "translate(-50%, -50%)",
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Pulsing Glow Rings */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-emerald-400 rounded-full"
                        initial={{ width: 0, height: 0, opacity: 0 }}
                        animate={{
                          width: [0, 140, 140],
                          height: [0, 140, 140],
                          opacity: [0, 0.7, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.6,
                          ease: "easeOut",
                        }}
                      />
                    ))}

                    {/* Animated Marker Pin */}
                    <motion.div
                      className="relative z-10"
                      animate={{
                        y: [0, -12, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <MapPin className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,1)]" />
                    </motion.div>

                    {/* Trajectory Line */}
                    <motion.svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 100 100"
                      style={{ width: "200px", height: "200px", left: "-100px", top: "-100px" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.path
                        d="M 10 10 Q 40 40, 50 50"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        fill="none"
                        strokeDasharray="4 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                      />
                    </motion.svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Motion Blur Overlay (during zoom) */}
        <AnimatePresence>
          {stage === "zoom" && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              style={{
                background:
                  "radial-gradient(circle, transparent 0%, rgba(0, 0, 0, 0.6) 100%)",
                backdropFilter: "blur(6px)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Map Reveal (Stage 4) */}
        <AnimatePresence>
          {stage === "reveal" && (
            <motion.div
              className="absolute inset-0 bg-slate-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Grid Pattern Background */}
              <motion.div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(59, 130, 246, 0.6) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(59, 130, 246, 0.6) 1px, transparent 1px)
                  `,
                  backgroundSize: "60px 60px",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                transition={{ delay: 0.2 }}
              />

              {/* Location Badge */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <motion.div
                  className="inline-flex items-center gap-3 px-6 py-4 bg-blue-600/20 backdrop-blur-xl rounded-2xl border border-blue-400/30 shadow-2xl shadow-blue-500/20"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                >
                  <MapPin className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="text-white font-bold text-xl tracking-tight">
                      Live Weather Map
                    </div>
                    <div className="text-blue-300 text-sm mt-1 font-medium">
                      India - TATA Power Operations
                    </div>
                  </div>
                </motion.div>

                {/* AI Assistant Hint - HIDDEN */}
                {/* <motion.div
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-violet-600/20 backdrop-blur-xl rounded-full border border-violet-400/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <BrainCircuit className="w-4 h-4 text-violet-400" />
                  <span className="text-violet-200 text-xs font-medium">
                    AI Assistant available (bottom-right)
                  </span>
                  <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" />
                </motion.div> */}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 1: Loading Text */}
        <AnimatePresence>
          {stage === "earth" && (
            <motion.div
              className="absolute bottom-24 left-1/2 -translate-x-1/2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 shadow-xl">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
                </motion.div>
                <span className="text-white/90 text-sm font-medium">
                  Loading Global Weather View...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 2: Target Detection Text */}
        <AnimatePresence>
          {stage === "target" && (
            <motion.div
              className="absolute bottom-24 left-1/2 -translate-x-1/2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/15 backdrop-blur-xl rounded-full border border-emerald-400/30 shadow-xl">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </motion.div>
                <span className="text-emerald-300 text-sm font-medium">
                  Target Location: India - TATA Power Operations
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-2">
          {["earth", "target", "zoom", "reveal"].map((s, i) => (
            <motion.div
              key={s}
              className="h-1 rounded-full"
              style={{ width: 48 }}
              initial={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              animate={{
                backgroundColor:
                  ["earth", "target", "zoom", "reveal"].indexOf(stage) >= i
                    ? "rgba(59, 130, 246, 1)"
                    : "rgba(255, 255, 255, 0.2)",
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Skip Button */}
        <AnimatePresence>
          {showSkip && stage !== "reveal" && (
            <motion.button
              className="absolute bottom-10 right-10 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl border border-white/20 text-white text-sm font-medium transition-colors shadow-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={handleSkip}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Skip Animation
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}