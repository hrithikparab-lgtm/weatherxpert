import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   ALERT MANAGEMENT CONTEXT
   Centralized state management for the Alert System
   ═══════════════════════════════════════════════════ */

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertStatus = "created" | "active";
export type AlertParameter = "temperature" | "humidity" | "windSpeed" | "rainfall" | "cloudCover" | "solarIrradiance" | "forecastError";
export type AlertOperator = "greaterThan" | "lessThan" | "between";
export type TimeHorizon = "realtime" | "15min" | "hourly" | "dayAhead";

export interface AlertRule {
  id: string;
  name: string;
  utility: string;
  parameter: AlertParameter;
  operator: AlertOperator;
  threshold: number;
  thresholdMax?: number; // For 'between' operator
  locations: string[]; // Array of location IDs
  timeHorizon: TimeHorizon;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  createdBy: string;
  triggeredAt?: string;
  isActive: boolean;
  currentValue?: number;
  locationName?: string;
}

interface AlertManagementContextType {
  alerts: AlertRule[];
  newAlertCount: number;
  isModalOpen: boolean;
  createAlert: (alert: Omit<AlertRule, "id" | "createdAt" | "status">) => void;
  updateAlert: (id: string, updates: Partial<AlertRule>) => void;
  deleteAlert: (id: string) => void;
  toggleAlertActive: (id: string) => void;
  triggerAlert: (id: string, value: number, location: string) => void;
  markAlertsAsRead: () => void;
  getActiveAlerts: () => AlertRule[];
  getAlertsByUtility: (utility: string) => AlertRule[];
  openModal: () => void;
  closeModal: () => void;
}

const AlertManagementContext = createContext<AlertManagementContextType | undefined>(undefined);

// Mock initial alerts for demonstration
const INITIAL_ALERTS: AlertRule[] = [
  {
    id: "alert-001",
    name: "High Temperature Alert - Mumbai",
    utility: "Mumbai Distribution",
    parameter: "temperature",
    operator: "greaterThan",
    threshold: 40,
    locations: ["mumbai-colaba", "mumbai-andheri"],
    timeHorizon: "realtime",
    severity: "warning",
    status: "created",
    createdAt: "2026-03-10T08:00:00Z",
    createdBy: "Operator Mumbai",
    isActive: true,
  },
  {
    id: "alert-002",
    name: "Critical Wind Speed - Gujarat Wind Farm",
    utility: "Renewables - Wind",
    parameter: "windSpeed",
    operator: "greaterThan",
    threshold: 45,
    locations: ["wnd-1", "wnd-2", "wnd-3"],
    timeHorizon: "15min",
    severity: "critical",
    status: "active",
    createdAt: "2026-03-10T06:30:00Z",
    createdBy: "Admin Gujarat",
    triggeredAt: "2026-03-11T09:15:00Z",
    isActive: true,
    currentValue: 48.5,
    locationName: "Muppandal Wind Farm",
  },
  {
    id: "alert-003",
    name: "Low Solar Irradiance - Charanka",
    utility: "Renewables - Solar",
    parameter: "solarIrradiance",
    operator: "lessThan",
    threshold: 200,
    locations: ["sol-1"],
    timeHorizon: "hourly",
    severity: "info",
    status: "created",
    createdAt: "2026-03-09T14:20:00Z",
    createdBy: "Operator Solar",
    isActive: true,
  },
];

export function AlertManagementProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertRule[]>(INITIAL_ALERTS);
  const [newAlertCount, setNewAlertCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create new alert
  const createAlert = useCallback((alertData: Omit<AlertRule, "id" | "createdAt" | "status">) => {
    const newAlert: AlertRule = {
      ...alertData,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "created",
    };
    
    setAlerts((prev) => [newAlert, ...prev]);
    
    toast.success("Alert Created Successfully", {
      description: `${newAlert.name} is now being monitored`,
      duration: 4000,
    });
  }, []);

  // Update existing alert
  const updateAlert = useCallback((id: string, updates: Partial<AlertRule>) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, ...updates } : alert
      )
    );
  }, []);

  // Delete alert
  const deleteAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    toast.info("Alert Deleted", {
      description: "Alert rule has been removed",
    });
  }, []);

  // Toggle alert active/inactive
  const toggleAlertActive = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
      )
    );
  }, []);

  // Trigger an alert (change status from created to active)
  const triggerAlert = useCallback((id: string, value: number, location: string) => {
    setAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id === id && alert.status === "created") {
          const updatedAlert = {
            ...alert,
            status: "active" as AlertStatus,
            triggeredAt: new Date().toISOString(),
            currentValue: value,
            locationName: location,
          };

          // Increment new alert count (removed toast notification)
          setNewAlertCount((prev) => prev + 1);

          return updatedAlert;
        }
        return alert;
      })
    );
  }, []);

  // Mark alerts as read
  const markAlertsAsRead = useCallback(() => {
    setNewAlertCount(0);
  }, []);

  // Get active alerts
  const getActiveAlerts = useCallback(() => {
    return alerts.filter((alert) => alert.status === "active" && alert.isActive);
  }, [alerts]);

  // Get alerts by utility
  const getAlertsByUtility = useCallback((utility: string) => {
    return alerts.filter((alert) => alert.utility === utility);
  }, [alerts]);

  // Simulate alert monitoring engine (demo purposes)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly trigger an alert for demo
      const createdAlerts = alerts.filter((a) => a.status === "created" && a.isActive);
      if (createdAlerts.length > 0 && Math.random() > 0.95) {
        const randomAlert = createdAlerts[Math.floor(Math.random() * createdAlerts.length)];
        const mockValue = randomAlert.threshold + Math.random() * 10;
        const mockLocation = randomAlert.locations[0] || "Unknown Location";
        triggerAlert(randomAlert.id, mockValue, mockLocation);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [alerts, triggerAlert]);

  const value: AlertManagementContextType = {
    alerts,
    newAlertCount,
    isModalOpen,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlertActive,
    triggerAlert,
    markAlertsAsRead,
    getActiveAlerts,
    getAlertsByUtility,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
  };

  return (
    <AlertManagementContext.Provider value={value}>
      {children}
    </AlertManagementContext.Provider>
  );
}

export function useAlertManagement() {
  const context = useContext(AlertManagementContext);
  if (context === undefined) {
    throw new Error("useAlertManagement must be used within AlertManagementProvider");
  }
  return context;
}

// Helper function to get parameter labels
function getParameterLabel(parameter: AlertParameter): string {
  const labels: Record<AlertParameter, string> = {
    temperature: "Temperature",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    rainfall: "Rainfall",
    cloudCover: "Cloud Cover",
    solarIrradiance: "Solar Irradiance",
    forecastError: "Forecast Error",
  };
  return labels[parameter];
}