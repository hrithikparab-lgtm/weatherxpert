import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Power, MapPin, Lock, Unlock, RotateCcw, Settings, Users, Building2, ShieldAlert, Search, ShieldCheck, Mail, X, Edit2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useRole } from "../RoleContext";
import { AVAILABLE_UTILITIES, MANAGED_USERS, type ManagedUser, type CoreRoleId } from "./settingsData";
import { CreateUserModal } from "./CreateUserModal";
import { CreateOperatorModal } from "./CreateOperatorModal";
import { AddLocationModal } from "./AddLocationModal";

/* ═══════════════════════════════════════════════════
   UTILITY ADMINISTRATION TAB (Role-Based RBAC)
   
   ADMIN VIEW:
   - No utility selector (auto-bound to their utility)
   - Can only create/edit Operators
   - Cannot change role type
   - Threshold editing may be locked by Super Admin
   - Limited dashboard layout control
   
   SUPER ADMIN VIEW:
   - Utility selector (All Utilities / specific)
   - Can create Admin and Operator users
   - Can lock/unlock Admin threshold editing
   - Full dashboard layout control
   - Can delete users
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

interface ThresholdConfig {
  utilityId: string;
  temperature: number;
  windSpeed: number;
  rainfall: number;
  riskLevel1: number;
  riskLevel2: number;
  extremeLevel3: number;
  allowAdminEdit: boolean;
}

interface DashboardWidget {
  id: string;
  name: string;
  enabled: boolean;
  dataSource: string;
  position: number;
}

// Mock Data
const MOCK_LOCATIONS: Location[] = [
  { id: "loc_001", name: "Worli Substation", type: "Distribution Point", latitude: 19.0144, longitude: 72.8190, active: true, utilityId: "mumbai" },
  { id: "loc_002", name: "Andheri Grid", type: "Distribution Point", latitude: 19.1136, longitude: 72.8697, active: true, utilityId: "mumbai" },
  { id: "loc_003", name: "Borivali Station", type: "Monitoring Site", latitude: 19.2304, longitude: 72.8564, active: false, utilityId: "mumbai" },
  { id: "loc_004", name: "Dwarka Sector 9", type: "Distribution Point", latitude: 28.5921, longitude: 77.0460, active: true, utilityId: "delhi" },
  { id: "loc_005", name: "Rohini Grid", type: "Distribution Point", latitude: 28.7496, longitude: 77.0669, active: true, utilityId: "delhi" },
  { id: "loc_006", name: "Mundra Port Station", type: "Generation Unit", latitude: 22.8356, longitude: 69.7221, active: true, utilityId: "mundra" },
];

const MOCK_THRESHOLDS: ThresholdConfig[] = [
  { utilityId: "mumbai", temperature: 40, windSpeed: 80, rainfall: 100, riskLevel1: 60, riskLevel2: 75, extremeLevel3: 90, allowAdminEdit: true },
  { utilityId: "delhi", temperature: 45, windSpeed: 70, rainfall: 80, riskLevel1: 65, riskLevel2: 80, extremeLevel3: 95, allowAdminEdit: false },
  { utilityId: "mundra", temperature: 42, windSpeed: 90, rainfall: 120, riskLevel1: 70, riskLevel2: 85, extremeLevel3: 95, allowAdminEdit: true },
  { utilityId: "renewables_solar", temperature: 38, windSpeed: 75, rainfall: 90, riskLevel1: 55, riskLevel2: 70, extremeLevel3: 88, allowAdminEdit: true },
  { utilityId: "maithon", temperature: 41, windSpeed: 85, rainfall: 110, riskLevel1: 62, riskLevel2: 78, extremeLevel3: 92, allowAdminEdit: false },
];

const MOCK_WIDGETS: DashboardWidget[] = [
  { id: "w1", name: "Max Temperature", enabled: true, dataSource: "IMD", position: 1 },
  { id: "w2", name: "Min Temperature", enabled: true, dataSource: "Tomorrow.io", position: 2 },
  { id: "w3", name: "Wind Speed", enabled: true, dataSource: "IMD", position: 3 },
  { id: "w4", name: "Rainfall", enabled: true, dataSource: "Tomorrow.io", position: 4 },
  { id: "w5", name: "Humidity", enabled: false, dataSource: "IMD", position: 5 },
];

interface UtilityAdministrationTabProps {
  isMobile?: boolean;
}

export function UtilityAdministrationTab({ isMobile = false }: UtilityAdministrationTabProps) {
  const { user } = useRole();
  const isSuperAdmin = user.role === "superadmin";
  const isAdmin = user.role === "admin";

  // For Admin: auto-bind to their utility
  // For Super Admin: allow selection
  const [selectedUtilityId, setSelectedUtilityId] = useState<string>(
    isSuperAdmin ? "all" : (user.utility || "mumbai")
  );

  const [users, setUsers] = useState<ManagedUser[]>(MANAGED_USERS);
  const [locations, setLocations] = useState<Location[]>(MOCK_LOCATIONS);
  const [thresholds, setThresholds] = useState<ThresholdConfig[]>(MOCK_THRESHOLDS);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(MOCK_WIDGETS);
  
  // Modals
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateLocationModal, setShowCreateLocationModal] = useState(false);

  const isAllUtilities = selectedUtilityId === "all";
  const selectedUtility = AVAILABLE_UTILITIES.find(u => u.id === selectedUtilityId);

  // Get user's utility info for Admin view
  const userUtility = AVAILABLE_UTILITIES.find(u => u.id === user.utility);

  // Filter data by selected utility (or user's utility for Admin)
  const effectiveUtilityId = isSuperAdmin ? selectedUtilityId : user.utility || "mumbai";

  const filteredUsers = useMemo(() => {
    if (isSuperAdmin && isAllUtilities) return users;
    
    // For Admin: only show Operators in their utility
    if (isAdmin) {
      return users.filter(u => u.utilityId === effectiveUtilityId && u.role === "Operator");
    }
    
    // For Super Admin with specific utility: show all users in that utility
    return users.filter(u => u.utilityId === effectiveUtilityId);
  }, [users, effectiveUtilityId, isAllUtilities, isSuperAdmin, isAdmin]);

  const filteredLocations = useMemo(() => {
    if (isSuperAdmin && isAllUtilities) return locations;
    return locations.filter(l => l.utilityId === effectiveUtilityId);
  }, [locations, effectiveUtilityId, isAllUtilities, isSuperAdmin]);

  const currentThresholds = thresholds.find(t => t.utilityId === effectiveUtilityId);

  // Check if thresholds are locked for Admin
  const isThresholdLocked = isAdmin && currentThresholds && !currentThresholds.allowAdminEdit;

  // Summary stats for "All Utilities" view (Super Admin only)
  const summaryStats = useMemo(() => ({
    totalAdmins: users.filter(u => u.role === "Admin").length,
    totalOperators: users.filter(u => u.role === "Operator").length,
    totalLocations: locations.length,
    totalActiveAlerts: 12, // Mock
  }), [users, locations]);

  const handleToggleAllowAdminEdit = () => {
    if (!currentThresholds || !isSuperAdmin) return;
    
    setThresholds(prev => prev.map(t => 
      t.utilityId === effectiveUtilityId 
        ? { ...t, allowAdminEdit: !t.allowAdminEdit }
        : t
    ));
    
    toast.success(
      currentThresholds.allowAdminEdit 
        ? "Admin threshold editing locked" 
        : "Admin threshold editing unlocked"
    );
  };

  const handleResetLayout = () => {
    toast.success("Dashboard layout reset to global default");
  };

  const handleToggleLocation = (locId: string) => {
    setLocations(prev => prev.map(loc => 
      loc.id === locId ? { ...loc, active: !loc.active } : loc
    ));
    toast.success("Location status updated");
  };

  const handleToggleWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    ));
    toast.success("Widget visibility updated");
  };

  const handleDeleteUser = (userId: string) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admin can delete users");
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.success("User deleted successfully");
  };

  // Modal success handlers
  const handleUserCreated = (newUser: ManagedUser) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleLocationCreated = (newLocation: Location) => {
    setLocations(prev => [...prev, newLocation]);
  };

  return (
    <div className="space-y-6">
      {/* ═══ MODALS ═══ */}
      {isSuperAdmin ? (
        <CreateUserModal
          isOpen={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          onSuccess={handleUserCreated}
          preselectedUtility={!isAllUtilities ? effectiveUtilityId : undefined}
        />
      ) : (
        <CreateOperatorModal
          isOpen={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          onSuccess={handleUserCreated}
          utilityId={effectiveUtilityId}
          utilityName={userUtility?.name || "Unknown"}
        />
      )}

      <AddLocationModal
        isOpen={showCreateLocationModal}
        onClose={() => setShowCreateLocationModal(false)}
        onSuccess={handleLocationCreated}
        utilityId={effectiveUtilityId}
        utilityName={selectedUtility?.name || userUtility?.name || "Unknown"}
        isAdmin={isAdmin}
      />

      {/* ═══ HEADER SECTION ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              Utility Administration
              {!isSuperAdmin && userUtility && (
                <span className="text-sm text-muted-foreground">— {userUtility.name}</span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isSuperAdmin 
                ? "Manage users, locations, thresholds, and dashboard layouts per utility"
                : "Manage operators, locations, and configurations for your utility"
              }
            </p>
          </div>
          
          {/* Admin Badge */}
          {isAdmin && userUtility && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Admin — {userUtility.name}
              </span>
            </div>
          )}
        </div>

        {/* Super Admin Only: Utility Selector */}
        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">Select Utility:</label>
            <select
              value={selectedUtilityId}
              onChange={(e) => setSelectedUtilityId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              disabled={isMobile}
            >
              <option value="all">All Utilities</option>
              {AVAILABLE_UTILITIES.filter(u => u.id !== "all").map(utility => (
                <option key={utility.id} value={utility.id}>{utility.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ═══ ALL UTILITIES VIEW (Super Admin Only - Read-Only Summary) ═══ */}
      {isSuperAdmin && isAllUtilities ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{summaryStats.totalAdmins}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Admins</p>
          </div>

          <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{summaryStats.totalOperators}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Operators</p>
          </div>

          <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{summaryStats.totalLocations}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Locations</p>
          </div>

          <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{summaryStats.totalActiveAlerts}</p>
            <p className="text-xs text-muted-foreground mt-1">Active Alerts</p>
          </div>

          <div className="col-span-full p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              📊 <strong>Summary View:</strong> Select a specific utility to enable editing controls
            </p>
          </div>
        </div>
      ) : (
        /* ═══ SPECIFIC UTILITY VIEW (Full Editing) ═══ */
        <div className="space-y-6">
          {/* SECTION 1: UTILITY USERS */}
          <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  {isAdmin ? "Utility Users (Operators)" : `Utility Users — ${selectedUtility?.name}`}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAdmin 
                    ? `${filteredUsers.length} operators in your utility`
                    : `${filteredUsers.length} users assigned`
                  }
                </p>
              </div>
              <button
                onClick={() => setShowCreateUserModal(true)}
                disabled={isMobile}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                {isAdmin ? "Create Operator" : "Create User"}
              </button>
            </div>

            <div className="overflow-x-auto -mx-2">
              <table className="w-full min-w-[600px] text-xs">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5">
                    <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Role</th>
                    {isSuperAdmin && (
                      <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Utility</th>
                    )}
                    <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-2 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 font-medium text-foreground">{user.name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-block px-2 py-1 rounded-lg text-[10px] font-semibold ${
                          user.role === "Admin" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                          user.role === "Operator" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                          "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      {isSuperAdmin && (
                        <td className="py-3 px-2 text-muted-foreground text-[11px]">{user.utility}</td>
                      )}
                      <td className="py-3 px-2">
                        <span className={`inline-block px-2 py-1 rounded-lg text-[10px] font-semibold ${
                          user.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                          user.status === "invited" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                          "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                            disabled={isMobile}
                            title="Edit user"
                          >
                            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          {isSuperAdmin && (
                            <button 
                              className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                              disabled={isMobile}
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={isSuperAdmin ? 6 : 5} className="py-8 text-center text-muted-foreground text-xs">
                        No users found for this utility
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: LOCATIONS */}
          <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Locations {selectedUtility && `— ${selectedUtility.name}`}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{filteredLocations.length} locations configured</p>
              </div>
              <button
                onClick={() => setShowCreateLocationModal(true)}
                disabled={isMobile}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Location
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredLocations.map(location => (
                <div 
                  key={location.id} 
                  className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{location.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{location.type}</p>
                    </div>
                    <button
                      onClick={() => handleToggleLocation(location.id)}
                      disabled={isMobile}
                      className={`p-1.5 rounded-lg transition-colors ${
                        location.active 
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20" 
                          : "bg-red-500/10 hover:bg-red-500/20"
                      }`}
                      title={location.active ? "Deactivate" : "Activate"}
                    >
                      <Power className={`w-3.5 h-3.5 ${location.active ? "text-emerald-500" : "text-red-500"}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>Lat: {location.latitude.toFixed(4)}</span>
                    <span>Lon: {location.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button 
                      className="flex-1 px-2 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-[10px] font-medium text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                      disabled={isMobile}
                    >
                      <Edit className="w-3 h-3 inline mr-1" />
                      Edit
                    </button>
                    {isSuperAdmin && (
                      <button 
                        className="flex-1 px-2 py-1.5 rounded-lg bg-red-500/10 text-[10px] font-medium text-red-500 hover:bg-red-500/20 transition-colors"
                        disabled={isMobile}
                      >
                        <Trash2 className="w-3 h-3 inline mr-1" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredLocations.length === 0 && (
                <div className="col-span-full p-8 text-center text-muted-foreground text-xs">
                  No locations found for this utility
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: THRESHOLD CONFIGURATION */}
          {currentThresholds && (
            <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    Threshold Configuration {selectedUtility && `— ${selectedUtility.name}`}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isThresholdLocked 
                      ? "Risk level triggers (locked by Super Admin)"
                      : "Risk level triggers and alert thresholds"
                    }
                  </p>
                </div>
                
                {/* Admin Lock Toggle (Super Admin Only) */}
                {isSuperAdmin && (
                  <button
                    onClick={handleToggleAllowAdminEdit}
                    disabled={isMobile}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      currentThresholds.allowAdminEdit
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                    }`}
                  >
                    {currentThresholds.allowAdminEdit ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {currentThresholds.allowAdminEdit ? "Admin Can Edit" : "Admin Locked"}
                  </button>
                )}

                {/* Lock Indicator (Admin Only) */}
                {isAdmin && isThresholdLocked && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Locked by Super Admin
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Temperature Threshold (°C)</label>
                  <input
                    type="number"
                    value={currentThresholds.temperature}
                    onChange={(e) => setThresholds(prev => prev.map(t => 
                      t.utilityId === effectiveUtilityId ? { ...t, temperature: Number(e.target.value) } : t
                    ))}
                    disabled={isMobile || isThresholdLocked}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Wind Speed Threshold (km/h)</label>
                  <input
                    type="number"
                    value={currentThresholds.windSpeed}
                    onChange={(e) => setThresholds(prev => prev.map(t => 
                      t.utilityId === effectiveUtilityId ? { ...t, windSpeed: Number(e.target.value) } : t
                    ))}
                    disabled={isMobile || isThresholdLocked}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Rainfall Threshold (mm)</label>
                  <input
                    type="number"
                    value={currentThresholds.rainfall}
                    onChange={(e) => setThresholds(prev => prev.map(t => 
                      t.utilityId === effectiveUtilityId ? { ...t, rainfall: Number(e.target.value) } : t
                    ))}
                    disabled={isMobile || isThresholdLocked}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Risk Level 1 Trigger (%)</label>
                  <input
                    type="number"
                    value={currentThresholds.riskLevel1}
                    onChange={(e) => setThresholds(prev => prev.map(t => 
                      t.utilityId === effectiveUtilityId ? { ...t, riskLevel1: Number(e.target.value) } : t
                    ))}
                    disabled={isMobile || isThresholdLocked}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Risk Level 2 Trigger (%)</label>
                  <input
                    type="number"
                    value={currentThresholds.riskLevel2}
                    onChange={(e) => setThresholds(prev => prev.map(t => 
                      t.utilityId === effectiveUtilityId ? { ...t, riskLevel2: Number(e.target.value) } : t
                    ))}
                    disabled={isMobile || isThresholdLocked}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Extreme Level 3 - Super Admin Only */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Extreme Level 3 Threshold (%)
                    {isAdmin && <span className="ml-1 text-[10px] text-amber-500">(Super Admin Only)</span>}
                  </label>
                  <input
                    type="number"
                    value={currentThresholds.extremeLevel3}
                    onChange={(e) => setThresholds(prev => prev.map(t => 
                      t.utilityId === effectiveUtilityId ? { ...t, extremeLevel3: Number(e.target.value) } : t
                    ))}
                    disabled={isMobile || isAdmin}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {isThresholdLocked && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    🔒 <strong>Read-Only Mode:</strong> Threshold editing has been locked by Super Admin. Contact your administrator to make changes.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: DASHBOARD LAYOUT SETTINGS */}
          <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Dashboard Layout Settings {selectedUtility && `— ${selectedUtility.name}`}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isSuperAdmin 
                    ? "Control widget visibility, data sources, and layout"
                    : "Enable/disable widgets and manage display order"
                  }
                </p>
              </div>
              {isSuperAdmin && (
                <button
                  onClick={handleResetLayout}
                  disabled={isMobile}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Default
                </button>
              )}
            </div>

            <div className="space-y-3">
              {widgets.map(widget => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleWidget(widget.id)}
                      disabled={isMobile}
                      className={`w-10 h-6 rounded-full transition-all relative ${
                        widget.enabled 
                          ? "bg-emerald-500" 
                          : "bg-black/20 dark:bg-white/20"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform absolute top-1 ${
                        widget.enabled ? "translate-x-5" : "translate-x-1"
                      }`} />
                    </button>
                    <div>
                      <p className="text-sm font-medium text-foreground">{widget.name}</p>
                      <p className="text-xs text-muted-foreground">Data Source: {widget.dataSource}</p>
                    </div>
                  </div>
                  {isSuperAdmin && (
                    <div className="flex items-center gap-2">
                      <button 
                        className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-[10px] font-medium text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        disabled={isMobile}
                      >
                        Change Source
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}