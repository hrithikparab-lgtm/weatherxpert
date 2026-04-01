import React, { useState, useMemo, useRef } from "react";
import { useRole } from "../components/RoleContext";
import { useAlertManagement } from "../components/AlertManagementContext";
import { DashboardFilterBar } from "../components/dashboard/DashboardFilterBar";
import { AlertStrip } from "../components/dashboard/AlertStrip";
import { KpiCards } from "../components/dashboard/KpiCards";
import { ForecastActualChart } from "../components/dashboard/ForecastActualChart";
import { BlockwiseTable } from "../components/dashboard/BlockwiseTable";
import { PlaybackControl } from "../components/dashboard/PlaybackControl";
import { DashboardPageSkeleton } from "../components/dashboard/DashboardSkeletons";
import {
  TrendingUp,
  TrendingDown,
  Sun,
  AlertTriangle,
  Target,
  Thermometer,
  Wind,
  Droplets,
  CloudRain,
  Gauge,
  ChevronDown,
  Bell,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  Eye,
  Zap,
  Cloud,
  SunDim,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  AreaChart,
  Area,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { tooltipStyle, glassCardClass, glassGlow } from "../components/ChartGlobalDefs";
import { ForecastConfidenceGauge as FCGauge } from "../components/ForecastConfidenceGauge";
import { AlertsModal } from "../components/AlertsModal";

interface DashboardPageProps {
  selectedUtility: string;
}

// Types
type UtilityType = "Mumbai Distribution" | "Renewable" | "Solar" | "Wind" | "Hybrid";
type TimeRange = "Today" | "7 Days" | "30 Days";
type ForecastHorizon = "1 Min" | "15 Min" | "Day Ahead" | "15 Day";
type Parameter = "Wind Speed" | "Wind Direction" | "Wind Gust" | "Ambient Temperature" | "Ambient Pressure" | "Relative Humidity" | "Air Density" | "Cloud Cover" | "Rainfall" | "Precipitation" | "Dew Point Temperature";
type WeatherParameter = "All Parameters" | "Wind Speed" | "Wind Direction" | "Wind Gust" | "Ambient Temperature" | "Ambient Pressure" | "Relative Humidity" | "Air Density" | "Cloud Cover" | "Rainfall" | "Precipitation" | "Dew Point Temperature";
type Provider = "IMD" | "Tomorrow.io";

// ─── Super Admin: ALL locations across every utility (60 entries → triggers card view) ───
const ALL_SUPERADMIN_LOCATIONS: string[] = [
  // Mumbai Distribution (10)
  "Bandra Grid Station", "Kurla Distribution Center", "Andheri Substation",
  "Borivali Transformer Hub", "Colaba Control Room", "Dadar Power Station",
  "Thane Industrial Node", "Vikhroli Feeder Station", "Mulund Grid Point", "Malad Network Hub",
  // Renewable (10)
  "Jaisalmer Solar Park", "Kutch Wind Farm", "Gujarat Hybrid Plant",
  "Rajasthan Solar Zone", "Maharashtra Wind Corridor", "Tamil Nadu Renewable Hub",
  "Andhra Pradesh Solar Strip", "Karnataka Wind Network", "Telangana Solar Array", "Punjab Wind Farm",
  // Solar (10)
  "Bhadla Solar Park", "Pavagada Solar Park", "Rewa Ultra Mega Solar",
  "Kamuthi Solar Plant", "Gujarat Solar Farm", "Jodhpur Solar Hub",
  "Bikaner Mega Solar", "Chitradurga Solar Block", "Ramagundam Solar Zone", "Charanka Solar Park",
  // Wind (10)
  "Jaisalmer Wind Park", "Tamil Nadu Wind Corridor", "Gujarat Wind Zone",
  "Maharashtra Wind Belt", "Karnataka Wind Farm", "Andhra Pradesh Wind Hub",
  "Rajasthan Wind Array", "Madhya Pradesh Wind Block", "Telangana Wind Station", "Haryana Wind Farm",
  // Hybrid (10)
  "Rajasthan Hybrid Park", "Karnataka Hybrid Zone", "Andhra Pradesh Hybrid Hub",
  "Tamil Nadu Hybrid Facility", "Maharashtra Hybrid Station", "Odisha Hybrid Plant",
  "Chhattisgarh Hybrid Hub", "Uttarakhand Hybrid Zone", "Himachal Hybrid Station", "Goa Renewable Node",
  // Network Nodes (10)
  "Delhi NCR Power Hub", "Mundra UMPP Grid", "Maithon Power Facility",
  "Jharkhand Grid Station", "Odisha Coastal Station", "West Bengal Power Node",
  "Assam Grid Station", "Tamil Nadu Coastal Hub", "Kerala Southern Grid", "Goa Industrial Feeder",
];

// Location data mapping based on utility type
const locationsByUtility: Record<UtilityType, string[]> = {
  "Mumbai Distribution": [
    "Bandra Grid Station",
    "Kurla Distribution Center",
    "Andheri Substation",
    "Borivali Transformer Hub",
    "Colaba Control Room",
    "Dadar Power Station"
  ],
  "Renewable": [
    "Jaisalmer Solar Park",
    "Kutch Wind Farm",
    "Gujarat Hybrid Plant",
    "Rajasthan Solar Zone",
    "Maharashtra Wind Corridor",
    "Tamil Nadu Renewable Hub"
  ],
  "Solar": [
    "Jaisalmer Solar Park",
    "Bhadla Solar Park",
    "Pavagada Solar Park",
    "Rewa Ultra Mega Solar",
    "Kamuthi Solar Plant",
    "Gujarat Solar Farm"
  ],
  "Wind": [
    "Kutch Wind Farm",
    "Jaisalmer Wind Park",
    "Tamil Nadu Wind Corridor",
    "Gujarat Wind Zone",
    "Maharashtra Wind Belt",
    "Karnataka Wind Farm"
  ],
  "Hybrid": [
    "Gujarat Hybrid Plant",
    "Rajasthan Hybrid Park",
    "Karnataka Hybrid Zone",
    "Andhra Pradesh Hybrid Hub",
    "Tamil Nadu Hybrid Facility",
    "Maharashtra Hybrid Station"
  ]
};

// Available weather data providers
const weatherProviders: Provider[] = [
  "IMD",
  "Tomorrow.io"
];

// Mock data generators
const generateSparklineData = (points: number = 7, seed: number = 0) => {
  return Array.from({ length: points }, (_, i) => ({
    value: 50 + Math.sin((i + seed) * 0.5) * 30 + Math.cos((i + seed) * 0.3) * 20,
    index: i,
  }));
};

const generateForecastAccuracyData = (provider: Provider, horizon: ForecastHorizon, location: string) => {
  const providerBase = {
    "IMD": 85,
    "Tomorrow.io": 90
  }[provider];

  const locationBoost = location.includes("Solar") || location.includes("Wind") ? 2 :
    location.includes("Hybrid") ? 3 : 0;

  const horizonWeight = {
    "1 Min": 1.08,
    "15 Min": 1.05,
    "Day Ahead": 1.0,
    "15 Day": 0.85
  }[horizon];

  return [
    {
      horizon: "1 Min",
      Temperature: Math.round((providerBase + locationBoost + 8) * 1.0),
      Wind: Math.round((providerBase + locationBoost + 6) * 1.0),
      Rainfall: Math.round((providerBase + locationBoost + 4) * 1.0)
    },
    {
      horizon: "15 Min",
      Temperature: Math.round((providerBase + locationBoost + 5) * 1.0),
      Wind: Math.round((providerBase + locationBoost + 3) * 1.0),
      Rainfall: Math.round((providerBase + locationBoost + 1) * 1.0)
    },
    {
      horizon: "Day Ahead",
      Temperature: Math.round((providerBase + locationBoost - 2) * horizonWeight),
      Wind: Math.round((providerBase + locationBoost - 5) * horizonWeight),
      Rainfall: Math.round((providerBase + locationBoost - 8) * horizonWeight)
    },
    {
      horizon: "15 Day",
      Temperature: Math.round((providerBase + locationBoost - 15) * horizonWeight),
      Wind: Math.round((providerBase + locationBoost - 18) * horizonWeight),
      Rainfall: Math.round((providerBase + locationBoost - 20) * horizonWeight)
    },
  ];
};

const generateHeatmapData = (provider: Provider, location: string, parameter: Parameter) => {
  const parameters = ["Ambient Temperature", "Wind Speed", "Relative Humidity", "Rainfall"];
  const times = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
  const data: any[] = [];

  const providerFactor = {
    "IMD": 1.0,
    "Tomorrow.io": 0.75
  }[provider];

  const locationSeed = location.length;

  times.forEach((time, tIdx) => {
    parameters.forEach((param, pIdx) => {
      const baseError = Math.abs(Math.sin(tIdx * pIdx + locationSeed) * 8);
      const paramBonus = param === parameter ? 0.6 : 1.0;
      data.push({
        time,
        parameter: param,
        error: baseError * providerFactor * paramBonus,
      });
    });
  });

  return data;
};

const generateGHIData = (location: string, timeRange: TimeRange) => {
  const peakGHI = location.includes("Jaisalmer") ? 900 :
    location.includes("Gujarat") ? 850 :
      location.includes("Tamil Nadu") ? 820 :
        location.includes("Karnataka") ? 840 : 850;

  const dataPoints = timeRange === "Today" ? 7 : timeRange === "7 Days" ? 5 : 4;
  const locationSeed = location.length % 10;

  const times = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
  return times.slice(0, dataPoints).map((time, idx) => {
    const progress = idx / (dataPoints - 1);
    const curve = Math.sin(progress * Math.PI);
    return {
      time,
      GHI: Math.round(peakGHI * curve + locationSeed * 10),
      DHI: Math.round(peakGHI * curve * 0.3 + locationSeed * 5),
    };
  });
};

const generateExtremeWeatherEvents = (location: string, timeRange: TimeRange, provider: Provider) => {
  // Core 5 event types that must always be shown
  const coreEventTypes = [
    { type: "Heavy Rain", severity: "High" as const },
    { type: "High Wind", severity: "Medium" as const },
    { type: "Heatwave", severity: "Low" as const },
    { type: "High Humidity", severity: "Low" as const },
    { type: "Thunderstorm", severity: "Medium" as const },
  ];

  // Additional event types based on location
  const additionalEventTypes = location.includes("Coastal") || location.includes("Mumbai") || location.includes("Kurla")
    ? [
      { type: "Cyclone Warning", severity: "Medium" as const },
      { type: "Storm Surge", severity: "Medium" as const },
      { type: "Flooding Risk", severity: "High" as const },
      { type: "Wind Gusts", severity: "Medium" as const },
      { type: "Lightning Alert", severity: "Low" as const },
    ]
    : location.includes("Solar") || location.includes("Jaisalmer") || location.includes("Rajasthan")
      ? [
        { type: "Dust Storm", severity: "High" as const },
        { type: "Extreme Heat", severity: "High" as const },
        { type: "Low Cloud Cover", severity: "Low" as const },
        { type: "Sand Storm", severity: "Medium" as const },
        { type: "Dry Spell", severity: "Low" as const },
        { type: "UV Alert", severity: "Medium" as const },
      ]
      : location.includes("Wind") || location.includes("Tamil Nadu") || location.includes("Gujarat")
        ? [
          { type: "High Wind Speed", severity: "Medium" as const },
          { type: "Wind Shear", severity: "High" as const },
          { type: "Turbulence Alert", severity: "Medium" as const },
          { type: "Monsoon Wind", severity: "Low" as const },
          { type: "Gale Warning", severity: "High" as const },
          { type: "Strong Gusts", severity: "Medium" as const },
          { type: "Wind Direction Shift", severity: "Low" as const },
          { type: "Storm System", severity: "High" as const },
        ]
        : [
          { type: "Weather Front", severity: "Medium" as const },
        ];

  // Combine core events with additional events
  const allEventTypes = [...coreEventTypes, ...additionalEventTypes];

  const locations = location.includes("Mumbai") || location.includes("Bandra") || location.includes("Kurla")
    ? ["Western Region", "Coastal Area", "Central Zone", "Eastern Sector", "Northern District", "Southern Belt", "Harbor Zone", "Suburban Area"]
    : location.includes("Solar") || location.includes("Wind") || location.includes("Renewable")
      ? ["Plant Site A", "Plant Site B", "Plant Site C", "Northern Array", "Southern Array", "Eastern Block", "Western Block", "Central Facility"]
      : ["Zone 1", "Zone 2", "Zone 3", "Sector A", "Sector B", "Area North", "Area South", "Central Region"];

  // Always show at least the 5 core events
  const minEventCount = 5;
  const maxEventCount = 5; // Always show exactly 5 cards
  
  const providerDetectionRate = {
    "IMD": 0.85,
    "Tomorrow.io": 0.92
  }[provider];

  const actualEventCount = Math.max(minEventCount, Math.round(maxEventCount * providerDetectionRate));

  // Map event types to relevant weather parameters
  const getEventParameter = (eventType: string): WeatherParameter => {
    const parameterMap: Record<string, WeatherParameter> = {
      "Heavy Rain": "Rainfall",
      "High Wind": "Wind Speed",
      "Heatwave": "Ambient Temperature",
      "High Humidity": "Relative Humidity",
      "Thunderstorm": "Precipitation",
      "Cyclone Warning": "Wind Gust",
      "Storm Surge": "Ambient Pressure",
      "Flooding Risk": "Rainfall",
      "Wind Gusts": "Wind Gust",
      "Lightning Alert": "Cloud Cover",
      "Dust Storm": "Wind Speed",
      "Extreme Heat": "Ambient Temperature",
      "Low Cloud Cover": "Cloud Cover",
      "Sand Storm": "Air Density",
      "Dry Spell": "Relative Humidity",
      "UV Alert": "Ambient Temperature",
      "High Wind Speed": "Wind Speed",
      "Wind Shear": "Wind Direction",
      "Turbulence Alert": "Wind Gust",
      "Monsoon Wind": "Wind Speed",
      "Gale Warning": "Wind Gust",
      "Strong Gusts": "Wind Gust",
      "Wind Direction Shift": "Wind Direction",
      "Storm System": "Ambient Pressure",
      "Fog Alert": "Relative Humidity",
      "Temperature Drop": "Ambient Temperature",
      "Weather Front": "Ambient Pressure",
    };
    return parameterMap[eventType] || "Ambient Temperature";
  };

  return Array.from({ length: actualEventCount }, (_, i) => ({
    id: i + 1,
    type: allEventTypes[i % allEventTypes.length].type,
    location: locations[i % locations.length],
    severity: allEventTypes[i % allEventTypes.length].severity,
    startTime: `${8 + i}:${(i * 15) % 60} AM`,
    status: i < 2 ? "Active" : i < 4 ? "Monitoring" : "Predicted",
    parameter: getEventParameter(allEventTypes[i % allEventTypes.length].type)
  }));
};

const generateWeatherTimeline = (location: string, timeRange: TimeRange, param: Parameter) => {
  const isSolarLocation = location.includes("Solar") || location.includes("Jaisalmer") || location.includes("Bhadla");
  const isWindLocation = location.includes("Wind") || location.includes("Tamil Nadu") || location.includes("Kutch");
  const isCoastalLocation = location.includes("Mumbai") || location.includes("Coastal") || location.includes("Bandra");

  // Parameter-specific events
  if (param === "Ambient Temperature" || param === "Dew Point Temperature") {
    if (isSolarLocation) {
      return [
        { time: "06:00 AM", event: "Cool Morning", icon: "sun" as const },
        { time: "09:00 AM", event: "Temp Rising", icon: "sun" as const },
        { time: "12:00 PM", event: "Peak Heat", icon: "alert" as const },
        { time: "03:00 PM", event: "High Temp", icon: "alert" as const },
        { time: "06:00 PM", event: "Cooling Down", icon: "sun" as const },
      ];
    } else {
      return [
        { time: "06:00 AM", event: "Morning Cool", icon: "sun" as const },
        { time: "12:00 PM", event: "Noon Peak", icon: "sun" as const },
        { time: "03:00 PM", event: "Afternoon High", icon: "alert" as const },
        { time: "06:00 PM", event: "Evening Drop", icon: "sun" as const },
      ];
    }
  } else if (param === "Wind Speed" || param === "Wind Direction" || param === "Wind Gust") {
    if (isWindLocation) {
      return [
        { time: "06:00 AM", event: "Light Breeze", icon: "wind" as const },
        { time: "09:00 AM", event: "Wind Pickup", icon: "wind" as const },
        { time: "12:00 PM", event: "Strong Winds", icon: "wind" as const },
        { time: "03:00 PM", event: "Peak Wind Speed", icon: "wind" as const },
        { time: "06:00 PM", event: "Wind Decrease", icon: "wind" as const },
      ];
    } else {
      return [
        { time: "06:00 AM", event: "Calm", icon: "sun" as const },
        { time: "10:00 AM", event: "Light Wind", icon: "wind" as const },
        { time: "02:00 PM", event: "Moderate Wind", icon: "wind" as const },
        { time: "06:00 PM", event: "Gentle Breeze", icon: "wind" as const },
      ];
    }
  } else if (param === "Relative Humidity") {
    if (isCoastalLocation) {
      return [
        { time: "06:00 AM", event: "Morning Fog", icon: "cloud-rain" as const },
        { time: "09:00 AM", event: "Humidity Rise", icon: "cloud-rain" as const },
        { time: "12:00 PM", event: "High Humidity", icon: "cloud-rain" as const },
        { time: "03:00 PM", event: "Moisture Peak", icon: "cloud-rain" as const },
        { time: "06:00 PM", event: "Evening Dew", icon: "cloud-rain" as const },
      ];
    } else {
      return [
        { time: "06:00 AM", event: "Low Humidity", icon: "sun" as const },
        { time: "12:00 PM", event: "Moderate Level", icon: "cloud-rain" as const },
        { time: "06:00 PM", event: "Rising Moisture", icon: "cloud-rain" as const },
      ];
    }
  } else if (param === "Rainfall" || param === "Precipitation") {
    return [
      { time: "06:00 AM", event: "Dry Morning", icon: "sun" as const },
      { time: "09:00 AM", event: "Cloud Build-up", icon: "cloud-rain" as const },
      { time: "12:00 PM", event: "Light Showers", icon: "cloud-rain" as const },
      { time: "03:00 PM", event: "Heavy Rain", icon: "alert" as const },
      { time: "06:00 PM", event: "Rain Clearing", icon: "cloud-rain" as const },
    ];
  } else if (param === "Cloud Cover") {
    return [
      { time: "06:00 AM", event: "Clear Skies", icon: "sun" as const },
      { time: "09:00 AM", event: "Clouds Forming", icon: "cloud-rain" as const },
      { time: "12:00 PM", event: "Partly Cloudy", icon: "cloud-rain" as const },
      { time: "03:00 PM", event: "Overcast", icon: "alert" as const },
      { time: "06:00 PM", event: "Clouds Thinning", icon: "cloud-rain" as const },
    ];
  } else if (param === "Ambient Pressure") {
    return [
      { time: "06:00 AM", event: "Stable Pressure", icon: "sun" as const },
      { time: "09:00 AM", event: "Pressure Rising", icon: "sun" as const },
      { time: "12:00 PM", event: "High Pressure", icon: "sun" as const },
      { time: "03:00 PM", event: "Pressure Drop", icon: "alert" as const },
      { time: "06:00 PM", event: "Normalizing", icon: "cloud-rain" as const },
    ];
  } else if (param === "Air Density") {
    return [
      { time: "06:00 AM", event: "Dense Air", icon: "wind" as const },
      { time: "09:00 AM", event: "Density Drop", icon: "wind" as const },
      { time: "12:00 PM", event: "Low Density", icon: "alert" as const },
      { time: "03:00 PM", event: "Heating Peak", icon: "alert" as const },
      { time: "06:00 PM", event: "Density Rising", icon: "wind" as const },
    ];
  }

  // Fallback to original logic if parameter doesn't match
  if (isSolarLocation) {
    return [
      { time: "06:00 AM", event: "Sunrise Clear", icon: "sun" as const },
      { time: "09:00 AM", event: "Peak Irradiance", icon: "sun" as const },
      { time: "12:00 PM", event: "Max Solar Output", icon: "sun" as const },
      { time: "03:00 PM", event: "Cloud Formation", icon: "cloud-rain" as const },
      { time: "06:00 PM", event: "Sunset", icon: "alert" as const },
    ];
  } else if (isWindLocation) {
    return [
      { time: "06:00 AM", event: "Light Breeze", icon: "wind" as const },
      { time: "09:00 AM", event: "Wind Pickup", icon: "wind" as const },
      { time: "12:00 PM", event: "Strong Winds", icon: "wind" as const },
      { time: "03:00 PM", event: "Peak Wind Speed", icon: "wind" as const },
      { time: "06:00 PM", event: "Wind Decrease", icon: "wind" as const },
    ];
  } else if (isCoastalLocation) {
    return [
      { time: "06:00 AM", event: "Morning Fog", icon: "cloud-rain" as const },
      { time: "09:00 AM", event: "Humidity Rise", icon: "cloud-rain" as const },
      { time: "12:00 PM", event: "Afternoon Rain", icon: "cloud-rain" as const },
      { time: "03:00 PM", event: "Thunderstorm", icon: "alert" as const },
      { time: "06:00 PM", event: "Evening Clear", icon: "sun" as const },
    ];
  } else {
    return [
      { time: "06:00 AM", event: "Clear Sky", icon: "sun" as const },
      { time: "10:00 AM", event: "Light Rain", icon: "cloud-rain" as const },
      { time: "02:00 PM", event: "Strong Wind", icon: "wind" as const },
      { time: "06:00 PM", event: "Thunderstorm", icon: "alert" as const },
    ];
  }
};

// Calculate dynamic forecast confidence based on filters
const calculateConfidence = (
  provider: Provider,
  horizon: ForecastHorizon,
  param: Parameter,
  period: "today" | "sevenDay"
): number => {
  // Base confidence scores by provider
  const providerBase = {
    "IMD": 0.88,
    "Tomorrow.io": 0.93
  }[provider];

  // Horizon factor (shorter horizons = higher confidence)
  const horizonFactor = {
    "1 Min": 1.05,
    "15 Min": 1.03,
    "Day Ahead": 1.0,
    "15 Day": 0.88
  }[horizon];

  // Parameter factor (some parameters are easier to forecast)
  const paramFactor = {
    "Wind Speed": 0.96,
    "Wind Direction": 0.94,
    "Wind Gust": 0.92,
    "Ambient Temperature": 1.02,
    "Ambient Pressure": 1.00,
    "Relative Humidity": 1.00,
    "Air Density": 0.98,
    "Cloud Cover": 0.90,
    "Rainfall": 0.88,
    "Precipitation": 0.89,
    "Dew Point Temperature": 1.01
  }[param];

  // Period factor (today is more accurate than 7-day)
  const periodFactor = period === "today" ? 1.0 : 0.87;

  // Calculate final confidence with random variation
  const baseConfidence = providerBase * horizonFactor * paramFactor * periodFactor;
  const variation = (Math.random() - 0.5) * 0.04; // ±2% random variation
  
  return Math.min(0.99, Math.max(0.65, baseConfidence + variation));
};

export function DashboardPage({ selectedUtility }: DashboardPageProps) {
  const { user } = useRole();
  const { alerts } = useAlertManagement();

  const utilityType = selectedUtility as UtilityType;

  const availableLocations = useMemo(() => {
    // Super Admin sees ALL locations across every utility (60 entries → card scroll view)
    if (user.role === "superadmin") return ALL_SUPERADMIN_LOCATIONS;
    return locationsByUtility[utilityType] || locationsByUtility["Mumbai Distribution"];
  }, [utilityType, user.role]);

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState<string>(availableLocations[0]);
  const [selectedProvider, setSelectedProvider] = useState<Provider>("IMD");
  const [timeRange, setTimeRange] = useState<TimeRange>("Today");
  const [forecastHorizon, setForecastHorizon] = useState<ForecastHorizon>("Day Ahead");
  const [parameter, setParameter] = useState<Parameter>("Ambient Temperature");
  const [weatherParameter, setWeatherParameter] = useState<WeatherParameter>("All Parameters");

  useMemo(() => {
    setSelectedLocation(availableLocations[0]);
  }, [availableLocations]);

  // Dropdown states
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [timeRangeDropdownOpen, setTimeRangeDropdownOpen] = useState(false);
  const [forecastHorizonDropdownOpen, setForecastHorizonDropdownOpen] = useState(false);
  const [parameterDropdownOpen, setParameterDropdownOpen] = useState(false);
  const [weatherParameterDropdownOpen, setWeatherParameterDropdownOpen] = useState(false);

  // Alerts modal state
  const [showAlertsModal, setShowAlertsModal] = useState(false);

  // Transform AlertRule to WeatherEvent format for the modal
  const transformedAlerts = useMemo(() => {
    // Filter for active alerts
    const activeAlerts = alerts.filter((alert) => alert.status === "active" && alert.isActive);
    
    return activeAlerts.map((alert, index) => {
      // Map severity from context (info, warning, critical) to modal format (Low, Medium, High)
      const severityMap: Record<string, "Low" | "Medium" | "High"> = {
        info: "Low",
        warning: "Medium",
        critical: "High"
      };
      
      // Map status to modal format
      const statusMap: Record<string, "Active" | "Monitoring" | "Predicted"> = {
        active: "Active",
        created: "Monitoring"
      };
      
      // Format time
      const formatTime = (isoString?: string) => {
        if (!isoString) return "Not triggered";
        const date = new Date(isoString);
        return date.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      };
      
      return {
        id: index + 1,
        type: alert.name,
        location: alert.locationName || alert.utility,
        severity: severityMap[alert.severity] || "Medium",
        startTime: formatTime(alert.triggeredAt),
        status: statusMap[alert.status] || "Monitoring"
      };
    });
  }, [alerts]);

  // Tab state for KPI sections
  type KPITab = "overview" | "parameters" | "accuracy";
  const [activeKPITab, setActiveKPITab] = useState<KPITab>("overview");

  const showSolarFeatures = useMemo(() => {
    return utilityType === "Renewable" || utilityType === "Solar" || utilityType === "Hybrid";
  }, [utilityType]);

  // Calculate dynamic forecast confidence values
  const confidenceScores = useMemo(() => ({
    today: calculateConfidence(selectedProvider, forecastHorizon, parameter, "today"),
    sevenDay: calculateConfidence(selectedProvider, forecastHorizon, parameter, "sevenDay")
  }), [selectedProvider, forecastHorizon, parameter]);

  const kpiData = useMemo(() => {
    const baseAccuracy = 92;
    const locationModifier = selectedLocation.includes("Solar") || selectedLocation.includes("Wind") ? 2 : 0;
    const providerModifier = selectedProvider === "Tomorrow.io" ? 2 : 0;
    const timeModifier = timeRange === "Today" ? 0 : timeRange === "7 Days" ? -1 : -2;
    const horizonModifier = forecastHorizon === "1 Min" ? 5 : forecastHorizon === "15 Min" ? 3 : forecastHorizon === "Day Ahead" ? 0 : -8;

    const finalAccuracy = Math.min(98, Math.max(70, baseAccuracy + locationModifier + providerModifier + timeModifier + horizonModifier));

    return {
      forecastAccuracy: {
        value: Math.round(finalAccuracy),
        trend: 2.3 + (providerModifier * 0.3),
        isUp: true
      },
      solarPotential: {
        value: showSolarFeatures ? Number((7.4 + (Math.random() * 2 - 1)).toFixed(1)) : 0,
        unit: "kWh/m²",
        trend: 1.2,
        isUp: true
      },
      extremeEvents: {
        value: timeRange === "Today" ? 3 : timeRange === "7 Days" ? 5 : 8,
        trend: -1,
        isUp: false
      },
    };
  }, [selectedLocation, selectedProvider, timeRange, forecastHorizon, showSolarFeatures]);

  const accuracyMetrics = useMemo(() => {
    const baseMAE = 2.1;
    const baseRMSE = 3.4;
    const baseMAPE = 8.2;

    const providerFactor = selectedProvider === "Tomorrow.io" ? 0.85 : 1.0;
    const horizonFactor = forecastHorizon === "1 Min" ? 0.5 : forecastHorizon === "15 Min" ? 0.7 : forecastHorizon === "Day Ahead" ? 1.0 : 1.8;
    
    const paramFactor = {
      "Wind Speed": 1.2,
      "Wind Direction": 1.3,
      "Wind Gust": 1.4,
      "Ambient Temperature": 1.0,
      "Ambient Pressure": 0.9,
      "Relative Humidity": 1.1,
      "Air Density": 1.0,
      "Cloud Cover": 1.3,
      "Rainfall": 1.5,
      "Precipitation": 1.4,
      "Dew Point Temperature": 1.0
    }[parameter] || 1.0;

    const getParameterUnit = (param: Parameter): string => {
      const unitMap: Record<Parameter, string> = {
        "Wind Speed": "m/s",
        "Wind Direction": "°",
        "Wind Gust": "m/s",
        "Ambient Temperature": "°C",
        "Ambient Pressure": "hPa",
        "Relative Humidity": "%",
        "Air Density": "kg/m³",
        "Cloud Cover": "%",
        "Rainfall": "mm",
        "Precipitation": "mm",
        "Dew Point Temperature": "°C"
      };
      return unitMap[param] || "";
    };

    return {
      mae: {
        value: Number((baseMAE * providerFactor * horizonFactor * paramFactor).toFixed(1)),
        unit: getParameterUnit(parameter),
        trend: -0.3,
        isUp: false
      },
      rmse: {
        value: Number((baseRMSE * providerFactor * horizonFactor * paramFactor).toFixed(1)),
        unit: getParameterUnit(parameter),
        trend: -0.5,
        isUp: false
      },
      mape: {
        value: Number((baseMAPE * providerFactor * horizonFactor * paramFactor).toFixed(1)),
        unit: "%",
        trend: 1.1,
        isUp: true
      },
    };
  }, [selectedProvider, parameter, forecastHorizon]);

  // Generate all parameter KPI data
  const allParameterKPIs = useMemo(() => {
    const seed = selectedLocation.length + selectedProvider.length;
    return {
      temperature: {
        value: 32 + (seed % 10) - 5,
        unit: "°C",
        trend: 2.1,
        isUp: true,
        forecast: 34 + (seed % 8),
        accuracy: 94.2
      },
      windSpeed: {
        value: 12.5 + (seed % 5),
        unit: "m/s",
        trend: -1.3,
        isUp: false,
        forecast: 11.8 + (seed % 4),
        accuracy: 91.8
      },
      humidity: {
        value: 68 + (seed % 15),
        unit: "%",
        trend: 0.8,
        isUp: true,
        forecast: 72 + (seed % 12),
        accuracy: 93.5
      },
      irradiance: {
        value: showSolarFeatures ? 850 + (seed % 100) : 0,
        unit: "W/m²",
        trend: 3.4,
        isUp: true,
        forecast: showSolarFeatures ? 890 + (seed % 80) : 0,
        accuracy: 95.1
      },
      precipitation: {
        value: 2.4 + (seed % 8) * 0.5,
        unit: "mm",
        trend: -2.1,
        isUp: false,
        forecast: 1.8 + (seed % 6) * 0.4,
        accuracy: 88.7
      },
      cloudCover: {
        value: 45 + (seed % 30),
        unit: "%",
        trend: 1.5,
        isUp: true,
        forecast: 52 + (seed % 25),
        accuracy: 90.3
      },
      uvIndex: {
        value: 7 + (seed % 5),
        unit: "",
        trend: 0.5,
        isUp: true,
        forecast: 8 + (seed % 4),
        accuracy: 92.9
      },
      airQuality: {
        value: 85 + (seed % 15),
        unit: "AQI",
        trend: -1.8,
        isUp: false,
        forecast: 78 + (seed % 12),
        accuracy: 89.4
      },
    };
  }, [selectedLocation, selectedProvider, showSolarFeatures]);

  return (
    <div className="flex-1 bg-background">
      {/* ── New Integrated Filter Bar ── */}
      <DashboardFilterBar />

      <div className="px-4 md:px-6 py-5 space-y-5 max-w-[1600px]">
        {/* ── Alert Strip: 4 severity tiles ── */}
        <AlertStrip onAlertClick={(severity) => console.log("Alert:", severity)} />

        {/* ── KPI Cards: 6 headline metrics ── */}
        <KpiCards />

        {/* ── Chart + Table Row ── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-3 min-w-0">
            <ForecastActualChart selectedUtility={selectedUtility} />
          </div>
          <div className="xl:col-span-2 min-w-0">
            <BlockwiseTable />
          </div>
        </div>

        {/* ── Cloud & Wind Playback ── */}
        <PlaybackControl />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// HERO KPI CARD COMPONENT — Premium iOS-Inspired Redesign
// ══════════════════════════════════════════════════════════════════
function HeroKPICard({
  title,
  value,
  trend,
  isUp,
  sparklineData,
  tooltip,
  icon,
  accentColor = "#6366f1",
}: {
  title: string;
  value: string;
  trend: number;
  isUp: boolean;
  sparklineData: any[];
  tooltip: string;
  icon: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-[24px] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] group transition-all"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-[14px] flex items-center justify-center transition-colors"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-[13px] font-medium text-muted-foreground tracking-wide">{title}</h3>
              <div className="text-2xl font-semibold text-foreground tracking-tight mt-0.5">{value}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              title={tooltip}
            >
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            </button>
            <div 
              className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full ${
                isUp ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          </div>
        </div>
        
        <div className="h-14 -mx-1 relative mt-2">
          {/* Sparkline */}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`spark-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop key={`spark-${title}-stop-1`} offset="5%" stopColor={accentColor} stopOpacity={0.2} />
                  <stop key={`spark-${title}-stop-2`} offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={accentColor}
                strokeWidth={2}
                fill={`url(#spark-${title.replace(/\s/g, '')})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════
// COMPACT PARAMETER CARD COMPONENT — Premium iOS-Inspired Redesign
// ══════════════════════════════════════════════════════════════════
function CompactParameterCard({
  title,
  value,
  unit,
  trend,
  isUp,
  forecast,
  accuracy,
  icon,
  color,
}: {
  title: string;
  value: number;
  unit: string;
  trend: number;
  isUp: boolean;
  forecast: number;
  accuracy: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative p-4 rounded-[20px] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-colors"
            style={{ backgroundColor: `${color}15`, color: color }}
          >
            {icon}
          </div>
          <div className="text-[12px] font-medium text-muted-foreground tracking-wide">{title}</div>
        </div>
        <div
          className={`flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            isUp ? "text-green-600 dark:text-green-400 bg-green-500/10" : "text-red-600 dark:text-red-400 bg-red-500/10"
          }`}
        >
          {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-semibold text-foreground tracking-tight tabular-nums">{value}</span>
        <span className="text-[11px] font-medium text-muted-foreground">{unit}</span>
      </div>

      <div className="flex items-center justify-between text-[11px] pt-3 border-t border-black/5 dark:border-white/5">
        <div className="text-muted-foreground">
          Forecast: <span className="font-medium text-foreground">{forecast}{unit}</span>
        </div>
        <div className="font-medium" style={{ color }}>{accuracy}% Acc.</div>
      </div>
    </motion.div>
  );
}

// Metric Card Component — Premium iOS-Inspired Redesign
function MetricCard({
  title,
  subtitle,
  value,
  trend,
  isUp,
  sparklineData,
  tooltip,
  color = "#6366f1",
  maxValue = 20,
}: {
  title: string;
  subtitle: string;
  value: string;
  trend: number;
  isUp: boolean;
  sparklineData: any[];
  tooltip: string;
  color?: string;
  maxValue?: number;
}) {
  const numericVal = parseFloat(value);
  const progress = Math.min(100, (numericVal / maxValue) * 100);

  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative p-5 rounded-[24px] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] group transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-medium text-muted-foreground tracking-wide">{title}</h3>
          <p className="text-[11px] text-muted-foreground/80 mt-0.5">{subtitle}</p>
        </div>
        <button 
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full" 
          title={tooltip}
        >
          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div className="text-3xl font-semibold text-foreground tracking-tight">{value}</div>
        <div
          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full mb-1.5 ${
            isUp ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-green-500/10 text-green-600 dark:text-green-400"
          }`}
        >
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{Math.abs(trend)}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2 font-medium">
          <span>Error level</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      <div className="h-14 -mx-1 relative mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <defs>
              <linearGradient id={`metric-spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#metric-spark-${title})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// Filter Dropdown Component — Enhanced with premium grid view for locations
function FilterDropdown({
  label,
  value,
  options,
  isOpen,
  setIsOpen,
  onChange,
  gridView = false,
}: {
  label: string;
  value: string;
  options: string[];
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onChange: (val: string) => void;
  gridView?: boolean;
}) {
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm"
      >
        <span className="text-muted-foreground text-xs">{label}:</span>
        <span className="text-foreground font-medium">{value}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          {gridView ? (
            // Clean Grid View for Locations - Simple & Minimal (as per design)
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] z-20 p-3 min-w-[780px] max-h-[340px] overflow-hidden">
              {/* Scrollable Grid Container */}
              <div className="overflow-y-auto max-h-[320px] custom-scrollbar">
                <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                  {options.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        onChange(option);
                        setIsOpen(false);
                      }}
                      className={`text-left px-3 py-2 rounded text-sm transition-all ${
                        option === value 
                          ? "text-primary font-medium bg-primary/5" 
                          : "text-foreground hover:bg-muted/60"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Standard vertical list view
            <div className="absolute top-full mt-1 right-0 bg-popover border border-border rounded-lg shadow-lg z-20 min-w-[180px] py-1">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                    option === value ? "bg-muted text-foreground font-medium" : "text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Location Scrollable Cards — Premium Glassmorphic (rendered when locations > 50) ───
function LocationScrollableCards({
  selectedLocation,
  locations,
  onSelect,
}: {
  selectedLocation: string;
  locations: string[];
  onSelect: (val: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getLocationTag = (name: string): { label: string; color: string } => {
    if (name.includes("Solar") || name.includes("GHI"))
      return { label: "Solar", color: "text-amber-500 bg-amber-500/10 border-amber-500/25" };
    if (name.includes("Wind"))
      return { label: "Wind", color: "text-sky-500 bg-sky-500/10 border-sky-500/25" };
    if (name.includes("Hybrid") || name.includes("Renewable"))
      return { label: "Hybrid", color: "text-violet-500 bg-violet-500/10 border-violet-500/25" };
    if (
      name.includes("Grid") || name.includes("Substation") || name.includes("Feeder") ||
      name.includes("Control") || name.includes("Node") || name.includes("Center") ||
      name.includes("Hub") || name.includes("Point")
    )
      return { label: "Grid", color: "text-blue-500 bg-blue-500/10 border-blue-500/25" };
    return { label: "Plant", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/25" };
  };

  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <div className="flex-shrink-0 flex items-center gap-1.5 pr-1">
        <MapPin className="w-3.5 h-3.5 text-primary/60" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap select-none">
          Location
        </span>
      </div>

      {/* Scrollable track with edge fade masks */}
      <div className="relative flex-1 min-w-0 overflow-hidden">
        {/* Left fade gradient */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-background/90 to-transparent" />
        {/* Right fade gradient */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-l from-background/90 to-transparent" />

        <div
          ref={scrollRef}
          className="flex gap-1.5 overflow-x-auto pb-0.5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {locations.map((loc) => {
            const isSelected = loc === selectedLocation;
            const tag = getLocationTag(loc);
            return (
              <button
                key={loc}
                onClick={() => onSelect(loc)}
                title={loc}
                className={[
                  "flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-[9px] border transition-all duration-200 active:scale-[0.97]",
                  isSelected
                    ? "bg-primary/10 dark:bg-primary/18 border-primary/40 text-primary shadow-[0_2px_10px_rgba(var(--primary-rgb,99,102,241),0.18)] backdrop-blur-sm"
                    : "bg-white/35 dark:bg-white/5 border-white/55 dark:border-white/8 text-foreground hover:bg-white/60 dark:hover:bg-white/10 hover:border-white/75 dark:hover:border-white/15 backdrop-blur-sm",
                ].join(" ")}
              >
                {/* Category pill */}
                <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full border ${tag.color} whitespace-nowrap leading-none`}>
                  {tag.label}
                </span>
                {/* Name */}
                <span className="text-[11px] whitespace-nowrap max-w-[130px] truncate leading-none">
                  {loc}
                </span>
                {/* Active dot */}
                {isSelected && (
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active selection badge */}
      <div className="hidden sm:flex flex-shrink-0 items-center gap-1.5 px-2.5 py-1.5 rounded-[9px] bg-primary/8 dark:bg-primary/12 border border-primary/20 backdrop-blur-sm max-w-[140px]">
        <span className="text-[11px] text-primary font-medium truncate">
          {selectedLocation}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORECAST HORIZON ACCURACY SECTION — Complete Component with Multi-Provider Support
// ═══════════════════════════════════════════════════════════════════════════════
function ForecastHorizonAccuracySection() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(["IMD", "Tomorrow.io"]);
  const [forecastType, setForecastType] = useState("Day Ahead");
  const [selectedParameter, setSelectedParameter] = useState("Ambient Temperature");
  const [selectedDate, setSelectedDate] = useState("Today");
  
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [forecastTypeDropdownOpen, setForecastTypeDropdownOpen] = useState(false);
  const [parameterDropdownOpen, setParameterDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  const allProviders = ["IMD", "Tomorrow.io"];
  const forecastTypes = ["1 Min", "15 Min", "Day Ahead", "15 Day"];
  const parameters = ["Wind Speed", "Wind Direction", "Wind Gust", "Ambient Temperature", "Ambient Pressure", "Relative Humidity", "Air Density", "Cloud Cover", "Rainfall", "Precipitation", "Dew Point Temperature"];
  const dates = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days"];

  const providerColors: Record<string, string> = {
    "IMD": "#6366f1",
    "Tomorrow.io": "#f59e0b",
  };

  const toggleProvider = (provider: string) => {
    if (selectedProviders.includes(provider)) {
      if (selectedProviders.length > 1) {
        setSelectedProviders(selectedProviders.filter(p => p !== provider));
      }
    } else {
      setSelectedProviders([...selectedProviders, provider]);
    }
  };

  // Generate time series data based on forecast type
  const generateChartData = () => {
    let timeLabels: string[] = [];
    
    if (forecastType === "1 Min") {
      timeLabels = ["00:00", "00:15", "00:30", "00:45", "01:00"];
    } else if (forecastType === "15 Min") {
      timeLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];
    } else if (forecastType === "Day Ahead") {
      timeLabels = ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "24:00"];
    } else { // 15 Day
      timeLabels = ["Day 1", "Day 3", "Day 5", "Day 7", "Day 9", "Day 11", "Day 13", "Day 15"];
    }
    
    return timeLabels.map((time) => {
      const dataPoint: any = { time };
      
      // Only include data for selected providers
      if (selectedProviders.includes("IMD")) {
        dataPoint.IMD = Math.round((85 + Math.random() * 10) * 10) / 10;
      }
      if (selectedProviders.includes("Tomorrow.io")) {
        dataPoint["Tomorrow.io"] = Math.round((88 + Math.random() * 9) * 10) / 10;
      }
      
      return dataPoint;
    });
  };

  const chartData = useMemo(() => generateChartData(), [selectedProviders, forecastType]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={glassCardClass}
    >
      {glassGlow}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Forecast Horizon Accuracy</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Compare accuracy trends across providers · {selectedParameter} · {selectedDate}
            </p>
          </div>
          
        </div>

        {/* Filters Row */}
        <div className="flex items-center flex-wrap gap-3 mb-6">
          {/* Multi-Provider Selector */}
          <div className="relative">
            <button
              onClick={() => setProviderDropdownOpen(!providerDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-white/5 border border-border/60 rounded-xl hover:bg-white/80 dark:hover:bg-white/10 hover:border-border transition-all text-sm min-w-[180px] shadow-sm"
            >
              <span className="text-muted-foreground text-xs font-medium">Providers:</span>
              <span className="text-foreground font-semibold text-sm">{selectedProviders.length} selected</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ml-auto ${providerDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {providerDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProviderDropdownOpen(false)} />
                <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-20 min-w-[260px] py-2">
                  <div className="px-4 pb-2.5 mb-2 border-b border-gray-200 dark:border-white/10">
                    <p className="text-sm font-semibold text-foreground">Select Providers</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose one or more to compare</p>
                  </div>
                  {allProviders.map((provider) => {
                    const isSelected = selectedProviders.includes(provider);
                    return (
                      <button
                        key={provider}
                        onClick={() => toggleProvider(provider)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-3 ${
                          isSelected ? "bg-muted/50" : "hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                            style={{ background: providerColors[provider] }}
                          />
                          <span className={`text-foreground ${isSelected ? "font-medium" : ""}`}>{provider}</span>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-md bg-primary flex items-center justify-center shadow-sm">
                            <span className="text-white text-xs font-bold">✓</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Forecast Type Dropdown */}
          <div className="relative">
            <button
              onClick={() => setForecastTypeDropdownOpen(!forecastTypeDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm"
            >
              <span className="text-muted-foreground text-xs">Forecast:</span>
              <span className="text-foreground font-medium">{forecastType}</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${forecastTypeDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {forecastTypeDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setForecastTypeDropdownOpen(false)} />
                <div className="absolute top-full mt-1 right-0 bg-popover border border-border rounded-lg shadow-lg z-20 min-w-[160px] py-1">
                  {forecastTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setForecastType(type);
                        setForecastTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                        type === forecastType ? "bg-muted text-foreground font-medium" : "text-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Parameter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setParameterDropdownOpen(!parameterDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm"
            >
              <span className="text-muted-foreground text-xs">Parameter:</span>
              <span className="text-foreground font-medium">{selectedParameter}</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${parameterDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {parameterDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setParameterDropdownOpen(false)} />
                <div className="absolute top-full mt-1 right-0 bg-popover border border-border rounded-lg shadow-lg z-20 min-w-[160px] py-1">
                  {parameters.map((param) => (
                    <button
                      key={param}
                      onClick={() => {
                        setSelectedParameter(param);
                        setParameterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                        param === selectedParameter ? "bg-muted text-foreground font-medium" : "text-foreground"
                      }`}
                    >
                      {param}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Date Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-foreground font-medium">{selectedDate}</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dateDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dateDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDateDropdownOpen(false)} />
                <div className="absolute top-full mt-1 right-0 bg-popover border border-border rounded-lg shadow-lg z-20 min-w-[160px] py-1">
                  {dates.map((date) => (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        setDateDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                        date === selectedDate ? "bg-muted text-foreground font-medium" : "text-foreground"
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Legend - Active Providers */}
          <div className="flex items-center gap-4 ml-auto">
            {selectedProviders.map((provider) => (
              <div key={provider} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0 shadow-sm"
                  style={{ background: providerColors[provider] }}
                />
                <span className="text-xs text-muted-foreground font-medium">{provider}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", dy: 6 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[70, 100]}
                tickFormatter={v => `${v}%`}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/90 dark:bg-[#151e32]/95 backdrop-blur-2xl shadow-xl p-3 min-w-[180px]">
                      <p className="text-xs font-bold text-foreground mb-2 pb-1.5 border-b border-black/[0.06] dark:border-white/[0.08]">
                        {label}
                      </p>
                      <div className="space-y-1.5">
                        {payload.map((p: any) => (
                          <div key={p.dataKey} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm" style={{ background: p.stroke }} />
                              <span className="text-[11px] text-muted-foreground">{p.dataKey}</span>
                            </div>
                            <span className="text-[11px] font-bold text-foreground tabular-nums">{p.value.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              {/* Dynamic Lines - One line per selected provider */}
              {selectedProviders.map((provider) => (
                <Line
                  key={provider}
                  type="monotone"
                  dataKey={provider}
                  stroke={providerColors[provider]}
                  strokeWidth={2.5}
                  dot={{ fill: providerColors[provider], r: 4, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

// Heatmap Grid — Enhanced with gradient color interpolation
function HeatmapGrid({ data }: { data: any[] }) {
  const parameters = ["Ambient Temperature", "Wind Speed", "Relative Humidity", "Rainfall"];
  const times = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];

  // Returns inline style with interpolated color based on error value
  const getCellStyle = (error: number) => {
    if (error < 2) {
      return { background: "rgba(34,197,94,0.75)", boxShadow: "0 2px 8px rgba(34,197,94,0.25)" };
    } else if (error < 4) {
      return { background: "rgba(74,222,128,0.65)", boxShadow: "none" };
    } else if (error < 6) {
      return { background: "rgba(234,179,8,0.75)", boxShadow: "0 2px 8px rgba(234,179,8,0.25)" };
    } else if (error < 7.5) {
      return { background: "rgba(249,115,22,0.75)", boxShadow: "0 2px 8px rgba(249,115,22,0.25)" };
    } else {
      return { background: "rgba(239,68,68,0.80)", boxShadow: "0 2px 8px rgba(239,68,68,0.30)" };
    }
  };

  return (
    <div className="grid grid-cols-7 gap-1.5 h-full">
      <div />
      {times.map((time) => (
        <div key={time} className="text-xs font-medium text-muted-foreground text-center flex items-end justify-center pb-1">
          {time}
        </div>
      ))}
      {parameters.map((param, i) => (
        <div key={param} className="contents">
          <div className="text-xs font-medium text-muted-foreground flex items-center pr-1 truncate">{param}</div>
          {times.map((time, j) => {
            const item = data.find((d) => d.time === time && d.parameter === param);
            const err = item?.error || 0;
            return (
              <motion.div
                key={`${param}-${time}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (i * times.length + j) * 0.015, duration: 0.2 }}
                className="h-10 rounded-xl hover:scale-105 transition-transform cursor-pointer"
                style={getCellStyle(err)}
                title={`${param} at ${time}: Error ${err.toFixed(2)}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Gauge Chart Component — Enhanced
function GaugeChart({ value, label }: { value: number; label: string }) {
  const percentage = value * 100;
  const fillColor =
    value >= 0.8 ? "#10b981" :
    value >= 0.6 ? "#f59e0b" :
    "#ef4444";
  const trackColor = "hsl(var(--muted))";
  const textColor =
    value >= 0.8 ? "text-emerald-500" :
    value >= 0.6 ? "text-amber-500" :
    "text-red-500";

  const gaugeData = [{ name: label, value: percentage, fill: fillColor }];

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="58%"
            innerRadius="62%"
            outerRadius="92%"
            barSize={14}
            data={gaugeData}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              key={`polar-${label}`}
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              key={`radial-${label}`}
              background={{ fill: trackColor }}
              dataKey="value"
              cornerRadius={8}
              fill={fillColor}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: '10px' }}>
          <div className={`text-3xl font-bold ${textColor}`}>
            {percentage.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        </div>
      </div>
      {/* Scale labels */}
      <div className="flex items-center justify-between w-full px-5 -mt-1">
        <span className="text-xs text-muted-foreground/60">0%</span>
        <span className="text-xs text-muted-foreground/60">100%</span>
      </div>
    </div>
  );
}

// ForecastConfidenceGauge is now imported from ../components/ForecastConfidenceGauge
// Keeping a local alias so any legacy references still compile
function ForecastConfidenceGauge({ today, sevenDay }: { today: number; sevenDay: number }) {
  return <FCGauge today={today} sevenDay={sevenDay} />;
}
// ── old inline implementation removed; component lives in ForecastConfidenceGauge.tsx ──
// ── ForecastConfidenceGauge moved to /src/app/components/ForecastConfidenceGauge.tsx ──












