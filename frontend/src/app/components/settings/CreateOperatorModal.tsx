import { useState, useMemo } from "react";
import { X, User, Mail, Shield, MapPin, AlertCircle, CheckCircle, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { AVAILABLE_UTILITIES, type ManagedUser } from "./settingsData";

/* ═══════════════════════════════════════════════════
   CREATE OPERATOR MODAL (Admin Only)
   
   Features:
   - Role locked to "Operator"
   - Utility auto-assigned (no selector)
   - Multi-select locations (filtered by admin's utility)
   - Simplified form (no role/utility choices)
   - Full validation
   ═══════════════════════════════════════════════════ */

interface CreateOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: ManagedUser) => void;
  utilityId: string; // Admin's utility
  utilityName: string; // Admin's utility name
}

export function CreateOperatorModal({ isOpen, onClose, onSuccess, utilityId, utilityName }: CreateOperatorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    assignedLocations: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock locations for the admin's utility
  const availableLocations = useMemo(() => {
    const locationsByUtility: Record<string, string[]> = {
      mumbai: ["Worli Substation", "Andheri Grid", "Borivali Station"],
      delhi: ["Dwarka Sector 9", "Rohini Grid", "Connaught Place Hub"],
      mundra: ["Mundra Port Station", "Coastal Zone A", "Coastal Zone B"],
      renewables_solar: ["Solar Park A", "Solar Park B"],
      maithon: ["Maithon Gen Unit 1", "Maithon Gen Unit 2"],
    };
    return locationsByUtility[utilityId] || [];
  }, [utilityId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    } else if (!formData.email.endsWith("@tatapower.com")) {
      newErrors.email = "Must use @tatapower.com email";
    }

    // Location validation
    if (formData.assignedLocations.length === 0) {
      newErrors.locations = "At least one location must be assigned";
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

    const newUser: ManagedUser = {
      id: `u${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: "Operator",
      status: "invited",
      lastLogin: "—",
      utility: utilityName,
      utilityId: utilityId,
      mfa: false,
    };

    setIsSubmitting(false);
    onSuccess(newUser);
    toast.success(`Operator created successfully! Invitation email sent to ${formData.email}`);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      assignedLocations: [],
    });
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  const toggleLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      assignedLocations: prev.assignedLocations.includes(location)
        ? prev.assignedLocations.filter(l => l !== location)
        : [...prev.assignedLocations, location]
    }));
    // Clear location error when user selects one
    if (errors.locations) {
      setErrors(prev => ({ ...prev, locations: "" }));
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
              <div className="px-6 py-5 border-b border-black/10 dark:border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Create New Operator</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Add a new operator to <strong>{utilityName}</strong>
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

              {/* Info Banner */}
              <div className="px-6 pt-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                      Admin Restriction
                    </p>
                    <p className="text-xs text-blue-600/80 dark:text-blue-500/80 mt-0.5">
                      You can only create Operator users. Role and utility are automatically assigned.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                    }}
                    placeholder="e.g., Rajesh Mehta"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.name 
                        ? "border-red-500 bg-red-500/5" 
                        : "border-black/10 dark:border-white/10 bg-white dark:bg-black/20"
                    } text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all disabled:opacity-50`}
                  />
                  {errors.name && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                    }}
                    placeholder="rajesh.mehta@tatapower.com"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.email 
                        ? "border-red-500 bg-red-500/5" 
                        : "border-black/10 dark:border-white/10 bg-white dark:bg-black/20"
                    } text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all disabled:opacity-50`}
                  />
                  {errors.email && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    An invitation email will be sent to this address
                  </p>
                </div>

                {/* Role (Locked) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    Role
                  </label>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm text-foreground">Operator (View-only access)</span>
                    <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      AUTO-ASSIGNED
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    ✓ Operators have view-only access to dashboards and alerts
                  </p>
                </div>

                {/* Utility (Locked) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    Assigned Utility
                  </label>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm text-foreground">{utilityName}</span>
                    <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                      YOUR UTILITY
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    ℹ️ Utility is automatically set to your assigned utility
                  </p>
                </div>

                {/* Assigned Locations */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    Assigned Locations
                  </label>
                  <div className={`p-4 rounded-xl border ${
                    errors.locations 
                      ? "border-red-500 bg-red-500/5" 
                      : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5"
                  } space-y-2`}>
                    {availableLocations.length > 0 ? (
                      availableLocations.map(location => (
                        <label
                          key={location}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignedLocations.includes(location)}
                            onChange={() => toggleLocation(location)}
                            disabled={isSubmitting}
                            className="w-4 h-4 rounded border-black/20 dark:border-white/20 text-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                          <span className="text-sm text-foreground">{location}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No locations available for this utility
                      </p>
                    )}
                  </div>
                  {errors.locations && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
                      <AlertCircle className="w-3 h-3" />
                      {errors.locations}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Selected: {formData.assignedLocations.length} location{formData.assignedLocations.length !== 1 ? 's' : ''} in {utilityName}
                  </p>
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
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Create Operator & Send Invite
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
