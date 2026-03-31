import { useState } from "react";
import {
  Plus, Search, Edit2, RefreshCw, CheckCircle2, AlertTriangle,
  XCircle, Wrench, X, ExternalLink, Clock, Gauge, ArrowUpRight,
  CloudRain, AlertCircle, Loader2, Check
} from "lucide-react";
import { FORECAST_PROVIDERS, type ForecastProvider, type ProviderStatus } from "./settingsData";
import { toast } from "sonner";

const STATUS_STYLE: Record<ProviderStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  active:      { label: "Active",      color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
  degraded:    { label: "Degraded",    color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/10",   border: "border-amber-500/20",   icon: AlertTriangle },
  offline:     { label: "Offline",     color: "text-red-600 dark:text-red-400",         bg: "bg-red-500/10",     border: "border-red-500/20",     icon: XCircle },
  maintenance: { label: "Maintenance", color: "text-muted-foreground",                bg: "bg-secondary",      border: "border-border",         icon: Wrench },
};

const PROVIDER_TYPES = ["Government", "International", "Commercial", "In-house", "Open Source"];
const REFRESH_INTERVALS = ["15m", "30m", "1h", "3h", "6h", "12h", "24h"];
const AVAILABLE_PARAMETERS = [
  "Temperature",
  "Humidity",
  "Wind",
  "Rainfall",
  "Pressure",
  "Cloud Cover",
  "UV Index",
  "Solar Irradiance",
  "Air Density",
  "Precipitation"
];

interface ProvidersTabProps { isMobile: boolean; }

export function ProvidersTab({ isMobile }: ProvidersTabProps) {
  const [providers, setProviders] = useState(FORECAST_PROVIDERS);
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState<ForecastProvider | null>(null);
  const [createModal, setCreateModal] = useState(false);
  
  // Form state for create/edit
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("Commercial");
  const [formEndpoint, setFormEndpoint] = useState("");
  const [formApiKey, setFormApiKey] = useState("");
  const [formRefreshInterval, setFormRefreshInterval] = useState("1h");
  const [formParameters, setFormParameters] = useState<string[]>(["Temperature", "Humidity", "Wind"]);
  const [formStatus, setFormStatus] = useState<ProviderStatus>("active");
  
  // Validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Test connection state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const filtered = search
    ? providers.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : providers;

  // Open create modal
  const openCreate = () => {
    setCreateModal(true);
    setEditModal(null);
    setFormName("");
    setFormType("Commercial");
    setFormEndpoint("");
    setFormApiKey("");
    setFormRefreshInterval("1h");
    setFormParameters(["Temperature", "Humidity", "Wind"]);
    setFormStatus("active");
    setFormErrors({});
    setTestResult(null);
  };

  // Open edit modal
  const openEdit = (provider: ForecastProvider) => {
    setEditModal(provider);
    setCreateModal(false);
    setFormName(provider.name);
    setFormType(provider.type);
    setFormEndpoint(provider.endpoint);
    setFormApiKey(provider.apiKey);
    setFormRefreshInterval(provider.refreshInterval);
    setFormParameters(provider.parameters);
    setFormStatus(provider.status);
    setFormErrors({});
    setTestResult(null);
  };

  // Close modal
  const closeModal = () => {
    setCreateModal(false);
    setEditModal(null);
    setFormErrors({});
    setTestResult(null);
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formName.trim()) errors.name = "Provider name is required";
    if (formName.trim().length < 3) errors.name = "Name must be at least 3 characters";
    
    if (!formEndpoint.trim()) errors.endpoint = "API endpoint is required";
    if (!formEndpoint.startsWith("http://") && !formEndpoint.startsWith("https://")) {
      errors.endpoint = "Endpoint must be a valid URL (http:// or https://)";
    }
    
    if (!formApiKey.trim() && formType !== "Open Source") {
      errors.apiKey = "API key is required for this provider type";
    }
    
    if (formParameters.length === 0) {
      errors.parameters = "Select at least one parameter";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Test connection
  const handleTestConnection = async () => {
    if (!formEndpoint.trim()) {
      toast.error("Please enter an API endpoint first");
      return;
    }
    
    setTesting(true);
    setTestResult(null);
    
    // Simulate API test (2 seconds)
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      setTestResult(success ? "success" : "error");
      setTesting(false);
      
      if (success) {
        toast.success("Connection successful!", {
          description: "API endpoint is responding correctly",
          duration: 3000,
        });
      } else {
        toast.error("Connection failed", {
          description: "Unable to reach API endpoint. Check URL and credentials.",
          duration: 4000,
        });
      }
    }, 2000);
  };

  // Save provider
  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors", {
        description: "Check all required fields",
      });
      return;
    }

    const now = new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().split(" ")[0].slice(0, 5);
    
    if (editModal) {
      // Update existing provider
      setProviders(prev =>
        prev.map(p =>
          p.id === editModal.id
            ? {
                ...p,
                name: formName.trim(),
                type: formType,
                endpoint: formEndpoint.trim(),
                apiKey: formApiKey.trim() || "N/A (Public)",
                refreshInterval: formRefreshInterval,
                parameters: formParameters,
                status: formStatus,
                lastSync: now,
              }
            : p
        )
      );
      toast.success("Provider updated successfully", {
        description: `${formName} configuration has been saved`,
        duration: 3000,
      });
    } else {
      // Create new provider
      const newProvider: ForecastProvider = {
        id: `fp${Date.now()}`,
        name: formName.trim(),
        type: formType,
        endpoint: formEndpoint.trim(),
        apiKey: formApiKey.trim() || "N/A (Public)",
        status: formStatus,
        lastSync: now,
        latency: "—",
        accuracy: 0,
        parameters: formParameters,
        refreshInterval: formRefreshInterval,
      };
      
      setProviders(prev => [...prev, newProvider]);
      toast.success("Provider added successfully", {
        description: `${formName} has been configured and activated`,
        duration: 3000,
      });
    }
    
    closeModal();
  };

  // Toggle parameter selection
  const toggleParameter = (param: string) => {
    setFormParameters(prev =>
      prev.includes(param) ? prev.filter(p => p !== param) : [...prev, param]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm group">
          <Search className="w-3.5 h-3.5 text-muted-foreground/50 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search providers..."
            className="w-full pl-9 pr-4 py-2 bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-muted-foreground/50 transition-all shadow-sm" 
          />
        </div>
        {!isMobile && (
          <button 
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:shadow-primary/20 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Add Provider
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(p => {
          const st = STATUS_STYLE[p.status];
          const StIcon = st.icon;
          return (
            <div key={p.id} className="group relative rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden hover:bg-white/60 dark:hover:bg-white/5 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5">
              <div className="px-5 py-4 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${st.bg} ${st.border} border shadow-sm`}>
                  <StIcon className={`w-5 h-5 ${st.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                     <p className="text-[13px] text-foreground font-bold truncate tracking-tight">{p.name}</p>
                     {!isMobile && (
                      <button onClick={() => setEditModal(p)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-all">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${st.bg} ${st.color} ${st.border}`}>
                      {st.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 font-medium">{p.type}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-4 grid grid-cols-3 gap-3">
                <div className="text-center p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                  <Gauge className="w-3.5 h-3.5 text-muted-foreground/50 mx-auto mb-1" />
                  <p className="text-[11px] text-foreground font-bold tabular-nums">{p.latency}</p>
                  <p className="text-[9px] text-muted-foreground/50 font-medium">Latency</p>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70 mx-auto mb-1" />
                  <p className="text-[11px] text-foreground font-bold tabular-nums">{p.accuracy}%</p>
                  <p className="text-[9px] text-muted-foreground/50 font-medium">Accuracy</p>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-500/70 mx-auto mb-1" />
                  <p className="text-[11px] text-foreground font-bold tabular-nums">{p.refreshInterval}</p>
                  <p className="text-[9px] text-muted-foreground/50 font-medium">Refresh</p>
                </div>
              </div>

              <div className="px-5 py-3 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-muted-foreground/40" />
                  <span className="text-[9px] text-muted-foreground/60 font-medium tabular-nums">Last sync: {p.lastSync.split(" ")[1]}</span>
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {p.parameters.slice(0, 3).map(param => (
                    <span key={param} className="text-[8px] font-semibold text-muted-foreground/70 bg-white/50 dark:bg-white/10 border border-black/5 dark:border-white/10 px-1.5 py-0.5 rounded-md shadow-sm">{param}</span>
                  ))}
                  {p.parameters.length > 3 && <span className="text-[8px] font-semibold text-muted-foreground/40 px-1 py-0.5">+{p.parameters.length - 3}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5">
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Edit Provider</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                   Configuring <span className="font-medium text-foreground">{editModal.name}</span>
                </p>
              </div>
              <button onClick={() => setEditModal(null)} className="p-1.5 rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground hover:text-foreground hover:bg-black/10 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">API Endpoint</label>
                <div className="relative">
                  <ExternalLink className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                  <input defaultValue={editModal.endpoint} className="w-full pl-9 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground font-mono outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">API Key</label>
                <div className="relative">
                   <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold text-muted-foreground/50 border border-muted-foreground/50 rounded-sm">K</div>
                  <input defaultValue={editModal.apiKey} type="password" className="w-full pl-9 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground font-mono outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">Refresh Interval</label>
                <div className="relative">
                  <select defaultValue={editModal.refreshInterval} className="w-full pl-4 pr-8 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none transition-all">
                    {["15m", "30m", "1h", "3h", "6h", "12h", "24h"].map(v => <option key={v} className="bg-popover">{v}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">▼</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 bg-transparent border border-black/10 dark:border-white/10 rounded-xl text-xs text-muted-foreground font-semibold hover:text-foreground hover:bg-black/5 transition-colors">Cancel</button>
              <button onClick={() => setEditModal(null)} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg">Save Configuration</button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[90vh] bg-white dark:bg-zinc-900 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex-shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Add Provider</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                   Configuring new provider
                </p>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground hover:text-foreground hover:bg-black/10 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">Provider Name</label>
                <input 
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full pl-4 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {formErrors.name && <p className="text-[10px] text-red-500 mt-1">{formErrors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">Provider Type</label>
                <select 
                  value={formType}
                  onChange={e => setFormType(e.target.value)}
                  className="w-full pl-4 pr-8 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none transition-all"
                >
                  {PROVIDER_TYPES.map(type => <option key={type} className="bg-popover">{type}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">API Endpoint</label>
                <div className="relative">
                  <ExternalLink className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                  <input 
                    value={formEndpoint}
                    onChange={e => setFormEndpoint(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground font-mono outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  {formErrors.endpoint && <p className="text-[10px] text-red-500 mt-1">{formErrors.endpoint}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">API Key</label>
                <div className="relative">
                   <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold text-muted-foreground/50 border border-muted-foreground/50 rounded-sm">K</div>
                  <input 
                    value={formApiKey}
                    onChange={e => setFormApiKey(e.target.value)}
                    type="password" 
                    className="w-full pl-9 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground font-mono outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  {formErrors.apiKey && <p className="text-[10px] text-red-500 mt-1">{formErrors.apiKey}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">Refresh Interval</label>
                <div className="relative">
                  <select 
                    value={formRefreshInterval}
                    onChange={e => setFormRefreshInterval(e.target.value)}
                    className="w-full pl-4 pr-8 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none transition-all"
                  >
                    {REFRESH_INTERVALS.map(v => <option key={v} className="bg-popover">{v}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">▼</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">Parameters</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_PARAMETERS.map(param => (
                    <button
                      key={param}
                      onClick={() => toggleParameter(param)}
                      className={`text-[10px] font-semibold px-2 py-1 rounded-md ${formParameters.includes(param) ? "bg-primary text-primary-foreground" : "bg-black/5 dark:bg-white/5 text-muted-foreground"}`}
                    >
                      {param}
                    </button>
                  ))}
                </div>
                {formErrors.parameters && <p className="text-[10px] text-red-500 mt-1">{formErrors.parameters}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">Status</label>
                <select 
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as ProviderStatus)}
                  className="w-full pl-4 pr-8 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none transition-all"
                >
                  {Object.keys(STATUS_STYLE).map(status => (
                    <option key={status} className="bg-popover">
                      {STATUS_STYLE[status as ProviderStatus].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={handleTestConnection}
                  className={`w-full px-4 py-2 rounded-xl text-xs font-semibold ${testing ? "bg-gray-500 text-gray-100 cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"}`}
                  disabled={testing}
                >
                  {testing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Test Connection
                    </>
                  )}
                </button>
                {testResult === "success" && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <p className="text-[10px] text-emerald-500">Connection successful</p>
                  </div>
                )}
                {testResult === "error" && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    <p className="text-[10px] text-red-500">Connection failed</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex-shrink-0">
              <button onClick={closeModal} className="px-4 py-2 bg-transparent border border-black/10 dark:border-white/10 rounded-xl text-xs text-muted-foreground font-semibold hover:text-foreground hover:bg-black/5 transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg">Save Configuration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}