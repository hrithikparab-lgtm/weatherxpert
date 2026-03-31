import React from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Shield,
  Zap,
  AlertTriangle,
  MapPin,
  Clock,
  TrendingUp,
  Wind,
  Droplets,
  Thermometer,
  Cloud,
  Activity,
} from "lucide-react";

interface AlertDetail {
  id: string;
  title: string;
  level: "Critical" | "High" | "Medium";
  location: string;
  zone: string;
  timestamp: string;
  riskScore: number;
  status: "Active" | "Monitoring" | "Predicted";
  affectedParameters: string[];
  forecast: {
    nextHour: string;
    next3Hours: string;
    next6Hours: string;
  };
  historicalData: {
    occurrences: number;
    lastOccurrence: string;
    averageDuration: string;
  };
}

// Mock data generator based on alert ID
const getAlertDetails = (id: string): AlertDetail => {
  const alerts: Record<string, AlertDetail> = {
    "1": {
      id: "1",
      title: "Catastrophic Cyclone Alert",
      level: "Critical",
      location: "Mumbai Distribution",
      zone: "Andheri Zone - Critical Infrastructure",
      timestamp: "1 min ago",
      riskScore: 98,
      status: "Active",
      affectedParameters: ["Wind Speed", "Wind Gust", "Ambient Pressure", "Rainfall"],
      forecast: {
        nextHour: "Wind speeds increasing to 130 km/h. Heavy rainfall expected.",
        next3Hours: "Peak cyclonic activity. Sustained winds above 140 km/h.",
        next6Hours: "Gradual weakening. Wind speeds reducing to 100 km/h.",
      },
      historicalData: {
        occurrences: 3,
        lastOccurrence: "June 15, 2025",
        averageDuration: "6-8 hours",
      },
    },
    "2": {
      id: "2",
      title: "Extreme Heat Alert",
      level: "Critical",
      location: "Mumbai Distribution",
      zone: "Andheri Zone - Substation 4",
      timestamp: "2 mins ago",
      riskScore: 95,
      status: "Active",
      affectedParameters: ["Ambient Temperature", "Relative Humidity", "Air Density"],
      forecast: {
        nextHour: "Temperature rising to 40°C. Heat index critical.",
        next3Hours: "Peak heat at 42°C. Highest demand period.",
        next6Hours: "Gradual cooling to 38°C as evening approaches.",
      },
      historicalData: {
        occurrences: 12,
        lastOccurrence: "March 10, 2026",
        averageDuration: "4-6 hours",
      },
    },
    "a0": {
      id: "a0",
      title: "Catastrophic Cyclone Alert",
      level: "Critical",
      location: "Mumbai Distribution",
      zone: "Andheri Zone - Critical Infrastructure",
      timestamp: "1 min ago",
      riskScore: 98,
      status: "Active",
      affectedParameters: ["Wind Speed", "Wind Gust", "Ambient Pressure", "Rainfall"],
      forecast: {
        nextHour: "Wind speeds increasing to 130 km/h. Heavy rainfall expected.",
        next3Hours: "Peak cyclonic activity. Sustained winds above 140 km/h.",
        next6Hours: "Gradual weakening. Wind speeds reducing to 100 km/h.",
      },
      historicalData: {
        occurrences: 3,
        lastOccurrence: "June 15, 2025",
        averageDuration: "6-8 hours",
      },
    },
    "a1": {
      id: "a1",
      title: "Extreme Heat Alert",
      level: "Critical",
      location: "Mumbai Distribution",
      zone: "Andheri Zone - Substation 4",
      timestamp: "2 mins ago",
      riskScore: 95,
      status: "Active",
      affectedParameters: ["Ambient Temperature", "Relative Humidity", "Air Density"],
      forecast: {
        nextHour: "Temperature rising to 40°C. Heat index critical.",
        next3Hours: "Peak heat at 42°C. Highest demand period.",
        next6Hours: "Gradual cooling to 38°C as evening approaches.",
      },
      historicalData: {
        occurrences: 12,
        lastOccurrence: "March 10, 2026",
        averageDuration: "4-6 hours",
      },
    },
    "a2": {
      id: "a2",
      title: "Pressure Drop Alert",
      level: "Critical",
      location: "Delhi Distribution",
      zone: "Connaught Place Grid",
      timestamp: "8 mins ago",
      riskScore: 92,
      status: "Active",
      affectedParameters: ["Ambient Pressure", "Wind Speed", "Cloud Cover"],
      forecast: {
        nextHour: "Pressure continues falling. Weather system approaching.",
        next3Hours: "Pressure stabilizes around 980 hPa.",
        next6Hours: "Gradual pressure recovery expected.",
      },
      historicalData: {
        occurrences: 8,
        lastOccurrence: "January 22, 2026",
        averageDuration: "3-5 hours",
      },
    },
    "a3": {
      id: "a3",
      title: "Storm Warning",
      level: "High",
      location: "Mumbai Distribution",
      zone: "Coastal Mumbai",
      timestamp: "28 mins ago",
      riskScore: 88,
      status: "Monitoring",
      affectedParameters: ["Rainfall", "Cloud Cover", "Wind Speed"],
      forecast: {
        nextHour: "Light rain beginning. Intensity increasing.",
        next3Hours: "Heavy rainfall peak expected.",
        next6Hours: "Rain gradually subsiding.",
      },
      historicalData: {
        occurrences: 15,
        lastOccurrence: "February 5, 2026",
        averageDuration: "4-6 hours",
      },
    },
  };

  return alerts[id] || alerts["1"];
};

export default function AlertDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const alert = getAlertDetails(id || "1");

  const severityConfig = {
    Critical: {
      badge: "bg-red-600 text-white",
      border: "border-red-500",
      indicator: "bg-red-500",
      icon: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950/20",
    },
    High: {
      badge: "bg-orange-500 text-white",
      border: "border-orange-400",
      indicator: "bg-orange-500",
      icon: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/20",
    },
    Medium: {
      badge: "bg-amber-500 text-white",
      border: "border-amber-400",
      indicator: "bg-amber-500",
      icon: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/20",
    },
  };

  const config = severityConfig[alert.level];

  const parameterIcons: Record<string, React.ReactNode> = {
    "Wind Speed": <Wind className="w-5 h-5" />,
    "Wind Gust": <Wind className="w-5 h-5" />,
    "Ambient Pressure": <Activity className="w-5 h-5" />,
    "Rainfall": <Droplets className="w-5 h-5" />,
    "Ambient Temperature": <Thermometer className="w-5 h-5" />,
    "Relative Humidity": <Droplets className="w-5 h-5" />,
    "Air Density": <Cloud className="w-5 h-5" />,
    "Cloud Cover": <Cloud className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header - LOCKED */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Alerts
          </button>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${config.bg}`}>
                {alert.level === "Critical" && <Shield className={`w-7 h-7 ${config.icon}`} />}
                {alert.level === "High" && <Zap className={`w-7 h-7 ${config.icon}`} />}
                {alert.level === "Medium" && <AlertTriangle className={`w-7 h-7 ${config.icon}`} />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {alert.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {alert.timestamp}
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold tracking-wide ${config.badge}`}>
              {alert.level.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Content - REDESIGNED */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alert Overview - Redesigned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Alert Overview
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Status Cards Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Location Card */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Location
                      </span>
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${config.indicator} animate-pulse`} />
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {alert.location}
                      </p>
                    </div>
                  </div>

                  {/* Status Card */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Status
                      </span>
                      {alert.status === "Active" && <Activity className="w-4 h-4 text-blue-500 animate-pulse" />}
                    </div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {alert.status}
                    </p>
                  </div>
                </div>

                {/* Zone - Full Width */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Zone
                    </span>
                    <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {alert.zone}
                  </p>
                </div>

                {/* Risk Score - Enhanced Visual */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-6 border-2 border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block mb-1">
                        Risk Score
                      </span>
                      <span className={`text-4xl font-black ${
                        alert.riskScore >= 95 ? "text-red-600 dark:text-red-500" : 
                        alert.riskScore >= 80 ? "text-orange-600 dark:text-orange-500" : 
                        "text-amber-600 dark:text-amber-500"
                      }`}>
                        {alert.riskScore}
                      </span>
                      <span className="text-lg font-bold text-gray-400 dark:text-gray-500">/100</span>
                    </div>
                    <div className={`p-4 rounded-2xl ${
                      alert.riskScore >= 95 ? "bg-red-600" : 
                      alert.riskScore >= 80 ? "bg-orange-600" : 
                      "bg-amber-600"
                    }`}>
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-white dark:bg-gray-800 rounded-full h-2.5 overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${alert.riskScore}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`h-full rounded-full shadow-lg ${
                          alert.riskScore >= 95 ? "bg-gradient-to-r from-red-600 to-red-500" : 
                          alert.riskScore >= 80 ? "bg-gradient-to-r from-orange-600 to-orange-500" : 
                          "bg-gradient-to-r from-amber-600 to-amber-500"
                        }`}
                      />
                    </div>
                    {/* Risk Level Markers */}
                    <div className="flex justify-between mt-2 text-[9px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                      <span>Critical</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Affected Parameters - Redesigned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Affected Weather Parameters
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {alert.affectedParameters.map((param, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-850 p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${config.bg} group-hover:scale-110 transition-transform duration-300`}>
                          {parameterIcons[param] || <Activity className="w-5 h-5" />}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {param}
                        </span>
                      </div>
                      {/* Decorative Element */}
                      <div className={`absolute -bottom-1 -right-1 w-16 h-16 ${config.indicator} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Forecast Timeline - Redesigned */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Forecast Timeline
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-5">
                  {/* Next Hour */}
                  <div className="relative pl-7">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400" />
                    <div className="absolute left-[-7px] top-1 w-4 h-4 rounded-full bg-blue-600 border-[3px] border-white dark:border-gray-900 shadow-lg shadow-blue-600/50 animate-pulse" />
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          Next Hour
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                        {alert.forecast.nextHour}
                      </p>
                    </div>
                  </div>

                  {/* Next 3 Hours */}
                  <div className="relative pl-7">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300" />
                    <div className="absolute left-[-7px] top-1 w-4 h-4 rounded-full bg-blue-500 border-[3px] border-white dark:border-gray-900 shadow-md" />
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-950/20 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Next 3 Hours
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                        {alert.forecast.next3Hours}
                      </p>
                    </div>
                  </div>

                  {/* Next 6 Hours */}
                  <div className="relative pl-7">
                    <div className="absolute left-[-7px] top-1 w-4 h-4 rounded-full bg-blue-400 border-[3px] border-white dark:border-gray-900 shadow-sm" />
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3.5 h-3.5 text-blue-400 dark:text-blue-500" />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Next 6 Hours
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                        {alert.forecast.next6Hours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Historical Data - Redesigned */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Historical Data
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Total Occurrences */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 p-5 border border-purple-200 dark:border-purple-800">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-2">
                    Total Occurrences
                  </span>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-black text-purple-900 dark:text-purple-100">
                      {alert.historicalData.occurrences}
                    </p>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                      events
                    </span>
                  </div>
                  <TrendingUp className="absolute bottom-3 right-4 w-6 h-6 text-purple-300 dark:text-purple-700" />
                </div>

                {/* Last Occurrence */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 p-4 border border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                    Last Occurrence
                  </span>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {alert.historicalData.lastOccurrence}
                  </p>
                </div>

                {/* Average Duration */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 p-4 border border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                    Average Duration
                  </span>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {alert.historicalData.averageDuration}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}