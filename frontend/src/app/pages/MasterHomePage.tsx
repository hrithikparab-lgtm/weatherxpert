import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRole } from "../components/RoleContext";
import { toast } from "sonner";
import { WindTurbineVisual } from "../components/dashboard/WindTurbineVisual";
import { AlertDetailDrawer } from "../components/AlertDetailDrawer";
const windmillBg = "/windmill-bg.png";
import {
  Zap,
  Sun,
  Wind,
  Building2,
  Factory,
  Flame,
  ArrowUpRight,
  AlertTriangle,
  Users,
  Server,
  Globe,
  BarChart3,
  CloudLightning,
  Activity,
  Target,
  CheckCircle2,
  MoreHorizontal,
  ChevronRight,
  AlertCircle,
  BrainCircuit,
  Sparkles,
  Search,
  X,
  Clock,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  Star,
  Eye,
  Filter,
  ArrowUpDown,
  Download,
  Grid3x3,
  List,
  Check,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";

/* ═══════════════════════════════════════════════════
   MASTER HOME — Executive Command Center
   High-Fidelity "Windment" Aesthetic + Full Data
   ═══════════════════════════════════════════════════ */

interface MasterHomePageProps {
  onSelectUtility: (utility: string) => void;
  selectedLocation?: string;
  activeUtility: string; // User's selected utility from landing page
}

// ── Rich utility metadata ──
interface UtilityMeta {
  name: string;
  shortName: string;
  description: string;
  icon: React.ElementType;
  color: string;
  region: string;
  status: "online" | "degraded" | "offline";
  accessLevel: "Admin" | "Read-only" | "Full Access";
  activeAlerts: number;
  stations: number;
  temp: number;
  humidity: number;
  riskScore: number;
  forecastAccuracy: number;
  dataFreshness: string;
  capacityMW: number;
}

// ── Location data for each utility ──
interface LocationData {
  id: string;
  name: string;
  region: string;
  temp: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  riskScore: number;
  status: "online" | "degraded" | "offline";
  lastUpdated: string;
  alerts: number;
  windPowerMW?: number;
  solarPowerMW?: number;
}

const UTILITY_LOCATIONS: Record<string, LocationData[]> = {
  "Mumbai Distribution": [
    {
      id: "mum-1",
      name: "Andheri Substation",
      region: "Western Mumbai",
      temp: 33,
      humidity: 85,
      windSpeed: 12,
      pressure: 1012,
      riskScore: 68,
      status: "online",
      lastUpdated: "2 min ago",
      alerts: 1,
      windPowerMW: 15,
      solarPowerMW: 8,
    },
    {
      id: "mum-2",
      name: "Bandra Distribution Hub",
      region: "Central Mumbai",
      temp: 34,
      humidity: 82,
      windSpeed: 15,
      pressure: 1011,
      riskScore: 72,
      status: "online",
      lastUpdated: "3 min ago",
      alerts: 0,
      windPowerMW: 18,
      solarPowerMW: 12,
    },
    {
      id: "mum-3",
      name: "Colaba Power Station",
      region: "South Mumbai",
      temp: 32,
      humidity: 88,
      windSpeed: 18,
      pressure: 1010,
      riskScore: 75,
      status: "degraded",
      lastUpdated: "5 min ago",
      alerts: 2,
      windPowerMW: 22,
      solarPowerMW: 5,
    },
    {
      id: "mum-4",
      name: "Powai Grid Center",
      region: "Eastern Mumbai",
      temp: 35,
      humidity: 80,
      windSpeed: 10,
      pressure: 1013,
      riskScore: 65,
      status: "online",
      lastUpdated: "1 min ago",
      alerts: 0,
      windPowerMW: 12,
      solarPowerMW: 10,
    },
  ],
  "Delhi Distribution": [
    {
      id: "del-1",
      name: "Dwarka Sector 21",
      region: "West Delhi",
      temp: 45,
      humidity: 25,
      windSpeed: 8,
      pressure: 1008,
      riskScore: 88,
      status: "online",
      lastUpdated: "4 min ago",
      alerts: 1,
      windPowerMW: 10,
      solarPowerMW: 25,
    },
    {
      id: "del-2",
      name: "Rohini Hub",
      region: "North Delhi",
      temp: 44,
      humidity: 28,
      windSpeed: 10,
      pressure: 1009,
      riskScore: 85,
      status: "online",
      lastUpdated: "5 min ago",
      alerts: 0,
      windPowerMW: 12,
      solarPowerMW: 30,
    },
    {
      id: "del-3",
      name: "Connaught Place Center",
      region: "Central Delhi",
      temp: 43,
      humidity: 30,
      windSpeed: 6,
      pressure: 1010,
      riskScore: 82,
      status: "online",
      lastUpdated: "3 min ago",
      alerts: 0,
      windPowerMW: 8,
      solarPowerMW: 18,
    },
  ],
  "Renewables - Solar": [
    {
      id: "sol-1",
      name: "Charanka Solar Park",
      region: "North Gujarat",
      temp: 41,
      humidity: 18,
      windSpeed: 5,
      pressure: 1011,
      riskScore: 32,
      status: "online",
      lastUpdated: "1 min ago",
      alerts: 0,
      windPowerMW: 0,
      solarPowerMW: 285,
    },
    {
      id: "sol-2",
      name: "Dholera Solar Zone",
      region: "South Gujarat",
      temp: 40,
      humidity: 20,
      windSpeed: 7,
      pressure: 1012,
      riskScore: 35,
      status: "online",
      lastUpdated: "1 min ago",
      alerts: 0,
      windPowerMW: 0,
      solarPowerMW: 320,
    },
    {
      id: "sol-3",
      name: "Raghanesda Solar Farm",
      region: "Central Gujarat",
      temp: 39,
      humidity: 22,
      windSpeed: 6,
      pressure: 1011,
      riskScore: 38,
      status: "online",
      lastUpdated: "2 min ago",
      alerts: 0,
      windPowerMW: 0,
      solarPowerMW: 195,
    },
  ],
  "Renewables - Wind": [
    {
      id: "wnd-1",
      name: "Muppandal Wind Farm",
      region: "Kanyakumari District",
      temp: 31,
      humidity: 78,
      windSpeed: 42,
      pressure: 1009,
      riskScore: 62,
      status: "degraded",
      lastUpdated: "8 min ago",
      alerts: 1,
      windPowerMW: 385,
      solarPowerMW: 0,
    },
    {
      id: "wnd-2",
      name: "Kayathar Wind Park",
      region: "Thoothukudi District",
      temp: 33,
      humidity: 72,
      windSpeed: 38,
      pressure: 1010,
      riskScore: 55,
      status: "online",
      lastUpdated: "6 min ago",
      alerts: 1,
      windPowerMW: 420,
      solarPowerMW: 0,
    },
    {
      id: "wnd-3",
      name: "Aralvaimozhi Wind Corridor",
      region: "Tamil Nadu Coast",
      temp: 32,
      humidity: 75,
      windSpeed: 45,
      pressure: 1008,
      riskScore: 58,
      status: "degraded",
      lastUpdated: "10 min ago",
      alerts: 0,
      windPowerMW: 495,
      solarPowerMW: 0,
    },
  ],
  "Mundra UMPP": [
    {
      id: "mun-1",
      name: "Unit 1-2 Complex",
      region: "Mundra Port Zone",
      temp: 37,
      humidity: 52,
      windSpeed: 14,
      pressure: 1012,
      riskScore: 40,
      status: "online",
      lastUpdated: "2 min ago",
      alerts: 0,
      windPowerMW: 18,
      solarPowerMW: 45,
    },
    {
      id: "mun-2",
      name: "Unit 3-4 Complex",
      region: "Mundra Industrial Area",
      temp: 36,
      humidity: 55,
      windSpeed: 12,
      pressure: 1013,
      riskScore: 42,
      status: "online",
      lastUpdated: "3 min ago",
      alerts: 1,
      windPowerMW: 15,
      solarPowerMW: 52,
    },
    {
      id: "mun-3",
      name: "Unit 5 Station",
      region: "Mundra SEZ",
      temp: 35,
      humidity: 58,
      windSpeed: 15,
      pressure: 1011,
      riskScore: 44,
      status: "online",
      lastUpdated: "4 min ago",
      alerts: 0,
      windPowerMW: 20,
      solarPowerMW: 38,
    },
  ],
  "Maithon Power": [
    {
      id: "mth-1",
      name: "Main Thermal Unit A",
      region: "Maithon Township",
      temp: 32,
      humidity: 80,
      windSpeed: 8,
      pressure: 1010,
      riskScore: 25,
      status: "online",
      lastUpdated: "1 min ago",
      alerts: 0,
      windPowerMW: 10,
      solarPowerMW: 22,
    },
    {
      id: "mth-2",
      name: "Main Thermal Unit B",
      region: "Dhanbad Region",
      temp: 33,
      humidity: 78,
      windSpeed: 10,
      pressure: 1009,
      riskScore: 28,
      status: "online",
      lastUpdated: "1 min ago",
      alerts: 0,
      windPowerMW: 12,
      solarPowerMW: 28,
    },
    {
      id: "mth-3",
      name: "Auxiliary Grid Station",
      region: "Jharkhand Industrial Belt",
      temp: 34,
      humidity: 76,
      windSpeed: 7,
      pressure: 1011,
      riskScore: 30,
      status: "online",
      lastUpdated: "2 min ago",
      alerts: 0,
      windPowerMW: 8,
      solarPowerMW: 18,
    },
  ],
};

const UTILITY_META: UtilityMeta[] = [
  {
    name: "Mumbai Distribution",
    shortName: "MUM",
    description: "Power distribution network across the Mumbai Metropolitan Region.",
    icon: Building2,
    color: "blue",
    region: "Maharashtra",
    status: "online",
    accessLevel: "Full Access",
    activeAlerts: 3,
    stations: 48,
    temp: 34,
    humidity: 82,
    riskScore: 72,
    forecastAccuracy: 94,
    dataFreshness: "2 min ago",
    capacityMW: 1850,
  },
  {
    name: "Delhi Distribution",
    shortName: "DEL",
    description: "North Delhi power distribution covering residential zones.",
    icon: Zap,
    color: "violet",
    region: "Delhi NCR",
    status: "online",
    accessLevel: "Admin",
    activeAlerts: 1,
    stations: 36,
    temp: 44,
    humidity: 28,
    riskScore: 85,
    forecastAccuracy: 91,
    dataFreshness: "5 min ago",
    capacityMW: 2200,
  },
  {
    name: "Renewables - Solar",
    shortName: "SOL",
    description: "Solar PV farms and rooftop installations.",
    icon: Sun,
    color: "amber",
    region: "Gujarat",
    status: "online",
    accessLevel: "Full Access",
    activeAlerts: 0,
    stations: 22,
    temp: 40,
    humidity: 20,
    riskScore: 35,
    forecastAccuracy: 97,
    dataFreshness: "1 min ago",
    capacityMW: 650,
  },
  {
    name: "Renewables - Wind",
    shortName: "WND",
    description: "Wind energy assets along the western coast.",
    icon: Wind,
    color: "teal",
    region: "Tamil Nadu",
    status: "degraded",
    accessLevel: "Admin",
    activeAlerts: 2,
    stations: 18,
    temp: 32,
    humidity: 75,
    riskScore: 58,
    forecastAccuracy: 88,
    dataFreshness: "8 min ago",
    capacityMW: 420,
  },
  {
    name: "Mundra UMPP",
    shortName: "MUN",
    description: "4,000 MW ultra mega thermal power plant.",
    icon: Factory,
    color: "rose",
    region: "Gujarat",
    status: "online",
    accessLevel: "Read-only",
    activeAlerts: 1,
    stations: 12,
    temp: 36,
    humidity: 55,
    riskScore: 42,
    forecastAccuracy: 93,
    dataFreshness: "3 min ago",
    capacityMW: 4000,
  },
  {
    name: "Maithon Power",
    shortName: "MTH",
    description: "1,050 MW pit-head thermal plant in Jharkhand.",
    icon: Flame,
    color: "orange",
    region: "Jharkhand",
    status: "online",
    accessLevel: "Admin",
    activeAlerts: 0,
    stations: 8,
    temp: 33,
    humidity: 78,
    riskScore: 28,
    forecastAccuracy: 95,
    dataFreshness: "1 min ago",
    capacityMW: 1050,
  },
];

// ── Global alerts ──
const GLOBAL_ALERTS = [
  {
    id: "ga-1", severity: "critical" as const,
    title: "Cyclone Warning",
    utility: "Mumbai Distribution", time: "12 min ago",
  },
  {
    id: "ga-2", severity: "warning" as const,
    title: "Grid Freq Deviation",
    utility: "Delhi Distribution", time: "34 min ago",
  },
  {
    id: "ga-3", severity: "warning" as const,
    title: "Wind Curtailment",
    utility: "Renewables - Wind", time: "1h ago",
  },
];

// ── AI Daily Briefing ──
const AI_BRIEFING = {
  generated: "11 Feb 2026 · 06:00 IST",
  confidence: 92,
  summary: "Overall weather risk is ELEVATED. Cyclone MAHA tracking toward coastal Gujarat poses the highest threat to Mumbai Distribution. Delhi faces extreme heat (44°C+). Solar generation across Rajasthan will be optimal.",
  keyMetrics: [
    { label: "Overall Risk", value: "ELEVATED", color: "text-amber-500" },
    { label: "Confidence", value: "92%", color: "text-emerald-500" },
  ],
};

// ─ Risk Trend Data (Mock) ──
const RISK_TREND = Array.from({ length: 12 }, (_, i) => ({
  time: `${i * 2}:00`,
  risk: Math.round(30 + 40 * Math.sin(((i) / 6) * Math.PI)),
  alerts: Math.floor(Math.random() * 5),
}));

/* ═══════════════════════════════════════════════════
   CRAZY ANIMATIONS - OPTION 1 + 2 COMBO
   ═══════════════════════════════════════════════════ */

// ── Location-based Renewable Energy Data ──
const RENEWABLE_ENERGY_DATA: Record<string, { wind: number; solar: number }> = {
  "All Utilities": { wind: 450, solar: 520 },
  "All Renewable Assets": { wind: 450, solar: 520 },
  "Mumbai Distribution": { wind: 420, solar: 650 },
  "Gujarat — Wind Farm Cluster": { wind: 520, solar: 340 },
  "Rajasthan — Solar Array Network": { wind: 180, solar: 850 },
  "Maharashtra — Renewable Hub": { wind: 420, solar: 650 },
  "Tamil Nadu — Wind Corridor": { wind: 680, solar: 290 },
  "Karnataka — Solar + Wind Hybrid": { wind: 410, solar: 590 },
  "Andhra Pradesh — Coastal Wind Zone": { wind: 740, solar: 220 },
  "Madhya Pradesh — Solar Belt": { wind: 150, solar: 920 },
  "Delhi NCR — Grid Operations": { wind: 200, solar: 380 },
  "Gujarat — Mundra Power Complex": { wind: 180, solar: 220 },
  "Jharkhand — Maithon Generation": { wind: 140, solar: 190 },
};

// Hook for animating number counters
function useCounter(end: number, duration: number = 1.5) {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
}

// Floating Particles Component
// Uses absolute positioning so particles live inside the page container
// (avoids z-index conflict with fixed stacking context)
function FloatingParticles() {
  const particles = Array.from({ length: 20 });
  
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
          initial={{ 
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1920),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1080),
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1080)],
            x: [null, Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1920)],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// 3D Tilt Card Wrapper
function TiltCard({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const [rotateX, setRotateX] = React.useState(0);
  const [rotateY, setRotateY] = React.useState(0);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={className}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// Cursor Spotlight Effect — stays fixed (cursor-tracking is inherently viewport-relative)
function CursorSpotlight() {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed z-[100] h-96 w-96 rounded-full opacity-0 blur-[100px] transition-opacity duration-500 hover:opacity-100"
      style={{
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
        left: mousePosition.x - 192,
        top: mousePosition.y - 192,
      }}
      animate={{
        x: 0,
        y: 0,
      }}
    />
  );
}

export function MasterHomePage({ onSelectUtility, selectedLocation: externalLocation, activeUtility }: MasterHomePageProps) {
  const { user } = useRole();
  const [showError, setShowError] = React.useState(false);
  const [apiStatus, setApiStatus] = React.useState<"operational" | "degraded" | "outage">("operational");
  const [lastSync, setLastSync] = React.useState(new Date());
  
  // State to manage accordion open/close for utilities — default ALL collapsed; expand on click
  const [expandedUtilities, setExpandedUtilities] = React.useState<Record<string, boolean>>({});
  
  // Use activeUtility from context (selected on landing page) instead of local state
  const selectedUtility = activeUtility;
  
  // Location state for Renewable Energy Mix (controlled by header dropdown)
  const selectedLocation = externalLocation || "All Renewable Assets";
  
  // Get renewable energy values based on selected location
  const renewableData = RENEWABLE_ENERGY_DATA[selectedLocation] || RENEWABLE_ENERGY_DATA["All Renewable Assets"];
  
  // Number counters for hero cards (animated based on location)
  const windPower = useCounter(renewableData.wind, 1.5);
  const solarPower = useCounter(renewableData.solar, 1.5);
  
  // Alert detail drawer state
  const [selectedAlert, setSelectedAlert] = React.useState<typeof GLOBAL_ALERTS[0] | null>(null);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = React.useState(false);

  // Convert GLOBAL_ALERTS format to AlertDetail format
  const convertToAlertDetail = (alert: typeof GLOBAL_ALERTS[0]) => {
    return {
      id: alert.id,
      title: alert.title,
      utility: alert.utility,
      provider: "IMD", // Default provider
      severity: alert.severity === "warning" ? ("high" as const) : ("critical" as const),
      status: "Predicted",
      location: alert.utility,
      receivedTime: alert.time,
      basedOn: alert.title,
      forecastedConditions: [
        { parameter: "Wind Speed", value: "85 km/h" },
        { parameter: "Rainfall", value: "120 mm/hr" },
      ],
      startTime: "Starts in 45 minutes at 3:00 PM GMT+2 3/26/26",
      locationTime: "6:30 PM GMT+5:30 3/26/26",
      predictedValue: "85 km/h",
      thresholdValue: "60 km/h",
      isInternal: false,
    };
  };

  const handleAlertDrawerClose = () => {
    setIsAlertDrawerOpen(false);
    setTimeout(() => setSelectedAlert(null), 300);
  };

  // Get locations for the currently selected utility
  const utilityLocations = UTILITY_LOCATIONS[activeUtility] || [];
  
  // Calculate wind/solar power based on first location
  const getPulseCardPowerData = () => {
    const firstLocation = utilityLocations[0];
    return {
      wind: firstLocation?.windPowerMW || 0,
      solar: firstLocation?.solarPowerMW || 0,
      locationName: firstLocation?.name || "",
    };
  };

  const pulseCardPowerData = getPulseCardPowerData();
  const pulseWindPower = useCounter(pulseCardPowerData.wind, 1.5);
  const pulseSolarPower = useCounter(pulseCardPowerData.solar, 1.5);

  // Mock recently accessed utilities
  const recentlyAccessedIds = [0, 1, 2];
  const recentlyAccessed = UTILITY_META.filter((_, idx) => recentlyAccessedIds.includes(idx));

  // ═══ Location to Utility Mapping ═══
  const LOCATION_TO_UTILITY_MAP: Record<string, string | "all"> = {
    "All Utilities": "all",
    "Mumbai Distribution": "Mumbai Distribution",
    "Gujarat — Wind Farm Cluster": "Renewables - Wind",
    "Rajasthan — Solar Array Network": "Renewables - Solar",
    "Maharashtra — Renewable Hub": "Mumbai Distribution",
    "Tamil Nadu — Wind Corridor": "Renewables - Wind",
    "Karnataka — Solar + Wind Hybrid": "Renewables - Solar",
    "Andhra Pradesh — Coastal Wind Zone": "Renewables - Wind",
    "Madhya Pradesh — Solar Belt": "Renewables - Solar",
  };

  // ═══ Filter Utilities Based on Selected Location ═══
  const getDisplayUtilities = (): UtilityMeta[] => {
    const mappedUtility = LOCATION_TO_UTILITY_MAP[selectedLocation];
    
    if (mappedUtility === "all") {
      return UTILITY_META;
    } else if (mappedUtility) {
      const utility = UTILITY_META.find(u => u.name === mappedUtility);
      return utility ? [utility] : [];
    }
    
    return UTILITY_META;
  };

  const displayUtilities = getDisplayUtilities();

  // Calculate time since last sync
  const getTimeSinceSync = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSync.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  // Simulate data refresh
  const handleRefresh = () => {
    setLastSync(new Date());
    toast.success("Data refreshed successfully");
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.2,
      } 
    }
  };

  const itemVariants = {
    hidden: { 
      y: 60, 
      opacity: 0,
      scale: 0.9,
      rotateX: -15,
    },
    visible: { 
      y: 0, 
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        mass: 0.8,
      } 
    }
  };

  const heroVariants = {
    hidden: { 
      scale: 0.8, 
      opacity: 0,
      filter: "blur(20px)",
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 150, 
        damping: 15,
        delay: 0.3,
      } 
    }
  };

  return (
    /* ── Page wrapper:
       - NO overflow-hidden so absolute background orbs aren't clipped
       - relative so absolute children (orbs, particles) are positioned within this container
       - bg-[#f8fafc] provides base background; orbs at z-0 render ABOVE this tint
         because they are absolute children, painted after the parent background
    ── */
    <div className="w-full min-h-full bg-[#f8fafc] dark:bg-[#020617] p-4 sm:p-6 lg:p-8 font-sans relative">
      {/* ── iOS-Inspired Premium Gradient Background (absolute, z-0) ── */}
      {/* Changed from fixed→absolute so orbs render inside the page stacking context,
          ABOVE the bg-[#f8fafc] background, making glassmorphism cards visible */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full filter blur-[120px] opacity-60 dark:opacity-40"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(147,197,253,0) 70%)" }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full filter blur-[120px] opacity-50 dark:opacity-30"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.6) 0%, rgba(196,181,253,0) 70%)" }}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full filter blur-[100px] opacity-40 dark:opacity-20"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.5) 0%, rgba(110,231,183,0) 70%)" }}
          animate={{
            x: [0, -50, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle grid overlay for texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
      </div>
    
      {/* Floating Particles Background (absolute) */}
      <FloatingParticles />
      
      {/* Cursor Spotlight Effect (fixed — intentionally viewport-relative for cursor tracking) */}
      <CursorSpotlight />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1600px] mx-auto space-y-6 relative z-10"
      >
        {/* ═══ Header Section ═══ */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <motion.div 
              className="flex items-center gap-3 mb-2"
              initial={{ scale: 0.5, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
            >
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white relative">
                Command Center
                <motion.span
                  className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-violet-600/20 blur-xl -z-10"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </h1>
            </motion.div>
            <motion.p 
              className="text-slate-500 dark:text-slate-400 font-medium ml-1 flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              Welcome back, {user?.name?.split(" ")[0]} 
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
            </motion.p>
          </div>

        </motion.div>

        {/* ═══ Visual Hero Row - SPLIT SCREEN: RENEWABLE ENERGY MIX & GLOBAL ALERTS ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-auto lg:h-[400px]">
          
          {/* 1. The Windment (Visual Anchor) - 3D TILT */}
          <TiltCard 
            className="relative bg-gradient-to-br from-blue-900 to-indigo-950 rounded-[24px] lg:rounded-[32px] overflow-hidden text-white shadow-2xl shadow-blue-900/20 group cursor-pointer min-h-[380px] lg:min-h-0"
            onClick={() => onSelectUtility("Renewables - Wind")}
          >
            <motion.div variants={heroVariants} className="h-full min-h-[380px] lg:min-h-0">
              {/* Windmill Background */}
              <div className="absolute inset-0 z-0">
                 <img
                   src={windmillBg}
                   alt="Wind Turbines Energy Farm"
                   className="w-full h-full object-cover"
                 />
              </div>
              <div className="relative z-10 p-5 sm:p-6 lg:p-8 h-full flex flex-col justify-between pointer-events-none overflow-visible">
                {/* Enhanced Dark Gradient Overlay */}
                <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
                
                {/* Top Section - Live Badge */}
                <div className="relative z-10 flex justify-between items-start">
                  <motion.div 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-xl text-sm font-semibold border border-white/20 shadow-lg"
                    animate={{
                      boxShadow: [
                        "0 0 15px rgba(52, 211, 153, 0.4)",
                        "0 0 25px rgba(52, 211, 153, 0.7)",
                        "0 0 15px rgba(52, 211, 153, 0.4)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Activity className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                    <span className="text-white/90">Live System Pulse</span>
                  </motion.div>
                </div>
                
                {/* Bottom Section - Energy Output */}
                <div className="relative z-10 space-y-5">
                  {/* Title */}
                  <div>
                    <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                      <span className="bg-gradient-to-r from-blue-200 via-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg">
                        Energy Output
                      </span>
                    </h2>
                    <p className="text-sm text-white/60 mt-2 font-medium">Real-time renewable generation</p>
                  </div>
                  
                  {/* Energy Cards Grid */}
                  <div className="flex gap-3">
                     {/* Wind Card */}
                     <motion.div 
                       whileHover={{ y: -4, scale: 1.02 }}
                       className="flex-1 bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-[20px] p-5 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all cursor-pointer pointer-events-auto group/card"
                     >
                        <div className="flex items-center gap-2.5 mb-3">
                           <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center backdrop-blur-sm">
                             <Wind className="w-4 h-4 text-cyan-300" />
                           </div>
                           <span className="text-sm font-bold text-cyan-200">Wind</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-4xl font-black text-white tracking-tight">{pulseWindPower}</p>
                          <span className="text-sm font-semibold text-white/60">MW</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/50">Capacity</span>
                            <span className="text-cyan-300 font-semibold">Active</span>
                          </div>
                        </div>
                     </motion.div>
                     
                     {/* Solar Card */}
                     <motion.div 
                       whileHover={{ y: -4, scale: 1.02 }}
                       className="flex-1 bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-[20px] p-5 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all cursor-pointer pointer-events-auto group/card"
                     >
                        <div className="flex items-center gap-2.5 mb-3">
                           <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center backdrop-blur-sm">
                             <Sun className="w-4 h-4 text-amber-300" />
                           </div>
                           <span className="text-sm font-bold text-amber-200">Solar</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-4xl font-black text-white tracking-tight">{pulseSolarPower}</p>
                          <span className="text-sm font-semibold text-white/60">MW</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/50">Capacity</span>
                            <span className="text-amber-300 font-semibold">Active</span>
                          </div>
                        </div>
                     </motion.div>
                  </div>
                  
                  {/* Data Source Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Database className="w-3.5 h-3.5" />
                      <span className="font-medium">Weather provider forecast data</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-semibold text-emerald-300">Updated live</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TiltCard>

          {/* RIGHT: Global Alerts - Updated: Side sheet removed */}
          <TiltCard className="relative bg-white/60 dark:bg-[#1a1f2e]/60 backdrop-blur-[40px] rounded-[24px] lg:rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/80 dark:border-white/10 group cursor-default min-h-[380px] lg:min-h-0">
            <motion.div 
              variants={heroVariants} 
              className="h-full min-h-[380px] lg:min-h-0 flex flex-col p-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                 <h3 className="font-bold text-base lg:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-amber-500" />
                    Global Alerts
                 </h3>
                 <span className="text-[10px] lg:text-xs font-bold bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-[10px] whitespace-nowrap shadow-sm">
                    {GLOBAL_ALERTS.length} New
                 </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 lg:space-y-3 pr-2 custom-scrollbar">
                 {GLOBAL_ALERTS.map((alert) => (
                    <motion.div
                       key={alert.id}
                       onClick={() => {
                         setSelectedAlert(alert);
                         setIsAlertDrawerOpen(true);
                       }}
                       whileHover={{ scale: 1.02, x: 4 }}
                       className="p-4 rounded-[20px] bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/60 dark:border-white/10 cursor-pointer hover:border-red-300 dark:hover:border-red-900/50 hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-all group pointer-events-auto shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-[0_2px_10px_rgb(0,0,0,0.1)]"
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                             alert.severity === "critical" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/50" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          }`}>
                             {alert.severity}
                          </span>
                          <span className="text-[10px] text-slate-400">{alert.time}</span>
                       </div>
                       <div className="flex items-start gap-2">
                          <div>
                             <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1 group-hover:text-red-700 dark:group-hover:text-red-300">{alert.title}</h4>
                             <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> {alert.utility}
                             </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
                       </div>
                    </motion.div>
                 ))}
              </div>
            </motion.div>
          </TiltCard>
        </div>

        {/* ═══ Utility Details Section ═══ */}
        <div>
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white">
               {selectedLocation === "All Utilities" ? "All Utilities Overview" : selectedLocation}
             </h2>
             <button
               onClick={handleRefresh}
               className="p-2 bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/60 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 rounded-[12px] transition-all group shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
               title="Refresh data"
             >
               <RefreshCw className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:rotate-180 transition-all duration-500" />
             </button>
          </div>
           
          {/* Error State */}
          {showError ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 dark:bg-red-900/10 backdrop-blur-xl border border-red-500/20 dark:border-red-800 rounded-[32px] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">Failed to Load Utilities</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-6 max-w-md mx-auto">
                Unable to fetch utility data from the server. This could be due to network issues or service disruption.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button 
                  onClick={() => setShowError(false)}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  Retry Connection
                </button>
                <button 
                  onClick={() => toast.info("Loading cached data...")}
                  className="px-6 py-3 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Use Cached Data
                </button>
              </div>
            </motion.div>
          ) : (
            /* ── Utility Grid
               BUG FIXES applied here:
               1. Removed `h-full` from card wrapper — lets card size to content
               2. Removed `h-full` from inner card div — avoids circular height in auto-height grid
               3. Removed `flex-1 overflow-y-auto` from locations section — accordion
                  now PUSHES card height instead of scrolling inside a constrained box
               4. Removed `mt-auto` from footer — no longer needed without flex-1
            ── */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayUtilities.map((utility, index) => {
                const colors = {
                  blue: "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                  violet: "bg-violet-50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800",
                  amber: "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
                  teal: "bg-teal-50 dark:bg-teal-900/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800",
                  rose: "bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
                  orange: "bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
                }[utility.color] || "bg-slate-50 text-slate-600 border-slate-200 dark:border-slate-800";

                return (
                  <motion.div
                    key={utility.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col"
                  >
                    {/* Glassmorphism Utility Card
                        - overflow-hidden preserves rounded corners
                        - NO h-full: card sizes to its content naturally
                        - flex-col allows footer to sit at the bottom  */}
                    <div className="bg-white/60 dark:bg-[#1a1f2e]/60 backdrop-blur-[40px] rounded-2xl lg:rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/80 dark:border-white/10 flex flex-col overflow-hidden relative">
                      {/* Header Section */}
                      <div className="p-5 border-b border-black/5 dark:border-white/10">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={`p-3 rounded-2xl flex-shrink-0 ${colors}`}>
                              <utility.icon className="w-8 h-8" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5 truncate">{utility.name}</h3>
                              <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                {utility.region}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className={`w-2.5 h-2.5 rounded-full ${utility.status === "online" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : utility.status === "degraded" ? "bg-amber-500" : "bg-red-500"}`} />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">{utility.status}</span>
                          </div>
                        </div>

                        {/* Key Metrics Grid - Glassmorphism 2×2 */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 uppercase tracking-wider">Temp</p>
                            <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{utility.temp}°C</p>
                          </div>
                          <div className="p-3 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 uppercase tracking-wider">Risk</p>
                            <p className={`text-xl font-bold ${utility.riskScore > 70 ? "text-red-500" : utility.riskScore > 40 ? "text-amber-500" : "text-emerald-500"}`}>
                              {utility.riskScore}
                            </p>
                          </div>
                          <div className="p-3 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 uppercase tracking-wider">Capacity</p>
                            <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{utility.capacityMW} MW</p>
                          </div>
                          <div className="p-3 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 uppercase tracking-wider">Accuracy</p>
                            <p className="text-xl font-bold text-emerald-500">{utility.forecastAccuracy}%</p>
                          </div>
                        </div>
                      </div>

                      {/* ── Locations Section — Interactive Accordion ──
                          The accordion expands/collapses using AnimatePresence + Motion height animation.
                          No overflow-y-auto here: expansion PUSHES the card height (natural layout).
                          Default state: ALL open so locations are immediately visible.       */}
                      <div className="p-5">
                        <div 
                          className="flex items-center justify-between mb-4 cursor-pointer group"
                          onClick={() => setExpandedUtilities(prev => ({ ...prev, [utility.name]: !prev[utility.name] }))}
                        >
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-blue-500 transition-colors">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            Locations
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <Database className="w-3 h-3" />
                            <span>{UTILITY_LOCATIONS[utility.name]?.length || 0}</span>
                            <motion.div
                              animate={{ rotate: expandedUtilities[utility.name] ? 180 : 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                            >
                              <ChevronDown className={`w-4 h-4 ml-1 ${expandedUtilities[utility.name] ? "text-blue-500" : ""}`} />
                            </motion.div>
                          </div>
                        </div>
                        
                        <AnimatePresence initial={false}>
                          {expandedUtilities[utility.name] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-3 pb-2 pt-1">
                                {UTILITY_LOCATIONS[utility.name] && UTILITY_LOCATIONS[utility.name].length > 0 ? (
                                  UTILITY_LOCATIONS[utility.name].map((location, idx) => (
                                  <motion.div
                                    key={location.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group p-3 bg-white/40 dark:bg-white/5 backdrop-blur-md hover:bg-white/60 dark:hover:bg-white/10 rounded-xl border border-white/60 dark:border-white/10 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer"
                                    whileHover={{ x: 2 }}
                                  >
                                    {/* Location Header */}
                                    <div className="flex items-center justify-between mb-2.5">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                          location.status === "online" 
                                            ? "bg-emerald-500" 
                                            : location.status === "degraded" 
                                            ? "bg-amber-500" 
                                            : "bg-red-500"
                                        }`} />
                                        <h5 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                          {location.name}
                                        </h5>
                                      </div>
                                      {location.alerts > 0 && (
                                        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-bold rounded flex-shrink-0">
                                          {location.alerts}
                                        </span>
                                      )}
                                    </div>

                                    {/* Compact Values Grid — 3 columns with glassmorphism */}
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="p-2 bg-white/60 dark:bg-black/20 rounded-lg shadow-sm border border-white/40 dark:border-white/5">
                                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 uppercase tracking-wider">Temp</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{location.temp}°C</p>
                                      </div>
                                      <div className="p-2 bg-white/60 dark:bg-black/20 rounded-lg shadow-sm border border-white/40 dark:border-white/5">
                                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 uppercase tracking-wider">Wind</p>
                                        <p className="text-sm font-bold text-teal-600 dark:text-teal-400">{location.windSpeed}</p>
                                      </div>
                                      <div className="p-2 bg-white/60 dark:bg-black/20 rounded-lg shadow-sm border border-white/40 dark:border-white/5">
                                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 uppercase tracking-wider">Risk</p>
                                        <p className={`text-sm font-bold ${
                                          location.riskScore > 70 ? "text-red-500" : location.riskScore > 40 ? "text-amber-500" : "text-emerald-500"
                                        }`}>
                                          {location.riskScore}
                                        </p>
                                      </div>
                                    </div>
                                  </motion.div>
                                  ))
                                ) : (
                                  <div className="text-center py-6 text-slate-500 bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/40 dark:border-white/10 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs">No locations</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Footer - Description & Action */}
                      <div className="p-5 border-t border-black/5 dark:border-white/10 bg-white/30 dark:bg-black/10">
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">{utility.description}</p>
                        
                        <button 
                          onClick={() => onSelectUtility(utility.name)}
                          className="w-full px-4 py-2.5 bg-blue-600/90 hover:bg-blue-600 dark:bg-blue-600/80 dark:hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 backdrop-blur-md"
                        >
                          View Dashboard
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══ Bottom Row: Alerts & Charts - HIDDEN (Now in Split-Screen Above) ═══ */}
        <div className="grid grid-cols-1 gap-6 hidden">
           
           {/* Global Alert Feed - HIDDEN */}
           <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Global Alerts
                 </h3>
                 <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg">
                    {GLOBAL_ALERTS.length} New
                 </span>
              </div>
           </motion.div>

        </div>
      </motion.div>

      {/* Alert Detail Drawer */}
      <AlertDetailDrawer 
        alert={selectedAlert ? convertToAlertDetail(selectedAlert) : null}
        isOpen={isAlertDrawerOpen}
        onClose={handleAlertDrawerClose}
        isForecast={true}
      />
    </div>
  );
}
