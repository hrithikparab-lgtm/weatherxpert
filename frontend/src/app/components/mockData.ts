import {
  CloudRain,
  CloudSun,
  Sun,
  Wind,
  Thermometer,
  Droplets,
  Gauge,
  Eye,
  Cloud,
  CloudLightning,
  Zap,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import React from "react";

export const UTILITIES_DATA: Record<string, any> = {
  "Mumbai Distribution": {
    location: "Mumbai Metropolitan Region — Station: Colaba AWS",
    current: {
      condition: "Partly Cloudy",
      conditionIcon: "CloudRain", // String reference to map in component
      temp: "34.2",
      feelsLike: "36",
      metrics: [
        { title: "Temperature", value: "34.2", unit: "°C", icon: "Thermometer", trend: "up", trendValue: "+2.1°C", trendLabel: "vs yesterday", status: "warning", subtitle: "Max today: 36.8°C" },
        { title: "Humidity", value: "78", unit: "%", icon: "Droplets", trend: "up", trendValue: "+5%", trendLabel: "last 3 hrs", status: "normal", subtitle: "Dew point: 29°C" },
        { title: "Wind Speed", value: "23", unit: "km/h", icon: "Wind", trend: "up", trendValue: "+8 km/h", trendLabel: "gusting", status: "normal", subtitle: "Direction: SW (225°)" },
        { title: "Pressure", value: "1008", unit: "hPa", icon: "Gauge", trend: "down", trendValue: "-3 hPa", trendLabel: "last 6 hrs", status: "normal", subtitle: "Falling — storm possible" },
        { title: "Visibility", value: "6.5", unit: "km", icon: "Eye", trend: "stable", trendValue: "Stable", trendLabel: "", status: "normal", subtitle: "Moderate haze" },
        { title: "UV Index", value: "8", unit: "/ 11", icon: "Sun", trend: "up", trendValue: "Very High", trendLabel: "", status: "warning", subtitle: "Peak: 11:00-14:00" },
        { title: "Rainfall (24h)", value: "12.4", unit: "mm", icon: "CloudRain", trend: "up", trendValue: "+8.2mm", trendLabel: "last 6 hrs", status: "normal", subtitle: "Monthly: 245mm" },
        { title: "Cloud Cover", value: "65", unit: "%", icon: "Cloud", trend: "up", trendValue: "+20%", trendLabel: "vs morning", status: "normal", subtitle: "Increasing — rain likely" },
      ]
    },
    forecastHourly: [
        { time: "06:00", temp: 28, humidity: 82, rainfall: 0, wind: 12, feelsLike: 30 },
        { time: "07:00", temp: 29, humidity: 80, rainfall: 0, wind: 14, feelsLike: 31 },
        { time: "08:00", temp: 30, humidity: 78, rainfall: 0, wind: 15, feelsLike: 33 },
        { time: "09:00", temp: 31, humidity: 76, rainfall: 0, wind: 18, feelsLike: 34 },
        { time: "10:00", temp: 33, humidity: 74, rainfall: 0, wind: 20, feelsLike: 36 },
        { time: "11:00", temp: 34, humidity: 72, rainfall: 0, wind: 22, feelsLike: 37 },
        { time: "12:00", temp: 34.2, humidity: 78, rainfall: 2, wind: 23, feelsLike: 36 },
        { time: "13:00", temp: 33, humidity: 80, rainfall: 8, wind: 28, feelsLike: 35 },
        { time: "14:00", temp: 31, humidity: 85, rainfall: 15, wind: 32, feelsLike: 33 },
        { time: "15:00", temp: 30, humidity: 88, rainfall: 22, wind: 35, feelsLike: 32 },
        { time: "16:00", temp: 29, humidity: 86, rainfall: 12, wind: 30, feelsLike: 31 },
        { time: "17:00", temp: 28, humidity: 84, rainfall: 5, wind: 25, feelsLike: 30 },
        { time: "18:00", temp: 27, humidity: 82, rainfall: 2, wind: 20, feelsLike: 29 },
        { time: "19:00", temp: 27, humidity: 80, rainfall: 0, wind: 16, feelsLike: 28 },
        { time: "20:00", temp: 26, humidity: 79, rainfall: 0, wind: 14, feelsLike: 27 },
        { time: "21:00", temp: 26, humidity: 78, rainfall: 0, wind: 12, feelsLike: 27 },
    ],
    forecastDaily: [
        { day: "Today", date: "Feb 11", icon: "CloudRain", condition: "Thunderstorm", high: 34, low: 27, rainfall: 66, rainProbability: 85, wind: 35, humidity: 82 },
        { day: "Thu", date: "Feb 12", icon: "CloudSun", condition: "Partly Cloudy", high: 33, low: 26, rainfall: 8, rainProbability: 40, wind: 20, humidity: 75 },
        { day: "Fri", date: "Feb 13", icon: "Sun", condition: "Sunny", high: 35, low: 27, rainfall: 0, rainProbability: 10, wind: 15, humidity: 65 },
        { day: "Sat", date: "Feb 14", icon: "Sun", condition: "Clear", high: 36, low: 28, rainfall: 0, rainProbability: 5, wind: 12, humidity: 60 },
        { day: "Sun", date: "Feb 15", icon: "Cloud", condition: "Overcast", high: 32, low: 26, rainfall: 2, rainProbability: 30, wind: 18, humidity: 78 },
        { day: "Mon", date: "Feb 16", icon: "CloudLightning", condition: "Storm", high: 30, low: 25, rainfall: 45, rainProbability: 80, wind: 40, humidity: 88 },
        { day: "Tue", date: "Feb 17", icon: "CloudRain", condition: "Rainy", high: 29, low: 24, rainfall: 30, rainProbability: 70, wind: 28, humidity: 85 },
    ],
    accuracy: {
      overall: "87.2%",
      onTarget: "5/6",
      vsLast: "+2.1%",
      data: [
        { parameter: "Temp", accuracy: 94.2, target: 90 },
        { parameter: "Humidity", accuracy: 88.5, target: 85 },
        { parameter: "Wind", accuracy: 82.1, target: 80 },
        { parameter: "Rainfall", accuracy: 76.8, target: 75 },
        { parameter: "Cloud", accuracy: 85.3, target: 80 },
        { parameter: "Pressure", accuracy: 96.1, target: 90 },
      ]
    },
    insights: [
        { id: "1", priority: "high", icon: "Zap", title: "Peak Demand Surge Expected", description: "Temperature spike (34°C+) will drive AC load. Expected demand increase of 150 MW.", action: "Prepare standby generation", impact: "~150 MW load", timeframe: "Next 4 hours" },
        { id: "4", priority: "medium", icon: "CloudLightning", title: "Storm Warning", description: "Thunderstorm likely to affect overhead lines in Northern zone.", action: "Alert field crews", impact: "Grid stability", timeframe: "14:00-18:00" },
    ]
  },
  "Delhi Distribution": {
    location: "Delhi NCR — Station: Safdarjung",
    current: {
      condition: "Clear & Hot",
      conditionIcon: "Sun",
      temp: "42.1",
      feelsLike: "45",
      metrics: [
        { title: "Temperature", value: "42.1", unit: "°C", icon: "Thermometer", trend: "up", trendValue: "+3.5°C", trendLabel: "vs yesterday", status: "critical", subtitle: "Max today: 44.2°C" },
        { title: "Humidity", value: "35", unit: "%", icon: "Droplets", trend: "down", trendValue: "-12%", trendLabel: "dry heat", status: "warning", subtitle: "Dew point: 18°C" },
        { title: "Wind Speed", value: "15", unit: "km/h", icon: "Wind", trend: "stable", trendValue: "Stable", trendLabel: "", status: "normal", subtitle: "Direction: NW (315°)" },
        { title: "Pressure", value: "1002", unit: "hPa", icon: "Gauge", trend: "stable", trendValue: "Stable", trendLabel: "", status: "normal", subtitle: "Low pressure area" },
        { title: "Visibility", value: "4.2", unit: "km", icon: "Eye", trend: "down", trendValue: "Poor", trendLabel: "", status: "warning", subtitle: "Dust haze / Smog" },
        { title: "UV Index", value: "10", unit: "/ 11", icon: "Sun", trend: "up", trendValue: "Extreme", trendLabel: "", status: "critical", subtitle: "Peak: 12:00-15:00" },
        { title: "Rainfall (24h)", value: "0.0", unit: "mm", icon: "CloudRain", trend: "stable", trendValue: "0mm", trendLabel: "", status: "normal", subtitle: "Monthly: 12mm" },
        { title: "AQI", value: "215", unit: "", icon: "Cloud", trend: "up", trendValue: "Poor", trendLabel: "", status: "warning", subtitle: "PM2.5 High" },
      ]
    },
    forecastHourly: [
        { time: "06:00", temp: 30, humidity: 45, rainfall: 0, wind: 10, feelsLike: 32 },
        { time: "07:00", temp: 32, humidity: 42, rainfall: 0, wind: 12, feelsLike: 34 },
        { time: "08:00", temp: 35, humidity: 40, rainfall: 0, wind: 14, feelsLike: 37 },
        { time: "09:00", temp: 38, humidity: 38, rainfall: 0, wind: 15, feelsLike: 40 },
        { time: "10:00", temp: 40, humidity: 36, rainfall: 0, wind: 16, feelsLike: 42 },
        { time: "11:00", temp: 41, humidity: 35, rainfall: 0, wind: 16, feelsLike: 44 },
        { time: "12:00", temp: 42.1, humidity: 35, rainfall: 0, wind: 15, feelsLike: 45 },
        { time: "13:00", temp: 43, humidity: 34, rainfall: 0, wind: 18, feelsLike: 46 },
        { time: "14:00", temp: 44, humidity: 32, rainfall: 0, wind: 20, feelsLike: 47 },
        { time: "15:00", temp: 43, humidity: 33, rainfall: 0, wind: 18, feelsLike: 46 },
        { time: "16:00", temp: 42, humidity: 35, rainfall: 0, wind: 16, feelsLike: 45 },
        { time: "17:00", temp: 40, humidity: 38, rainfall: 0, wind: 15, feelsLike: 43 },
        { time: "18:00", temp: 38, humidity: 40, rainfall: 0, wind: 14, feelsLike: 40 },
        { time: "19:00", temp: 36, humidity: 45, rainfall: 0, wind: 12, feelsLike: 38 },
        { time: "20:00", temp: 34, humidity: 50, rainfall: 0, wind: 10, feelsLike: 36 },
        { time: "21:00", temp: 33, humidity: 55, rainfall: 0, wind: 8, feelsLike: 35 },
    ],
    forecastDaily: [
        { day: "Today", date: "Feb 11", icon: "Sun", condition: "Heat Wave", high: 44, low: 30, rainfall: 0, rainProbability: 0, wind: 15, humidity: 35 },
        { day: "Thu", date: "Feb 12", icon: "Sun", condition: "Hot & Dry", high: 45, low: 31, rainfall: 0, rainProbability: 0, wind: 18, humidity: 32 },
        { day: "Fri", date: "Feb 13", icon: "Sun", condition: "Sunny", high: 43, low: 29, rainfall: 0, rainProbability: 5, wind: 20, humidity: 38 },
        { day: "Sat", date: "Feb 14", icon: "CloudSun", condition: "Partly Cloudy", high: 41, low: 28, rainfall: 0, rainProbability: 10, wind: 22, humidity: 45 },
        { day: "Sun", date: "Feb 15", icon: "Cloud", condition: "Haze", high: 40, low: 28, rainfall: 0, rainProbability: 15, wind: 15, humidity: 50 },
        { day: "Mon", date: "Feb 16", icon: "CloudSun", condition: "Warm", high: 39, low: 27, rainfall: 0, rainProbability: 20, wind: 12, humidity: 55 },
        { day: "Tue", date: "Feb 17", icon: "Sun", condition: "Clear", high: 40, low: 28, rainfall: 0, rainProbability: 0, wind: 10, humidity: 48 },
    ],
    accuracy: {
      overall: "92.5%",
      onTarget: "6/6",
      vsLast: "+4.3%",
      data: [
        { parameter: "Temp", accuracy: 98.1, target: 90 },
        { parameter: "Humidity", accuracy: 92.4, target: 85 },
        { parameter: "Wind", accuracy: 88.7, target: 80 },
        { parameter: "Rainfall", accuracy: 95.0, target: 75 },
        { parameter: "Cloud", accuracy: 90.2, target: 80 },
        { parameter: "Pressure", accuracy: 97.5, target: 90 },
      ]
    },
    insights: [
        { id: "1", priority: "high", icon: "Zap", title: "Extreme Heat Load", description: "Sustained temps >42°C driving record demand. Load shedding risk in Zone 4.", action: "Activate Peaker Plants", impact: "Grid Integrity", timeframe: "13:00-17:00" },
        { id: "2", priority: "medium", icon: "Thermometer", title: "Transformer Warning", description: "Distribution transformers in South Delhi approaching thermal limits.", action: "Increase Cooling", impact: "Asset Protection", timeframe: "Ongoing" },
    ]
  }
};

// Fallback for other utilities
export const DEFAULT_DATA = UTILITIES_DATA["Mumbai Distribution"];

export const ALERT_DATA = [
  {
    id: "1",
    severity: "critical",
    title: "Severe Thunderstorm Warning",
    location: "Mumbai Distribution", // Matches utility name
    time: "12 min ago",
    description: "Heavy rainfall expected (50-80mm/hr). Lightning activity detected. Wind gusts up to 65 km/h.",
  },
  {
    id: "2",
    severity: "warning",
    title: "High Wind Advisory",
    location: "Renewables - Wind",
    time: "35 min ago",
    description: "Sustained winds exceeding 55 km/h expected for next 4 hours. Turbine curtailment may be required.",
  },
  {
    id: "3",
    severity: "advisory",
    title: "Heat Wave Alert",
    location: "Delhi Distribution",
    time: "1 hr ago",
    description: "Temperatures expected to exceed 44°C. Transformer load monitoring recommended.",
  },
  {
    id: "4",
    severity: "warning",
    title: "Solar Flare Activity",
    location: "Renewables - Solar",
    time: "2 hrs ago",
    description: "G3-class geomagnetic storm may affect grid stability and comms.",
  }
];
