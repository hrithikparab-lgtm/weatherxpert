import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Cloud, Sun, Zap, Wind, Building2, Factory } from "lucide-react";
import { useTheme } from "next-themes";
const tataPowerLogoLight = "/tata-power-logo-light.png";
const tataPowerLogoDark = "/tata-power-logo-dark.png";

interface Utility {
  id: string;
  name: string;
  type: "Distribution" | "Renewable" | "Generation";
  region: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const utilities: Utility[] = [
  {
    id: "mumbai",
    name: "Mumbai Distribution",
    type: "Distribution",
    region: "Maharashtra",
    description: "Urban power distribution network with real-time weather monitoring for operational efficiency",
    icon: <Building2 className="w-12 h-12" />,
    color: "#2563EB"
  },
  {
    id: "delhi",
    name: "Delhi Distribution",
    type: "Distribution",
    region: "Delhi NCR",
    description: "Metropolitan grid operations with advanced climate intelligence for demand forecasting",
    icon: <Building2 className="w-12 h-12" />,
    color: "#7C3AED"
  },
  {
    id: "gujarat-wind",
    name: "Renewables - Wind",
    type: "Renewable",
    region: "Gujarat",
    description: "Wind farm asset performance analytics with precision wind speed forecasting",
    icon: <Wind className="w-12 h-12" />,
    color: "#059669"
  },
  {
    id: "karnataka-solar",
    name: "Renewables - Solar",
    type: "Renewable",
    region: "Karnataka",
    description: "Solar generation forecasting with cloud cover tracking and irradiance analysis",
    icon: <Sun className="w-12 h-12" />,
    color: "#F59E0B"
  },
  {
    id: "rajasthan",
    name: "Mundra UMPP",
    type: "Generation",
    region: "Gujarat",
    description: "Thermal power plant weather insights for operational planning and safety",
    icon: <Factory className="w-12 h-12" />,
    color: "#DC2626"
  },
  {
    id: "maithon",
    name: "Maithon Power",
    type: "Generation",
    region: "Jharkhand",
    description: "Coal-based generation facility with severe weather alerts and capacity planning",
    icon: <Zap className="w-12 h-12" />,
    color: "#EA580C"
  }
];

interface LandingPageProps {
  onSelectUtility: (utilityId: string) => void;
}

export function LandingPage({ onSelectUtility }: LandingPageProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which logo to show
  const currentTheme = mounted ? (resolvedTheme || theme) : 'light';
  const logoSrc = currentTheme === 'dark' ? tataPowerLogoDark : tataPowerLogoLight;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle gradient orbs */}
        <motion.div
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Floating cloud/weather icons */}
        <motion.div
          className="absolute top-[20%] left-[10%] text-blue-300/20 dark:text-blue-400/10"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Cloud className="w-24 h-24" />
        </motion.div>
        <motion.div
          className="absolute top-[60%] right-[15%] text-amber-300/20 dark:text-amber-400/10"
          animate={{
            y: [0, 15, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sun className="w-20 h-20" />
        </motion.div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Logo & Name */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 flex items-center justify-center">
                <img 
                  src={logoSrc} 
                  alt="TATA Power" 
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">WeatherXpert</span>
                <span className="text-xs text-slate-600 dark:text-slate-400">Enterprise Platform</span>
              </div>
            </div>
          </div>

          {/* Right: Links */}
          <div className="hidden md:flex items-center gap-6">
            <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              About
            </button>
            <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              Contact IT Support
            </button>
            <span className="text-xs text-slate-400 dark:text-slate-500">v2.1.0</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6 tracking-tight">
            Centralized Weather
            <span className="block bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent text-[60px] leading-tight pb-1">
              Intelligence Platform
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Select your utility to access your weather dashboard.
          </p>
        </motion.div>

        {/* Utility Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {utilities.map((utility, index) => (
            <motion.button
              key={utility.id}
              className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectUtility(utility.id)}
              onMouseEnter={() => setHoveredCard(utility.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Hover glow effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at center, ${utility.color}15, transparent 70%)`
                }}
              />

              {/* Card Content */}
              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  className="mb-6 transition-colors duration-300"
                  style={{
                    color: hoveredCard === utility.id ? utility.color : undefined
                  }}
                  animate={{
                    scale: hoveredCard === utility.id ? 1.1 : 1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {utility.icon}
                </motion.div>

                {/* Utility Name */}
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {utility.name}
                </h3>

                {/* Type & Region Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {utility.type}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    📍 {utility.region}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {utility.description}
                </p>

                {/* Action Button */}
                <motion.div
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{
                    color: hoveredCard === utility.id ? utility.color : undefined
                  }}
                  initial={{ opacity: 0.7 }}
                  animate={{
                    opacity: hoveredCard === utility.id ? 1 : 0.7
                  }}
                >
                  <span>Access Dashboard</span>
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    animate={{
                      x: hoveredCard === utility.id ? 4 : 0
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </motion.svg>
                </motion.div>
              </div>

              {/* Subtle corner accent */}
              <div 
                className="absolute top-0 right-0 w-20 h-20 rounded-tr-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at top right, ${utility.color}, transparent)`
                }}
              />
            </motion.button>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-6">
              <button className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Privacy Policy
              </button>
              <button className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                IT Support: support@tatapower.com
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span>© 2026 Tata Power</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-slate-400 dark:text-slate-500">System v2.1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}