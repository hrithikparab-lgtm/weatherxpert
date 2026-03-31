import { useState } from "react";
import { X, MapPin, Building2, AlertCircle, CheckCircle, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   ADD LOCATION MODAL (Super Admin & Admin)
   
   Features:
   - Location name and type
   - Latitude and Longitude inputs
   - Utility auto-assigned (locked for Admin)
   - Active status toggle
   - Full validation with coordinate checks
   - Real-time feedback
   ═══════════════════════════════════════════════════ */

interface Location {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  active: boolean;
  utilityId: string;
}

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (location: Location) => void;
  utilityId: string;
  utilityName: string;
  isAdmin?: boolean; // For UI differences
}

const LOCATION_TYPES = [
  "Distribution Point",
  "Generation Unit",
  "Monitoring Site",
  "Substation",
  "Renewable Facility",
  "Control Center",
];

export function AddLocationModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  utilityId, 
  utilityName,
  isAdmin = false 
}: AddLocationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Distribution Point",
    latitude: "",
    longitude: "",
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Location name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // Latitude validation
    const lat = parseFloat(formData.latitude);
    if (!formData.latitude.trim()) {
      newErrors.latitude = "Latitude is required";
    } else if (isNaN(lat)) {
      newErrors.latitude = "Latitude must be a valid number";
    } else if (lat < -90 || lat > 90) {
      newErrors.latitude = "Latitude must be between -90 and 90";
    }

    // Longitude validation
    const lng = parseFloat(formData.longitude);
    if (!formData.longitude.trim()) {
      newErrors.longitude = "Longitude is required";
    } else if (isNaN(lng)) {
      newErrors.longitude = "Longitude must be a valid number";
    } else if (lng < -180 || lng > 180) {
      newErrors.longitude = "Longitude must be between -180 and 180";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newLocation: Location = {
      id: `loc_${Date.now()}`,
      name: formData.name.trim(),
      type: formData.type,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      active: formData.active,
      utilityId: utilityId,
    };

    setIsSubmitting(false);
    onSuccess(newLocation);
    toast.success(`Location "${formData.name}" added successfully to ${utilityName}`);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "Distribution Point",
      latitude: "",
      longitude: "",
      active: true,
    });
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  // Helper to suggest coordinates based on utility (for UX)
  const getCoordinateSuggestion = () => {
    const suggestions: Record<string, { lat: string, lng: string, hint: string }> = {
      mumbai: { lat: "19.0760", lng: "72.8777", hint: "Mumbai, India" },
      delhi: { lat: "28.6139", lng: "77.2090", hint: "New Delhi, India" },
      mundra: { lat: "22.8356", lng: "69.7221", hint: "Mundra, Gujarat" },
      renewables_solar: { lat: "23.0225", lng: "72.5714", hint: "Ahmedabad, Gujarat" },
      maithon: { lat: "23.8441", lng: "86.8081", hint: "Maithon, Jharkhand" },
    };
    return suggestions[utilityId] || null;
  };

  const suggestion = getCoordinateSuggestion();

  const applySuggestion = () => {
    if (suggestion) {
      setFormData(prev => ({
        ...prev,
        latitude: suggestion.lat,
        longitude: suggestion.lng,
      }));
      setErrors(prev => ({ ...prev, latitude: "", longitude: "" }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-2xl bg-white dark:bg-black/95 rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-black/10 dark:border-white/10 bg-gradient-to-br from-purple-500/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Add New Location</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Add a monitoring location to <strong>{utilityName}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="w-8 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Location Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    Location Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                    }}
                    placeholder="e.g., Worli Substation, Andheri Grid"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.name 
                        ? "border-red-500 bg-red-500/5" 
                        : "border-black/10 dark:border-white/10 bg-white dark:bg-black/20"
                    } text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all disabled:opacity-50`}
                  />
                  {errors.name && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Location Type */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    Location Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 text-sm text-foreground focus:ring-2 focus:ring-purple-500/20 outline-none transition-all disabled:opacity-50"
                  >
                    {LOCATION_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Utility (Locked) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    Assigned Utility
                  </label>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm text-foreground">{utilityName}</span>
                    <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                      {isAdmin ? "YOUR UTILITY" : "LOCKED"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {isAdmin 
                      ? "ℹ️ Location will be added to your utility" 
                      : "ℹ️ Location is assigned to the selected utility"
                    }
                  </p>
                </div>

                {/* Coordinates Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Geographic Coordinates
                    </label>
                    {suggestion && (
                      <button
                        type="button"
                        onClick={applySuggestion}
                        disabled={isSubmitting}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                      >
                        Use {suggestion.hint} coordinates
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Latitude */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Latitude
                      </label>
                      <input
                        type="text"
                        value={formData.latitude}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, latitude: e.target.value }));
                          if (errors.latitude) setErrors(prev => ({ ...prev, latitude: "" }));
                        }}
                        placeholder="19.0760"
                        disabled={isSubmitting}
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          errors.latitude 
                            ? "border-red-500 bg-red-500/5" 
                            : "border-black/10 dark:border-white/10 bg-white dark:bg-black/20"
                        } text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all disabled:opacity-50`}
                      />
                      {errors.latitude && (
                        <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
                          <AlertCircle className="w-3 h-3" />
                          {errors.latitude}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">Range: -90 to 90</p>
                    </div>

                    {/* Longitude */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Longitude
                      </label>
                      <input
                        type="text"
                        value={formData.longitude}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, longitude: e.target.value }));
                          if (errors.longitude) setErrors(prev => ({ ...prev, longitude: "" }));
                        }}
                        placeholder="72.8777"
                        disabled={isSubmitting}
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          errors.longitude 
                            ? "border-red-500 bg-red-500/5" 
                            : "border-black/10 dark:border-white/10 bg-white dark:bg-black/20"
                        } text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all disabled:opacity-50`}
                      />
                      {errors.longitude && (
                        <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
                          <AlertCircle className="w-3 h-3" />
                          {errors.longitude}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">Range: -180 to 180</p>
                    </div>
                  </div>
                </div>

                {/* Active Status */}
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                      disabled={isSubmitting}
                      className="w-4 h-4 rounded border-black/20 dark:border-white/20 text-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">
                        Activate location immediately
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formData.active 
                          ? "Location will be active and start receiving data" 
                          : "Location will be created but remain inactive"
                        }
                      </p>
                    </div>
                  </label>
                </div>
              </form>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Add Location
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
