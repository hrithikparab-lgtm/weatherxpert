import { useState, useMemo } from "react";
import { X, User, Mail, Shield, Building2, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { AVAILABLE_UTILITIES, type ManagedUser, type CoreRoleId } from "./settingsData";

/* ═══════════════════════════════════════════════════
   CREATE USER MODAL (Super Admin)
   
   Features:
   - Can select role (Admin or Operator)
   - Can select utility
   - Multi-select locations (filtered by utility)
   - Full validation
   - Real-time feedback
   ═══════════════════════════════════════════════════ */

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: ManagedUser) => void;
  preselectedUtility?: string; // For when specific utility is selected
}

export function CreateUserModal({ isOpen, onClose, onSuccess, preselectedUtility }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Operator" as CoreRoleId,
    utilityId: preselectedUtility || "mumbai",
    assignedLocations: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock locations for multi-select
  const availableLocations = useMemo(() => {
    const locationsByUtility: Record<string, string[]> = {
      mumbai: ["Worli Substation", "Andheri Grid", "Borivali Station"],
      delhi: ["Dwarka Sector 9", "Rohini Grid", "Connaught Place Hub"],
      mundra: ["Mundra Port Station", "Coastal Zone A", "Coastal Zone B"],
      renewables_solar: ["Solar Park A", "Solar Park B"],
      maithon: ["Maithon Gen Unit 1", "Maithon Gen Unit 2"],
    };
    return locationsByUtility[formData.utilityId] || [];
  }, [formData.utilityId]);

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

    const selectedUtility = AVAILABLE_UTILITIES.find(u => u.id === formData.utilityId);

    const newUser: ManagedUser = {
      id: `u${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      status: "invited",
      lastLogin: "—",
      utility: selectedUtility?.name || "Unknown",
      utilityId: formData.utilityId,
      mfa: false,
    };

    setIsSubmitting(false);
    onSuccess(newUser);
    toast.success(`${formData.role} user created successfully! Invitation email sent to ${formData.email}`);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "Operator",
      utilityId: preselectedUtility || "mumbai",
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
              <div className="px-6 py-5 border-b border-black/10 dark:border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Create New User</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Add a new Admin or Operator to the system</p>
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
              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
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
                    placeholder="e.g., Amit Kumar"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.name 
                        ? "border-red-500 bg-red-500/5" 
                        : "border-black/10 dark:border-white/10 bg-white dark:bg-black/20"
                    } text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50`}
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
                    placeholder="amit.kumar@tatapower.com"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.email 
                        ? "border-red-500 bg-red-500/5" 
                        : "border-black/10 dark:border-white/10 bg-white dark:bg-black/20"
                    } text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50`}
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

                {/* Role */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as CoreRoleId }))}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                  >
                    <option value="Operator">Operator (View-only access)</option>
                    <option value="Admin">Admin (Configuration rights)</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {formData.role === "Admin" 
                      ? "⚠️ Admin users can manage operators and configure their utility"
                      : "✓ Operators have view-only access to dashboards and alerts"
                    }
                  </p>
                </div>

                {/* Utility */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    Assigned Utility
                  </label>
                  <select
                    value={formData.utilityId}
                    onChange={(e) => setFormData(prev => ({ ...prev, utilityId: e.target.value, assignedLocations: [] }))}
                    disabled={isSubmitting || !!preselectedUtility}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                  >
                    {AVAILABLE_UTILITIES.filter(u => u.id !== "all").map(utility => (
                      <option key={utility.id} value={utility.id}>{utility.name}</option>
                    ))}
                  </select>
                  {preselectedUtility && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      ℹ️ Utility is locked to current selection
                    </p>
                  )}
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
                    {availableLocations.map(location => (
                      <label
                        key={location}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignedLocations.includes(location)}
                          onChange={() => toggleLocation(location)}
                          disabled={isSubmitting}
                          className="w-4 h-4 rounded border-black/20 dark:border-white/20 text-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="text-sm text-foreground">{location}</span>
                      </label>
                    ))}
                  </div>
                  {errors.locations && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
                      <AlertCircle className="w-3 h-3" />
                      {errors.locations}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Selected: {formData.assignedLocations.length} location{formData.assignedLocations.length !== 1 ? 's' : ''}
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
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Create User & Send Invite
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
