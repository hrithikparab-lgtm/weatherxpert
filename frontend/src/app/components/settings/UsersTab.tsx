import { useState } from "react";
import {
  Plus, Search, Edit2, Trash2, MoreVertical, ShieldCheck,
  CheckCircle2, Clock, XCircle, Mail, Key, X, Building2,
} from "lucide-react";
import { toast } from "sonner";
import type { ManagedUser, UserStatus, CoreRoleId } from "./settingsData";
import { AVAILABLE_UTILITIES } from "./settingsData";
import { useRole } from "../RoleContext";

const STATUS_BADGE: Record<UserStatus, { label: string; color: string; bg: string; border: string }> = {
  active:    { label: "Active",    color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  invited:   { label: "Invited",   color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  suspended: { label: "Suspended", color: "text-red-600 dark:text-red-400",         bg: "bg-red-500/10",     border: "border-red-500/20" },
};

const ROLE_BADGE_STYLES: Record<CoreRoleId, { bg: string; color: string; border: string }> = {
  "Super Admin": { bg: "bg-purple-500/10", color: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20" },
  "Admin": { bg: "bg-blue-500/10", color: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
  "Operator": { bg: "bg-slate-500/10", color: "text-slate-600 dark:text-slate-400", border: "border-slate-500/20" },
};

interface UsersTabProps { 
  isMobile: boolean;
  users: ManagedUser[];
  setUsers: React.Dispatch<React.SetStateAction<ManagedUser[]>>;
}

export function UsersTab({ isMobile, users, setUsers }: UsersTabProps) {
  const { user: currentUser } = useRole();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [roleFilter, setRoleFilter] = useState<CoreRoleId | "All">("All");

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<CoreRoleId>("Operator");
  const [formUtility, setFormUtility] = useState("Mumbai Distribution");
  const [formUtilityId, setFormUtilityId] = useState("mumbai");

  // Get current user role for permission checks
  const isSuperAdmin = currentUser?.role === "Super Admin";
  const isAdmin = currentUser?.role === "Admin";
  const currentUserUtilityId = users.find(u => u.email === currentUser?.email)?.utilityId || "";

  // Filter users based on role scope
  const visibleUsers = users.filter(u => {
    // Super Admin sees all users
    if (isSuperAdmin) return true;
    
    // Admin sees only users from their utility
    if (isAdmin) {
      return u.utilityId === currentUserUtilityId || u.id === users.find(user => user.email === currentUser?.email)?.id;
    }
    
    // Operators shouldn't see this tab, but just in case
    return false;
  });

  const filtered = visibleUsers.filter(u => {
    const matchesSearch = search
      ? u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase()) ||
        u.utility.toLowerCase().includes(search.toLowerCase())
      : true;
    
    const matchesRole = roleFilter === "All" ? true : u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const openCreate = () => {
    setEditing(null);
    setFormName(""); 
    setFormEmail(""); 
    setFormRole("Operator");
    
    // Set default utility based on current user role
    if (isSuperAdmin) {
      setFormUtility("Mumbai Distribution");
      setFormUtilityId("mumbai");
    } else if (isAdmin) {
      const currentUserData = users.find(u => u.email === currentUser?.email);
      setFormUtility(currentUserData?.utility || "Mumbai Distribution");
      setFormUtilityId(currentUserData?.utilityId || "mumbai");
    }
    
    setModalOpen(true);
  };

  const openEdit = (u: ManagedUser) => {
    // Admin can only edit users in their utility
    if (isAdmin && u.utilityId !== currentUserUtilityId && u.role === "Super Admin") {
      toast.error("Access Denied", { description: "You cannot edit users outside your utility scope." });
      return;
    }
    
    setEditing(u);
    setFormName(u.name); 
    setFormEmail(u.email); 
    setFormRole(u.role); 
    setFormUtility(u.utility);
    setFormUtilityId(u.utilityId);
    setModalOpen(true);
  };

  const handleSave = () => {
    // Validation: Admin cannot create other Admins or Super Admins
    if (isAdmin && (formRole === "Super Admin" || (formRole === "Admin" && !editing))) {
      toast.error("Permission Denied", { 
        description: "Admin users cannot create other Admin or Super Admin users." 
      });
      return;
    }
    
    // Validation: Admin can only assign users to their utility
    if (isAdmin && formUtilityId !== currentUserUtilityId) {
      toast.error("Utility Scope Violation", { 
        description: "You can only assign users to your assigned utility." 
      });
      return;
    }
    
    if (editing) {
      setUsers(prev => prev.map(u => u.id === editing.id ? { 
        ...u, 
        name: formName, 
        email: formEmail, 
        role: formRole, 
        utility: formUtility,
        utilityId: formUtilityId,
      } : u));
      toast.success("User updated successfully", { description: `${formName} has been modified.` });
    } else {
      setUsers(prev => [...prev, {
        id: `u${Date.now()}`, 
        name: formName, 
        email: formEmail, 
        role: formRole,
        status: "invited" as UserStatus, 
        lastLogin: "—", 
        utility: formUtility,
        utilityId: formUtilityId,
        mfa: false,
      }]);
      toast.success("User invite sent", { description: `Invitation sent to ${formEmail}` });
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, userToDelete: ManagedUser) => {
    // Prevent deleting Super Admin
    if (userToDelete.role === "Super Admin") {
      toast.error("Cannot Delete", { description: "Super Admin users cannot be deleted." });
      return;
    }
    
    // Admin can only delete users in their utility
    if (isAdmin && userToDelete.utilityId !== currentUserUtilityId) {
      toast.error("Access Denied", { description: "You cannot delete users outside your utility scope." });
      return;
    }
    
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.info("User removed");
  };

  const handleUtilityChange = (utilityId: string) => {
    const utility = AVAILABLE_UTILITIES.find(u => u.id === utilityId);
    if (utility) {
      setFormUtilityId(utility.id);
      setFormUtility(utility.name);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm group">
          <Search className="w-3.5 h-3.5 text-muted-foreground/50 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-muted-foreground/50 transition-all shadow-sm" 
          />
        </div>
        {!isMobile && (
          <button 
            onClick={openCreate} 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:shadow-primary/20 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Add User
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                <th className="text-left px-5 py-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider hidden md:table-cell">Utility</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider hidden lg:table-cell">Last Login</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider hidden lg:table-cell">MFA</th>
                {!isMobile && <th className="w-12 px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filtered.map(u => {
                const stBadge = STATUS_BADGE[u.status];
                const roleBadge = ROLE_BADGE_STYLES[u.role];
                return (
                  <tr key={u.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 flex items-center justify-center text-primary text-[10px] font-bold shadow-inner">
                          {u.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] text-foreground font-medium truncate">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground/60 font-mono truncate tracking-tight">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadge.bg} ${roleBadge.color} ${roleBadge.border}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${roleBadge.color.replace('text-', 'bg-')}`} />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-[11px] text-muted-foreground">{u.utility}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${stBadge.bg} ${stBadge.color} ${stBadge.border}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${stBadge.color.replace('text-', 'bg-')}`} />
                        {stBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-[11px] text-muted-foreground/70 tabular-nums font-medium">{u.lastLogin}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      {u.mfa ? 
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 w-fit">
                          <ShieldCheck className="w-3 h-3" /> ON
                        </div> 
                        : <span className="text-[10px] text-muted-foreground/40 px-1.5">OFF</span>
                      }
                    </td>
                    {!isMobile && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(u.id, u)} className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/10 text-[10px] text-muted-foreground/60 tabular-nums flex justify-between items-center">
          <span>{filtered.length} user{filtered.length !== 1 ? "s" : ""} found</span>
          <span className="opacity-50">Page 1 of 1</span>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5">
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{editing ? "Edit User" : "Add User"}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Manage user access and details</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground hover:text-foreground hover:bg-black/10 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">Full Name</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. Priya Sharma" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                  <input value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="email@tatapower.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">Role</label>
                  <div className="relative">
                    <select value={formRole} onChange={e => setFormRole(e.target.value as CoreRoleId)} className="w-full pl-3 pr-8 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none transition-all">
                      <option className="bg-popover">Super Admin</option><option className="bg-popover">Admin</option><option className="bg-popover">Operator</option><option className="bg-popover">Analyst</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">▼</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">Utility</label>
                  <div className="relative">
                    <select value={formUtilityId} onChange={e => handleUtilityChange(e.target.value)} className="w-full pl-3 pr-8 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none transition-all">
                      <option className="bg-popover">All</option>
                      {AVAILABLE_UTILITIES.map(u => (
                        <option key={u.id} className="bg-popover" value={u.id}>{u.name}</option>
                      ))}
                    </select>
                     <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">▼</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-transparent border border-black/10 dark:border-white/10 rounded-xl text-xs text-muted-foreground font-semibold hover:text-foreground hover:bg-black/5 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={!formName || !formEmail} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none">{editing ? "Save Changes" : "Send Invite"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}