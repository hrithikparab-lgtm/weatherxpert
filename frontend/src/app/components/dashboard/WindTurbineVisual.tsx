import { motion } from "motion/react";

export function WindTurbineVisual() {
  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
      {/* Windmill Background Image */}
      <div className="absolute inset-0">
        <img
          src="/windmill-animated.gif"
          alt="Wind Turbines"
          className="w-full h-full object-cover opacity-90"
        />
      </div>
      
      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-transparent to-blue-950/50 mix-blend-overlay" />
      
      {/* Airflow Particles for enhanced effect */}
      <AirflowParticles />
    </div>
  );
}

function AirflowParticles() {
  // Generate random particles
  const particles = Array.from({ length: 12 });
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 bg-white/30 rounded-full"
          initial={{ 
            x: -100, 
            y: Math.random() * 300, 
            width: Math.random() * 50 + 20,
            opacity: 0 
          }}
          animate={{ 
            x: "120%", 
            opacity: [0, 0.8, 0] 
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}