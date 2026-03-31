import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  Map,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Target,
  Upload,
  FileBarChart,
  LogOut,
  CheckCircle2,
  CloudLightning,
  Sun,
  Moon,
  History,
  TrendingUp,
  Monitor,
  ChevronDown,
} from "lucide-react";
import { useRole, type UserRole, type Permission } from "./RoleContext";
import { useTheme } from "next-themes";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
const tataPowerLogoLight = "/tata-power-logo-light.png";
const tataPowerLogoDark = "/tata-power-logo-dark.png";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  route: string;
  badge?: string;
  badgeColor?: string;
  requiredPermission?: Permission;
}

const navItems: NavItem[] = [
  {
    id: "master-home",
    label: "Command Center",
    icon: CloudLightning,
    route: "/master-home",
    requiredPermission: "view_master_home",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    route: "/dashboard",
    requiredPermission: "view_dashboard",
  },
  {
    id: "climate-intelligence",
    label: "Weather Trend",
    icon: BarChart3,
    route: "/climate-intelligence",
    requiredPermission: "view_forecast",
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: AlertTriangle,
    route: "/alerts",
    badge: "3",
    badgeColor: "bg-red-500",
    requiredPermission: "view_alerts",
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileBarChart,
    route: "/reports",
    requiredPermission: "view_reports",
  },
  {
    id: "map",
    label: "Map View",
    icon: Map,
    route: "/map",
    requiredPermission: "view_map",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    route: "/settings",
    requiredPermission: "view_settings",
  },
];

interface AppSidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AppSidebar({ currentRoute, onNavigate, mobileOpen, onMobileClose }: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, can, switchAccount, logout } = useRole();
  const { theme, setTheme } = useTheme();
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(false); // Always expanded on mobile drawer
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onMobileClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen, onMobileClose]);

  // Close account switcher on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccountSwitcher(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleNavigate = (route: string) => {
    onNavigate(route);
    if (isMobile) onMobileClose();
    setShowAccountSwitcher(false);
  };

  const isActive = (route: string) => {
    const basePath = route.split("?")[0];
    const currentBase = currentRoute.split("?")[0];
    return currentBase === basePath || currentRoute === route;
  };

  const filteredNavItems = useMemo(() => {
    return navItems.filter(
      (item) => !item.requiredPermission || can(item.requiredPermission)
    );
  }, [can]);

  const roleLabel = (r: UserRole) =>
    r === "superadmin" ? "Super Admin" : r === "admin" ? "Admin" : "Operator";

  const sidebarWidth = isCollapsed ? "w-[72px]" : "w-[260px]";
  const transition = "transition-all duration-200 ease-out";

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const active = isActive(item.route);
    const Icon = item.icon;

    const button = (
      <button
        onClick={() => handleNavigate(item.route)}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
          text-[13px] font-medium group relative overflow-hidden
          ${transition} active:scale-[0.98]
          ${
            active
              ? "text-primary bg-primary/10 shadow-sm ring-1 ring-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }
          ${isCollapsed ? "justify-center" : ""}
        `}
      >
        {/* Active indicator */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-primary rounded-r-full" />
        )}

        {/* Icon */}
        <span
          className={`
            relative z-10 flex-shrink-0
            ${transition} ${active ? "scale-100" : "group-hover:scale-110"}
            ${isCollapsed ? "" : "ml-1"}
          `}
        >
          <Icon className={`w-[18px] h-[18px] ${active ? "text-primary" : ""}`} />
        </span>

        {/* Label - hidden when collapsed */}
        {!isCollapsed && (
          <span className="flex-1 text-left truncate relative z-10">{item.label}</span>
        )}

        {/* Badge - hidden when collapsed */}
        {!isCollapsed && item.badge && (
          <span
            className={`
              px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm
              ${item.badgeColor || "bg-slate-700"}
              ${item.badgeColor === "bg-red-500" ? "animate-pulse" : ""}
            `}
          >
            {item.badge}
          </span>
        )}
      </button>
    );

    // Wrap with tooltip when collapsed
    if (isCollapsed && !isMobile) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="font-semibold">
            {item.label}
            {item.badge && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px]">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <TooltipProvider>
      {/* Mobile overlay backdrop */}
      {mobileOpen && isMobile && (
        <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300" />
      )}

      <motion.aside
        ref={sidebarRef}
        initial={{ 
          x: -300, 
          opacity: 0,
          filter: "blur(10px)",
        }}
        animate={{ 
          x: 0, 
          opacity: 1,
          filter: "blur(0px)",
        }}
        transition={{
          type: "spring",
          stiffness: 180,
          damping: 25,
          mass: 1,
          duration: 0.6,
        }}
        className={`
          ${isMobile ? "fixed" : "relative"} inset-y-0 left-0 z-50
          ${isMobile ? "w-[260px]" : sidebarWidth}
          flex flex-col
          bg-white/80 dark:bg-black/50 backdrop-blur-2xl
          border-r border-border/40
          ${transition} shadow-2xl lg:shadow-none
          ${isMobile ? (mobileOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        `}
        style={{ height: "100vh" }}
      >
        {/* ═══ TOP SECTION: Logo + Collapse Toggle ═══ */}
        <div className={`
          flex items-center h-20 flex-shrink-0 border-b border-border/30
          ${isCollapsed ? "justify-center px-3" : "justify-between px-6"}
          ${transition}
        `}>
          {/* Logo Area */}
          <div className={`flex items-center gap-3 min-w-0 ${transition}`}>
            <div className={`flex items-center justify-center flex-shrink-0 ${isCollapsed ? "h-9" : "h-10"} ${transition}`}>
              <img 
                src={theme === "dark" ? tataPowerLogoDark : tataPowerLogoLight} 
                alt="TATA Power" 
                className="h-full w-auto object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 opacity-100 animate-in fade-in duration-200">
                <div className="text-foreground text-[15px] font-bold tracking-tight leading-none truncate">
                  WeatherXpert
                </div>
                <div className="text-muted-foreground/60 text-[10px] font-medium mt-1 tracking-wide uppercase">
                  Enterprise Platform
                </div>
              </div>
            )}
          </div>

          {/* Collapse Toggle (Desktop) / Close Button (Mobile) */}
          {isMobile ? (
            <button
              onClick={onMobileClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-xl transition-colors active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={`
                    p-2 text-muted-foreground hover:text-foreground 
                    hover:bg-secondary/60 rounded-xl transition-all active:scale-95
                    ${isCollapsed ? "" : ""}
                  `}
                  aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isCollapsed ? "Expand" : "Collapse"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* ═══ MIDDLE SECTION: Main Navigation - WITH CRAZY STAGGERED ANIMATIONS ═══ */}
        <nav className={`flex-1 px-4 py-4 overflow-y-auto overflow-x-hidden space-y-1 ${transition}`}>
          {filteredNavItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{
                x: -120,
                opacity: 0,
                scale: 0.7,
                filter: "blur(15px) brightness(0.4)",
                rotateY: -45,
                rotateX: 15,
              }}
              animate={{
                x: 0,
                opacity: 1,
                scale: 1,
                filter: "blur(0px) brightness(1)",
                rotateY: 0,
                rotateX: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 22,
                mass: 1.2,
                delay: 0.7 + index * 0.1, // Slower, more dramatic stagger
                duration: 0.8,
              }}
              whileHover={{
                scale: 1.02,
                x: 4,
                transition: { duration: 0.2 },
              }}
              style={{
                transformStyle: "preserve-3d",
                perspective: 1200,
              }}
            >
              <NavItemComponent item={item} />
            </motion.div>
          ))}
        </nav>

        {/* ═══ BOTTOM SECTION: User Profile + Theme Toggle + Logout ═══ */}
        <div className={`
          p-4 space-y-3 border-t border-border/30
          bg-gradient-to-t from-secondary/20 to-transparent
          ${transition}
        `}>
          {/* Theme Toggle */}
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`}>
            {!isCollapsed && (
              null
            )}
            
          </div>

          {/* User Profile */}
          <div className="relative" ref={accountRef}>
            <Tooltip delayDuration={0} open={isCollapsed && !showAccountSwitcher ? undefined : false}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
                  className={`
                    w-full flex items-center gap-3 p-2 rounded-2xl
                    transition-all duration-200 hover:bg-secondary/60
                    border border-transparent hover:border-border/40
                    group active:scale-[0.98]
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                >
                  <div className={`
                    ${isCollapsed ? "w-9 h-9" : "w-10 h-10"}
                    rounded-full flex items-center justify-center
                    text-white text-[12px] font-bold flex-shrink-0
                    ring-2 ring-white/20 shadow-md
                    bg-gradient-to-br from-indigo-500 to-purple-600
                    ${transition}
                  `}>
                    {user.initials}
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-foreground text-[13px] font-bold truncate group-hover:text-primary transition-colors">
                        {user.name}
                      </div>
                      <div className="text-muted-foreground text-[11px] truncate">
                        {user.title}
                      </div>
                    </div>
                  )}

                  {!isCollapsed && (
                    <ChevronDown
                      className={`
                        w-4 h-4 text-muted-foreground/50 group-hover:text-foreground
                        transition-transform duration-300
                        ${showAccountSwitcher ? "rotate-180" : ""}
                      `}
                    />
                  )}
                </button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground">{user.title}</div>
                </TooltipContent>
              )}
            </Tooltip>

            {/* Account Switcher Popover */}
            {showAccountSwitcher && (
              <div
                className={`
                  absolute ${isCollapsed ? "left-full ml-2 bottom-0" : "bottom-full mb-2 left-0 w-full"}
                  z-50 bg-popover/95 backdrop-blur-xl border border-border
                  rounded-2xl p-1.5 shadow-2xl ring-1 ring-black/5 dark:ring-white/10
                  animate-in slide-in-from-bottom-2 duration-200
                  ${isCollapsed ? "min-w-[200px]" : ""}
                `}
              >
                <div className="px-3 py-2 text-[10px] text-muted-foreground uppercase tracking-wider font-bold border-b border-border/50 mb-1">
                  Switch Role
                </div>
                {(["superadmin", "admin", "operator"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchAccount(r);
                      setShowAccountSwitcher(false);
                    }}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-xl transition-all
                      flex items-center gap-3 text-[12px] font-medium active:scale-[0.98]
                      ${
                        user.role === r
                          ? "text-primary bg-primary/10 border border-primary/20"
                          : "text-popover-foreground hover:text-foreground hover:bg-secondary border border-transparent"
                      }
                    `}
                  >
                    <div
                      className={`
                        w-2 h-2 rounded-full flex-shrink-0
                        ${r === "superadmin" ? "bg-emerald-400" : r === "admin" ? "bg-blue-400" : "bg-slate-400"}
                      `}
                    />
                    <span className="flex-1">{roleLabel(r)}</span>
                    {user.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                  </button>
                ))}
                <div className="h-px bg-border/50 my-1" />
                <button
                  className="w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 text-[12px] font-medium text-red-500 hover:bg-red-500/5 hover:border-red-500/10 border border-transparent active:scale-[0.98]"
                  onClick={() => {
                    setShowAccountSwitcher(false);
                    logout();
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}