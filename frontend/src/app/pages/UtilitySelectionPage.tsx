import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useUtilityContext, getUtilityIdFromName } from "../components/UtilityContext";
import { useRole } from "../components/RoleContext";
import {
  Building2,
  MapPin,
  Sun,
  Wind,
  Factory,
  ChevronRight,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Grid3x3,
  LayoutGrid,
} from "lucide-react";
import { motion } from "motion/react";

/* ═══════════════════════════════════════════════════
   UTILITY SELECTION LANDING PAGE
   iOS-inspired glassmorphism design for selecting utilities
   ═══════════════════════════════════════════════════ */

interface UtilityCardData {
  id: string;
  name: string;
  type: "Distribution" | "Renewable" | "Generation";
  region: string;
  weatherStatus: {
    condition: "Clear" | "Cloudy" | "Rainy" | "Stormy";
    temperature: number;
    trend: "up" | "down" | "stable";
  };
  icon: React.ComponentType<any>;
  gradient: string;
}

// Comprehensive utility data
const UTILITY_CARDS: UtilityCardData[] = [
  {
    id: "mumbai",
    name: "Mumbai Distribution",
    type: "Distribution",
    region: "Maharashtra",
    weatherStatus: {
      condition: "Cloudy",
      temperature: 28,
      trend: "stable",
    },
    icon: Building2,
    gradient: "from-blue-500/20 to-blue-600/20",
  },
  {
    id: "delhi",
    name: "Delhi Distribution",
    type: "Distribution",
    region: "Delhi NCR",
    weatherStatus: {
      condition: "Clear",
      temperature: 32,
      trend: "up",
    },
    icon: Building2,
    gradient: "from-amber-500/20 to-amber-600/20",
  },
  {
    id: "karnataka-solar",
    name: "Renewables - Solar",
    type: "Renewable",
    region: "Karnataka",
    weatherStatus: {
      condition: "Clear",
      temperature: 35,
      trend: "up",
    },
    icon: Sun,
    gradient: "from-yellow-500/20 to-orange-600/20",
  },
  {
    id: "gujarat-wind",
    name: "Renewables - Wind",
    type: "Renewable",
    region: "Gujarat",
    weatherStatus: {
      condition: "Cloudy",
      temperature: 29,
      trend: "down",
    },
    icon: Wind,
    gradient: "from-teal-500/20 to-teal-600/20",
  },
  {
    id: "rajasthan",
    name: "Mundra UMPP",
    type: "Generation",
    region: "Gujarat",
    weatherStatus: {
      condition: "Clear",
      temperature: 38,
      trend: "up",
    },
    icon: Factory,
    gradient: "from-purple-500/20 to-purple-600/20",
  },
  {
    id: "maithon",
    name: "Maithon Power",
    type: "Generation",
    region: "Jharkhand",
    weatherStatus: {
      condition: "Rainy",
      temperature: 24,
      trend: "down",
    },
    icon: Zap,
    gradient: "from-green-500/20 to-green-600/20",
  },
];

export function UtilitySelectionPage() {
  const navigate = useNavigate();
  const { setFromLanding } = useUtilityContext();
  const { user, can } = useRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"All" | "Distribution" | "Renewable" | "Generation">("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter utilities based on search and type
  const filteredUtilities = useMemo(() => {
    return UTILITY_CARDS.filter((utility) => {
      const matchesSearch = utility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           utility.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "All" || utility.type === selectedType;
      
      // RBAC: Admin and Operator can only see their assigned utility
      if (user.role === "admin" || user.role === "operator") {
        return matchesSearch && matchesType && utility.name === user.utility;
      }
      
      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedType, user]);

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "Clear":
        return Sun;
      case "Cloudy":
        return Cloud;
      case "Rainy":
        return CloudRain;
      case "Stormy":
        return CloudSnow;
      default:
        return Cloud;
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return TrendingUp;
      case "down":
        return TrendingDown;
      default:
        return Minus;
    }
  };

  // Handle utility selection
  const handleSelectUtility = (utility: UtilityCardData) => {
    // Set the utility context
    setFromLanding({
      id: utility.id,
      name: utility.name,
    });

    // Redirect to Command Center dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header Section */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-foreground mb-1">Select Utility</h1>
              <p className="text-[13px] text-muted-foreground">
                Choose a utility to access the Command Center dashboard
              </p>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-xl">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[13px] font-bold text-primary">
                  {user.initials}
                </span>
              </div>
              <div>
                <div className="text-[12px] font-semibold text-foreground">
                  {user.name}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {user.title}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Search & View Toggle */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search utilities by name or region..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-[13px] rounded-xl border border-border bg-card/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-muted/50 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-md text-[12px] font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-md text-[12px] font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {(["All", "Distribution", "Renewable", "Generation"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-all ${
                  selectedType === type
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border"
                }`}
              >
                {type}
                {type === "All" && (
                  <span className="ml-1.5 text-[10px] opacity-70">
                    ({UTILITY_CARDS.length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Utilities Grid/List */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredUtilities.map((utility, index) => {
            const Icon = utility.icon;
            const WeatherIcon = getWeatherIcon(utility.weatherStatus.condition);
            const TrendIcon = getTrendIcon(utility.weatherStatus.trend);

            return (
              <motion.button
                key={utility.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectUtility(utility)}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${utility.gradient} backdrop-blur-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ${
                  viewMode === "grid" ? "p-6" : "p-5 flex items-center gap-4"
                }`}
              >
                {/* Glassmorphic Overlay */}
                <div className="absolute inset-0 bg-card/60 backdrop-blur-md" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {viewMode === "grid" ? (
                    <>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                        </div>

                        {/* Type Badge */}
                        <div className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-card/80 backdrop-blur-sm border border-border text-foreground">
                          {utility.type}
                        </div>
                      </div>

                      {/* Utility Info */}
                      <div className="flex-1 mb-4">
                        <h3 className="text-[16px] font-bold text-foreground mb-1">
                          {utility.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{utility.region}</span>
                        </div>
                      </div>

                      {/* Weather Status */}
                      <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-card/60 backdrop-blur-sm flex items-center justify-center">
                              <WeatherIcon className="w-4 h-4 text-foreground" />
                            </div>
                            <div>
                              <div className="text-[11px] text-muted-foreground">
                                {utility.weatherStatus.condition}
                              </div>
                              <div className="text-[13px] font-bold text-foreground">
                                {utility.weatherStatus.temperature}°C
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <TrendIcon
                              className={`w-4 h-4 ${
                                utility.weatherStatus.trend === "up"
                                  ? "text-red-500"
                                  : utility.weatherStatus.trend === "down"
                                  ? "text-blue-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Arrow Indicator */}
                      <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-primary" />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View Layout */}
                      <div className="flex items-center gap-4 flex-1">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left">
                          <h3 className="text-[14px] font-bold text-foreground mb-0.5">
                            {utility.name}
                          </h3>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{utility.region}</span>
                            </div>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                            <span className="px-2 py-0.5 rounded-full bg-card/60 text-[10px] font-semibold">
                              {utility.type}
                            </span>
                          </div>
                        </div>

                        {/* Weather Status */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <WeatherIcon className="w-4 h-4 text-foreground" />
                            <div className="text-right">
                              <div className="text-[11px] text-muted-foreground">
                                {utility.weatherStatus.condition}
                              </div>
                              <div className="text-[12px] font-bold text-foreground">
                                {utility.weatherStatus.temperature}°C
                              </div>
                            </div>
                          </div>

                          <TrendIcon
                            className={`w-4 h-4 ${
                              utility.weatherStatus.trend === "up"
                                ? "text-red-500"
                                : utility.weatherStatus.trend === "down"
                                ? "text-blue-500"
                                : "text-muted-foreground"
                            }`}
                          />

                          <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredUtilities.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-[16px] font-semibold text-foreground mb-2">
              No utilities found
            </h3>
            <p className="text-[13px] text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-[12px] font-semibold text-foreground mb-1">
                Utility Selection Guide
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed">
                Select a utility to access its Command Center dashboard with real-time weather monitoring,
                forecast analytics, and operational insights. You can switch between utilities anytime from
                the header navigation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
