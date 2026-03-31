import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Thermometer,
  Wind,
  Droplets,
  Cloud,
  Sun,
  BarChart2,
  Activity,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Zap,
  Building2,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
  Mail,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  useAlertManagement,
  type AlertParameter,
  type AlertOperator,
  type AlertSeverity,
} from "../AlertManagementContext";
import { useRole } from "../RoleContext";

/* ══════════════════════════════════════════════════════════
   ALERT CREATION MODULE — Single-Page Professional Design
   Clean, minimal UI matching enterprise standards
   ══════════════════════════════════════════════════════════ */

interface AlertCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Parameter Options ────────────────────────────────────
const PARAM_LIST: {
  value: AlertParameter;
  label: string;
  unit: string;
  icon: React.ElementType;
  color: string;
  description: string;
  defaultThreshold: number;
  min: number;
  max: number;
}[] = [
  {
    value: "temperature",
    label: "Temperature",
    unit: "°C",
    icon: Thermometer,
    color: "#ef4444",
    description: "Ambient air temperature",
    defaultThreshold: 40,
    min: -20,
    max: 55,
  },
  {
    value: "windSpeed",
    label: "Wind Speed",
    unit: "km/h",
    icon: Wind,
    color: "#06b6d4",
    description: "Surface wind velocity",
    defaultThreshold: 45,
    min: 0,
    max: 120,
  },
  {
    value: "rainfall",
    label: "Rainfall",
    unit: "mm",
    icon: Droplets,
    color: "#3b82f6",
    description: "Accumulated precipitation",
    defaultThreshold: 80,
    min: 0,
    max: 300,
  },
  {
    value: "humidity",
    label: "Humidity",
    unit: "%",
    icon: Activity,
    color: "#8b5cf6",
    description: "Relative humidity level",
    defaultThreshold: 85,
    min: 0,
    max: 100,
  },
  {
    value: "cloudCover",
    label: "Cloud Cover",
    unit: "%",
    icon: Cloud,
    color: "#64748b",
    description: "Cloud sky coverage",
    defaultThreshold: 70,
    min: 0,
    max: 100,
  },
  {
    value: "solarIrradiance",
    label: "Solar Irradiance",
    unit: "W/m²",
    icon: Sun,
    color: "#f59e0b",
    description: "Solar radiation",
    defaultThreshold: 200,
    min: 0,
    max: 1200,
  },
  {
    value: "forecastError",
    label: "Forecast Error",
    unit: "%",
    icon: BarChart2,
    color: "#10b981",
    description: "Forecast deviation",
    defaultThreshold: 15,
    min: 0,
    max: 50,
  },
];

// ─── Severity Options ─────────────────────────────────────
const SEVERITY_LIST: {
  value: AlertSeverity;
  label: string;
  color: string;
  icon: React.ElementType;
}[] = [
  { value: "info", label: "Informational", color: "#3b82f6", icon: Sparkles },
  { value: "warning", label: "Warning", color: "#f59e0b", icon: AlertTriangle },
  { value: "critical", label: "Critical", color: "#ef4444", icon: Info },
];

// ─── Location Options ─────────────────────────────────────
const UTILITY_LOCATIONS: Record<
  string,
  { id: string; name: string; region: string }[]
> = {
  "Mumbai Distribution": [
    { id: "mumbai-colaba", name: "Colaba Substation", region: "South Mumbai" },
    {
      id: "mumbai-andheri",
      name: "Andheri West Substation",
      region: "West Mumbai",
    },
    {
      id: "mumbai-bandra",
      name: "Bandra East Feeder",
      region: "Central Mumbai",
    },
    { id: "mumbai-powai", name: "Powai Substation", region: "North Mumbai" },
    {
      id: "mumbai-dadar",
      name: "Dadar Power Station",
      region: "Central Mumbai",
    },
  ],
  "Renewables - Solar": [
    { id: "sol-1", name: "Charanka Solar Park", region: "North Gujarat" },
    { id: "sol-2", name: "Dholera Solar Zone", region: "South Gujarat" },
    { id: "sol-3", name: "Raghanesda Solar Farm", region: "Central Gujarat" },
    { id: "sol-4", name: "Bhadla Solar Park", region: "Rajasthan" },
  ],
  "Renewables - Wind": [
    {
      id: "wnd-1",
      name: "Muppandal Wind Farm",
      region: "Kanyakumari District",
    },
    {
      id: "wnd-2",
      name: "Kayathar Wind Park",
      region: "Thoothukudi District",
    },
    {
      id: "wnd-3",
      name: "Aralvaimozhi Corridor",
      region: "Tamil Nadu Coast",
    },
    { id: "wnd-4", name: "Kutch Wind Cluster", region: "Gujarat Coast" },
  ],
  "Delhi Distribution": [
    { id: "delhi-cp", name: "Connaught Place", region: "Central Delhi" },
    { id: "delhi-dwarka", name: "Dwarka Sector 12", region: "West Delhi" },
    { id: "delhi-rohini", name: "Rohini Zone", region: "North Delhi" },
    { id: "delhi-noida", name: "Noida Interface", region: "East Delhi" },
  ],
  "Mundra UMPP": [
    { id: "mundra-1", name: "Unit 1–2 Block", region: "Mundra Port Area" },
    { id: "mundra-2", name: "Unit 3–4 Block", region: "Mundra Port Area" },
    { id: "mundra-sw", name: "Solar Wing East", region: "Mundra Outskirts" },
  ],
  "Maithon Power": [
    { id: "maithon-1", name: "Thermal Unit 1", region: "Jharkhand" },
    { id: "maithon-2", name: "Thermal Unit 2", region: "Jharkhand" },
    { id: "maithon-h", name: "Hydro Station", region: "Damodar River" },
  ],
};

// ─── Condition Interface ──────────────────────────────────
interface Condition {
  id: string;
  operator: AlertOperator;
  threshold: number;
  thresholdMax?: number;
}

// ─── Main Component ───────────────────────────────────────
export function AlertCreationModal({
  isOpen,
  onClose,
}: AlertCreationModalProps) {
  const { createAlert } = useAlertManagement();
  const { user, activeUtility } = useRole();

  // Form State
  const [alertName, setAlertName] = useState("");
  const [selectedParam, setSelectedParam] =
    useState<AlertParameter>("temperature");
  const [severity, setSeverity] = useState<AlertSeverity>("warning");

  // Multiple conditions support
  const [conditions, setConditions] = useState<Condition[]>([
    {
      id: "cond-1",
      operator: "greaterThan",
      threshold: 40,
      thresholdMax: undefined,
    },
  ]);

  // Multi-select locations
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Email notification configuration
  const [emailNotification, setEmailNotification] = useState({
    enabled: true,
    recipients: "",
    ccRecipients: "",
    subject: "",
  });

  // UI State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Derived values
  const paramData = PARAM_LIST.find((p) => p.value === selectedParam)!;
  const ParamIcon = paramData.icon;
  const sitesForUtility = UTILITY_LOCATIONS[activeUtility] || [];

  // Update threshold when parameter changes
  useEffect(() => {
    setConditions([
      {
        id: "cond-1",
        operator: "greaterThan",
        threshold: paramData.defaultThreshold,
        thresholdMax: undefined,
      },
    ]);
  }, [selectedParam, paramData.defaultThreshold]);

  // Add new condition
  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        id: `cond-${Date.now()}`,
        operator: "greaterThan",
        threshold: paramData.defaultThreshold,
        thresholdMax: undefined,
      },
    ]);
  };

  // Remove condition
  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((c) => c.id !== id));
    }
  };

  // Update condition
  const updateCondition = (id: string, field: string, value: any) => {
    setConditions(
      conditions.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // Toggle location selection
  const toggleLocation = (locationId: string) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId]
    );
    if (errors.location) {
      setErrors((p) => ({ ...p, location: "" }));
    }
  };

  // Select all locations
  const selectAllLocations = () => {
    if (selectedLocations.length === sitesForUtility.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(sitesForUtility.map((s) => s.id));
    }
  };

  // Validation & Submit
  const handleSubmit = () => {
    const errs: Record<string, string> = {};

    if (!alertName.trim()) errs.alertName = "Alert name is required";
    if (selectedLocations.length === 0)
      errs.location = "Please select at least one location";
    if (emailNotification.enabled && !emailNotification.recipients.trim()) {
      errs.emailRecipients =
        "Email recipients are required when notifications are enabled";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      // Use the first condition for now (can be extended to support multiple)
      const primaryCondition = conditions[0];

      createAlert({
        name: alertName.trim(),
        utility: activeUtility,
        parameter: selectedParam,
        operator: primaryCondition.operator,
        threshold: primaryCondition.threshold,
        thresholdMax: primaryCondition.thresholdMax,
        locations: selectedLocations,
        timeHorizon: "realtime",
        severity,
        createdBy: user.name,
        isActive: true,
      });
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  // Reset & Close
  const resetAndClose = () => {
    setAlertName("");
    setSelectedParam("temperature");
    setSeverity("warning");
    setConditions([
      {
        id: "cond-1",
        operator: "greaterThan",
        threshold: 40,
        thresholdMax: undefined,
      },
    ]);
    setSelectedLocations([]);
    setEmailNotification({
      enabled: true,
      recipients: "",
      ccRecipients: "",
      subject: "",
    });
    setErrors({});
    setSubmitted(false);
    setSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="acm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={!submitting && !submitted ? resetAndClose : undefined}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            style={{ margin: 0, padding: 0 }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="acm-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-[760px] pointer-events-auto rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              style={{ maxHeight: "90vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                {/* ══ SUCCESS STATE ══ */}
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center py-16 px-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 20,
                        delay: 0.1,
                      }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/25"
                    >
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full mb-4">
                        ✓ Alert Created Successfully
                      </span>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {alertName}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-8">
                        Your alert is now active and monitoring{" "}
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {selectedLocations.length} location
                          {selectedLocations.length > 1 ? "s" : ""}
                        </span>
                      </p>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={resetAndClose}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                      >
                        Done
                      </motion.button>
                    </motion.div>
                  </motion.div>
                ) : (
                  /* ══ FORM STATE ══ */
                  <motion.div key="form" className="flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-foreground">
                            Create Alert
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Configure weather monitoring alert
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={resetAndClose}
                        disabled={submitting}
                        className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Form Content */}
                    <div
                      className="overflow-y-auto p-6 space-y-6"
                      style={{ maxHeight: "calc(90vh - 180px)" }}
                    >
                      {/* Alert Name */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          Alert Name{" "}
                          <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          value={alertName}
                          onChange={(e) => {
                            setAlertName(e.target.value);
                            if (errors.alertName)
                              setErrors((p) => ({ ...p, alertName: "" }));
                          }}
                          placeholder="e.g., High Temperature Alert — Mumbai Substation"
                          maxLength={80}
                          autoFocus
                          className={`w-full px-4 py-3 rounded-lg border text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 transition-all ${
                            errors.alertName
                              ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                              : "border-slate-200 dark:border-slate-700 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500"
                          }`}
                        />
                        {errors.alertName && (
                          <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.alertName}
                          </p>
                        )}
                      </div>

                      {/* Parameter Selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          Weather Parameter{" "}
                          <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <div className="relative">
                          <ParamIcon
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10"
                            style={{ color: paramData.color }}
                          />
                          <select
                            value={selectedParam}
                            onChange={(e) =>
                              setSelectedParam(
                                e.target.value as AlertParameter
                              )
                            }
                            className="w-full pl-11 pr-10 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                          >
                            {PARAM_LIST.map((param) => (
                              <option key={param.value} value={param.value}>
                                {param.label} ({param.unit})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {paramData.description}
                        </p>
                      </div>

                      {/* Severity Selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          Severity Level{" "}
                          <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {SEVERITY_LIST.map((sev) => {
                            const SevIcon = sev.icon;
                            const isSelected = severity === sev.value;
                            return (
                              <motion.button
                                key={sev.value}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSeverity(sev.value)}
                                className={`flex flex-col items-center gap-2.5 p-4 rounded-lg border-2 transition-all ${
                                  isSelected
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-sm"
                                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                                }`}
                              >
                                <SevIcon
                                  className="w-5 h-5"
                                  style={{ color: sev.color }}
                                />
                                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                  {sev.label}
                                </span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Multiple Conditions */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                            Conditions{" "}
                            <span className="text-red-500 ml-0.5">*</span>
                          </label>
                          {conditions.length < 5 && (
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={addCondition}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Condition
                            </motion.button>
                          )}
                        </div>

                        {conditions.map((condition, index) => (
                          <motion.div
                            key={condition.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                Condition {index + 1}
                              </span>
                              {conditions.length > 1 && (
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removeCondition(condition.id)}
                                  className="w-6 h-6 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center text-red-500 dark:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </motion.button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {/* Operator */}
                              <div>
                                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1.5 block">
                                  Trigger When
                                </label>
                                <div className="relative">
                                  <select
                                    value={condition.operator}
                                    onChange={(e) =>
                                      updateCondition(
                                        condition.id,
                                        "operator",
                                        e.target.value as AlertOperator
                                      )
                                    }
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 appearance-none cursor-pointer"
                                  >
                                    <option value="greaterThan">
                                      Maximum ({">"}){" "}
                                    </option>
                                    <option value="lessThan">
                                      Minimum ({"<"}){" "}
                                    </option>
                                    <option value="between">
                                      Within Range
                                    </option>
                                  </select>
                                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                              </div>

                              {/* Threshold Value(s) */}
                              {condition.operator === "between" ? (
                                <>
                                  <div>
                                    <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1.5 block">
                                      Min Value
                                    </label>
                                    <div className="relative">
                                      <input
                                        type="number"
                                        value={condition.threshold}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          if (
                                            val >= paramData.min &&
                                            val <= paramData.max
                                          ) {
                                            updateCondition(
                                              condition.id,
                                              "threshold",
                                              val
                                            );
                                          }
                                        }}
                                        min={paramData.min}
                                        max={paramData.max}
                                        className="w-full px-3.5 py-2.5 pr-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500"
                                      />
                                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                                        {paramData.unit}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1.5 block">
                                      Max Value
                                    </label>
                                    <div className="relative">
                                      <input
                                        type="number"
                                        value={
                                          condition.thresholdMax ||
                                          paramData.defaultThreshold + 10
                                        }
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          if (
                                            val >= paramData.min &&
                                            val <= paramData.max
                                          ) {
                                            updateCondition(
                                              condition.id,
                                              "thresholdMax",
                                              val
                                            );
                                          }
                                        }}
                                        min={paramData.min}
                                        max={paramData.max}
                                        className="w-full px-3.5 py-2.5 pr-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500"
                                      />
                                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                                        {paramData.unit}
                                      </span>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1.5 block">
                                    Threshold Value
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      value={condition.threshold}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (
                                          val >= paramData.min &&
                                          val <= paramData.max
                                        ) {
                                          updateCondition(
                                            condition.id,
                                            "threshold",
                                            val
                                          );
                                        }
                                      }}
                                      min={paramData.min}
                                      max={paramData.max}
                                      className="w-full px-3.5 py-2.5 pr-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500"
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                                      {paramData.unit}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Visual Indicator */}
                            <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              <p className="text-xs text-slate-600 dark:text-slate-300 text-center">
                                Alert triggers when{" "}
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                  {paramData.label}{" "}
                                  {condition.operator === "greaterThan"
                                    ? ">"
                                    : condition.operator === "lessThan"
                                    ? "<"
                                    : "between"}{" "}
                                  {condition.threshold}
                                  {paramData.unit}
                                  {condition.operator === "between" &&
                                    ` and ${
                                      condition.thresholdMax ||
                                      paramData.defaultThreshold + 10
                                    }${paramData.unit}`}
                                </span>
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Multi-Select Location */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          <MapPin className="w-3.5 h-3.5" />
                          Target Locations{" "}
                          <span className="text-red-500 ml-0.5">*</span>
                        </label>

                        {sitesForUtility.length > 0 ? (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {selectedLocations.length} of{" "}
                                {sitesForUtility.length} selected
                              </span>
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={selectAllLocations}
                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {selectedLocations.length ===
                                sitesForUtility.length
                                  ? "Deselect All"
                                  : "Select All"}
                              </motion.button>
                            </div>

                            <div className="max-h-48 overflow-y-auto p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
                              {sitesForUtility.map((site) => {
                                const isSelected =
                                  selectedLocations.includes(site.id);
                                return (
                                  <motion.label
                                    key={site.id}
                                    whileHover={{ scale: 1.01 }}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                      isSelected
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50"
                                    }`}
                                  >
                                    <div
                                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                        isSelected
                                          ? "border-blue-500 bg-blue-500"
                                          : "border-slate-300 dark:border-slate-600"
                                      }`}
                                    >
                                      {isSelected && (
                                        <Check className="w-3 h-3 text-white" />
                                      )}
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleLocation(site.id)}
                                      className="sr-only"
                                    />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {site.name}
                                      </div>
                                      <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {site.region}
                                      </div>
                                    </div>
                                    <Building2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                  </motion.label>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              No locations available for this utility
                            </p>
                          </div>
                        )}

                        {errors.location && (
                          <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.location}
                          </p>
                        )}
                      </div>

                      {/* Email Notification Configuration */}
                      <div className="space-y-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-950/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                              Email Notifications
                            </label>
                          </div>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setEmailNotification((prev) => ({
                                ...prev,
                                enabled: !prev.enabled,
                              }))
                            }
                            className={`relative w-12 h-6 rounded-full transition-all ${
                              emailNotification.enabled
                                ? "bg-blue-500"
                                : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          >
                            <motion.div
                              layout
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md ${
                                emailNotification.enabled
                                  ? "left-[26px]"
                                  : "left-0.5"
                              }`}
                            />
                          </motion.button>
                        </div>

                        <AnimatePresence>
                          {emailNotification.enabled && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-3"
                            >
                              {/* Recipients */}
                              <div>
                                <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1.5 block">
                                  To (Recipients){" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={emailNotification.recipients}
                                  onChange={(e) => {
                                    setEmailNotification((prev) => ({
                                      ...prev,
                                      recipients: e.target.value,
                                    }));
                                    if (errors.emailRecipients) {
                                      setErrors((p) => ({
                                        ...p,
                                        emailRecipients: "",
                                      }));
                                    }
                                  }}
                                  placeholder="email1@example.com, email2@example.com"
                                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 transition-all ${
                                    errors.emailRecipients
                                      ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                                      : "border-slate-200 dark:border-slate-700 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500"
                                  }`}
                                />
                                {errors.emailRecipients && (
                                  <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.emailRecipients}
                                  </p>
                                )}
                              </div>

                              {/* CC Recipients */}
                              <div>
                                <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1.5 block">
                                  CC (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={emailNotification.ccRecipients}
                                  onChange={(e) =>
                                    setEmailNotification((prev) => ({
                                      ...prev,
                                      ccRecipients: e.target.value,
                                    }))
                                  }
                                  placeholder="cc1@example.com, cc2@example.com"
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 transition-all"
                                />
                              </div>

                              {/* Custom Subject */}
                              <div>
                                <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1.5 block">
                                  Custom Subject (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={emailNotification.subject}
                                  onChange={(e) =>
                                    setEmailNotification((prev) => ({
                                      ...prev,
                                      subject: e.target.value,
                                    }))
                                  }
                                  placeholder="Leave empty for default subject"
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 transition-all"
                                />
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                  Default: "[Alert Name] - Threshold Exceeded"
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={resetAndClose}
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Creating...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Create Alert
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
