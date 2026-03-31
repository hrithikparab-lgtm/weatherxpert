import { toast, Toaster } from "sonner";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { useRole, UTILITIES } from "./RoleContext";
import { useBookmarks } from "./BookmarkContext";
import { BookmarkPanel, BookmarkIconButton } from "./BookmarkPanel";
import { UtilitySelector } from "./UtilitySelector";
import { NotificationBell } from "./alerts/NotificationBell";
import { getGlobalAlertCounts } from "./NotificationDrawer";
import { EXTERNAL_LINKS, type ExternalLink } from "./settings/settingsData";
import { ExternalLinksQuickAccess } from "./ExternalLinksQuickAccess";
import {
  Menu,
  Bell,
  Search,
  X,
  Sun,
  Moon,
  Monitor,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Check,
  MapPin,
  MapPinned,
  Zap,
  Wind,
  Thermometer,
  ChevronDown,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   MOCK SEARCH DATA — Locations across TATA Power sites
   ═══════════════════════════════════════════════════ */
const SEARCH_LOCATIONS = [
  { name: "Mumbai — Colaba", region: "Mumbai Distribution", type: "substation" },
  { name: "Mumbai — Andheri West", region: "Mumbai Distribution", type: "substation" },
  { name: "Mumbai — Bandra East", region: "Mumbai Distribution", type: "feeder" },
  { name: "Mumbai — Powai", region: "Mumbai Distribution", type: "substation" },
  { name: "Delhi — Connaught Place", region: "Delhi Distribution", type: "substation" },
  { name: "Delhi — Dwarka Sector 12", region: "Delhi Distribution", type: "feeder" },
  { name: "Delhi — Rohini Zone", region: "Delhi Distribution", type: "substation" },
  { name: "Mundra — UMPP Block A", region: "Mundra UMPP", type: "plant" },
  { name: "Mundra — Solar Array East", region: "Renewables - Solar", type: "plant" },
  { name: "Maithon — Thermal Unit 1", region: "Maithon Power", type: "plant" },
  { name: "Jojobera — Power Station", region: "Maithon Power", type: "plant" },
  { name: "Rajasthan — Wind Farm W1", region: "Renewables - Wind", type: "plant" },
  { name: "Gujarat — Solar Park S3", region: "Renewables - Solar", type: "plant" },
] as const;

/* ═══════════════════════════════════════════════════
   COMMAND CENTER LOCATIONS — For location-based data filtering
   ═══════════════════════════════════════════════════ */
const COMMAND_CENTER_LOCATIONS = [
  "All Utilities",
  "Mumbai Distribution",
  "Gujarat — Wind Farm Cluster",
  "Rajasthan — Solar Array Network",
  "Maharashtra — Renewable Hub",
  "Tamil Nadu — Wind Corridor",
  "Karnataka — Solar + Wind Hybrid",
  "Andhra Pradesh — Coastal Wind Zone",
  "Madhya Pradesh — Solar Belt",
] as const;

interface TopBarProps {
  onMenuToggle: () => void;
  onNotificationClick: () => void;
  pageTitle?: string;
  currentRoute?: string;
  onLocationChange?: (location: string) => void;
}

export function TopBar({ onMenuToggle, onNotificationClick, pageTitle, currentRoute, onLocationChange }: TopBarProps) {
  const { user, can, activeUtility, setActiveUtility } = useRole();
  const { theme, setTheme, resolvedTheme } = useTheme();

  /* ── Dropdown states ── */
  const [showUtilityDropdown, setShowUtilityDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  
  /* ── Bookmark state ── */
  const [showBookmarkPanel, setShowBookmarkPanel] = useState(false);
  const { bookmarkCount } = useBookmarks();

  /* ── Command Center Location State — Synced with global utility context ── */
  const [selectedLocation, setSelectedLocation] = useState<string>(activeUtility);

  /* ── Search states ── */
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchFocused, setMobileSearchFocused] = useState(false);

  /* ── Refresh state: idle → spinning → done → idle ── */
  const [refreshState, setRefreshState] = useState<"idle" | "spinning" | "done">("idle");

  /* ── Live clock ── */
  const [liveTime, setLiveTime] = useState(new Date());

  /* ── Hydration guard ── */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* ── Refs for outside-click ── */
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  /* ═══ Sync selectedLocation with global activeUtility ═══ */
  useEffect(() => {
    setSelectedLocation(activeUtility);
  }, [activeUtility]);

  /* ═══ Live Clock — updates every 30 s ═══ */
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const currentTime = liveTime.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  /* ═══ Outside-click handler ═══ */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUtilityDropdown(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setShowThemeDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setMobileSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ═══ Search filtering ═══ */
  const filteredLocations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return SEARCH_LOCATIONS.filter(
      (l) => l.name.toLowerCase().includes(q) || l.region.toLowerCase().includes(q) || l.type.includes(q)
    );
  }, [searchQuery]);

  const mobileFilteredLocations = useMemo(() => {
    const q = mobileSearchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return SEARCH_LOCATIONS.filter(
      (l) => l.name.toLowerCase().includes(q) || l.region.toLowerCase().includes(q) || l.type.includes(q)
    );
  }, [mobileSearchQuery]);

  const handleLocationSelect = useCallback((locationName: string) => {
    toast.success(`Location selected: ${locationName}`, {
      description: "Weather data view updated for this location.",
      duration: 2500,
    });
    setSearchQuery("");
    setMobileSearchQuery("");
    setSearchFocused(false);
    setMobileSearchFocused(false);
    setShowMobileSearch(false);
    if (onLocationChange) onLocationChange(locationName);
  }, [onLocationChange]);

  /* ═══ Refresh with proper feedback ═══ */
  const handleRefresh = useCallback(() => {
    if (refreshState !== "idle") return;
    setRefreshState("spinning");
    setTimeout(() => {
      setRefreshState("done");
      toast.success("Data refreshed", {
        description: `Latest readings synced for ${activeUtility}.`,
        duration: 2000,
      });
      setTimeout(() => setRefreshState("idle"), 1400);
    }, 1500);
  }, [refreshState, activeUtility]);

  /* ═══ Permissions ═══ */
  const canSwitchUtility = can("switch_utility");

  /* ═══ Global Alert Counts ═══ */
  const alertCounts = useMemo(() => {
    return getGlobalAlertCounts(user.role, activeUtility);
  }, [user.role, activeUtility]);

  /* ═══ Alert Dot Color Based on Severity ═══ */
  const getAlertDotColor = () => {
    if (alertCounts.total === 0) return null;
    
    switch (alertCounts.highestSeverity) {
      case "extreme":
        return "bg-red-600"; // Darker red for extreme
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const alertDotColor = getAlertDotColor();
  const isExtremeSeverity = alertCounts.highestSeverity === "extreme";

  /* ═══ Theme icon — shows resolved state (Sun/Moon) ═══ */
  const getThemeIcon = () => {
    if (!mounted) return <Sun className="w-4 h-4" />;
    if (resolvedTheme === "dark") return <Moon className="w-4 h-4" />;
    return <Sun className="w-4 h-4" />;
  };

  /* ═══ Refresh button icon with 3-state feedback ═══ */
  const getRefreshIcon = () => {
    if (refreshState === "spinning") {
      return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
    }
    if (refreshState === "done") {
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
    return <RefreshCw className="w-4 h-4" />;
  };

  /* ═══ Search results dropdown (shared for desktop & mobile) ═══ */
  const renderSearchResults = (
    results: typeof SEARCH_LOCATIONS,
    query: string
  ) => {
    if (query.trim().length < 2) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-1.5 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
        {results.length === 0 ? (
          <div className="px-4 py-5 text-center">
            <Search className="w-5 h-5 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-[12px] text-muted-foreground">
              No locations found for "<span className="text-foreground">{query}</span>"
            </p>
          </div>
        ) : (
          <>
            <div className="px-3 py-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold bg-secondary/40 border-b border-border/50">
              {results.length} Location{results.length > 1 ? "s" : ""} Found
            </div>
            <div className="max-h-56 overflow-y-auto">
              {results.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => handleLocationSelect(loc.name)}
                  className="w-full text-left px-3 py-2.5 hover:bg-secondary transition-colors flex items-center gap-3 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    {loc.type === "substation" && <Zap className="w-3.5 h-3.5 text-primary" />}
                    {loc.type === "feeder" && <Wind className="w-3.5 h-3.5 text-amber-500" />}
                    {loc.type === "plant" && <Thermometer className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-foreground truncate">{loc.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{loc.region}</p>
                  </div>
                  <MapPinned className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <header
        className="backdrop-blur-md bg-background/80 border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-20 sticky top-0 transition-colors duration-300"
        style={{ height: "var(--topbar-height, 64px)", minHeight: "var(--topbar-height, 64px)" }}
      >
        {/* ═══ Left Section ═══ */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Hamburger menu — mobile only */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0 text-muted-foreground hover:text-foreground active:scale-95"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* ── Utility/Location Selector ── */}
          <div className="relative" ref={dropdownRef}>
            {/* Show Location Selector for Command Center page */}
            {currentRoute === "/master-home" ? (
              <button
                onClick={() => setShowUtilityDropdown(!showUtilityDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600/10 dark:bg-emerald-500/10 hover:bg-emerald-600/15 dark:hover:bg-emerald-500/15 rounded-lg transition-colors border border-emerald-600/30 dark:border-emerald-500/30 group min-w-0 active:scale-[0.98]"
              >
                <MapPinned className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-[13px] text-emerald-700 dark:text-emerald-300 truncate font-medium max-w-[150px] md:max-w-none">
                  {selectedLocation === "All Locations" ? "All Utilities" : selectedLocation}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 transition-transform duration-200 ${
                    showUtilityDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
            ) : canSwitchUtility ? (
              <button
                onClick={() => setShowUtilityDropdown(!showUtilityDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors border border-border group min-w-0 active:scale-[0.98]"
              >
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-[13px] text-foreground truncate font-medium max-w-[120px] md:max-w-none">
                  {activeUtility}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                    showUtilityDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg border border-border min-w-0">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-[13px] text-foreground truncate font-medium">
                  {activeUtility}
                </span>
              </div>
            )}

            {/* Location dropdown for Command Center */}
            {showUtilityDropdown && currentRoute === "/master-home" && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-popover border border-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold bg-secondary/50 flex items-center gap-2">
                  <Wind className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Select Renewable Location
                </div>
                {COMMAND_CENTER_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setShowUtilityDropdown(false);
                      if (onLocationChange) onLocationChange(loc);
                      toast.success(`Location switched to ${loc}`, { 
                        description: "Renewable energy data updated",
                        duration: 2000 
                      });
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-secondary transition-colors flex items-center justify-between ${
                      loc === selectedLocation ? "text-emerald-600 dark:text-emerald-400 bg-emerald-600/10 dark:bg-emerald-500/10" : "text-foreground"
                    }`}
                  >
                    <span className="truncate">{loc}</span>
                    {loc === selectedLocation && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            {/* Utility dropdown for other pages */}
            {showUtilityDropdown && currentRoute !== "/master-home" && canSwitchUtility && (
              <div className="absolute top-full left-0 mt-2 w-60 bg-popover border border-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold bg-secondary/50">
                  Select Utility
                </div>
                {UTILITIES.map((u) => (
                  <button
                    key={u}
                    onClick={() => {
                      setActiveUtility(u);
                      setShowUtilityDropdown(false);
                      toast.success(`Switched to ${u}`, { duration: 1800 });
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-secondary transition-colors flex items-center justify-between ${
                      u === activeUtility ? "text-primary bg-primary/10" : "text-foreground"
                    }`}
                  >
                    <span className="truncate">{u}</span>
                    {u === activeUtility && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Desktop Search ── */}
          <div className="relative hidden md:block" ref={searchRef}>
            <div className="relative group">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-56 lg:w-64 pl-9 pr-8 py-2 bg-secondary/50 rounded-lg text-[13px] text-foreground border border-transparent focus:border-primary/50 outline-none focus:bg-secondary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setSearchFocused(false); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {/* Desktop search results */}
            {searchFocused && renderSearchResults(filteredLocations, searchQuery)}
          </div>
        </div>

        {/* ═══ Right Section ═══ */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => {
              setShowMobileSearch(!showMobileSearch);
              if (showMobileSearch) setMobileSearchQuery("");
            }}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground active:scale-95"
          >
            {showMobileSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* ── Global Alert Notification Bell ── */}
          <NotificationBell
            onClick={onNotificationClick}
            alertCounts={alertCounts}
          />

          {/* ── Global Bookmark Button ── */}
          <BookmarkIconButton
            onClick={() => setShowBookmarkPanel(true)}
            bookmarkCount={bookmarkCount}
          />

          {/* ── Utility Selector ── */}
          <div className="hidden lg:block">
            <UtilitySelector />
          </div>

          {/* ── Theme Toggle ── */}
          <div className="relative" ref={themeDropdownRef}>
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className={`p-2 rounded-lg transition-all text-muted-foreground hover:text-foreground active:scale-95 ${
                showThemeDropdown ? "bg-secondary text-foreground" : "hover:bg-secondary"
              }`}
              title={`Theme: ${mounted ? (theme === "system" ? `System (${resolvedTheme})` : theme) : "loading"}`}
            >
              {getThemeIcon()}
            </button>

            {showThemeDropdown && (
              <div className="absolute top-full right-0 mt-2 w-44 bg-popover border border-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  Appearance
                </div>
                {([
                  { key: "light" as const, label: "Light", icon: <Sun className="w-3.5 h-3.5" />, desc: "Day Mode" },
                  { key: "dark" as const, label: "Dark", icon: <Moon className="w-3.5 h-3.5" />, desc: "Night Mode" },
                  { key: "system" as const, label: "System", icon: <Monitor className="w-3.5 h-3.5" />, desc: "Auto" },
                ]).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setTheme(opt.key);
                      setShowThemeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[13px] hover:bg-secondary transition-colors flex items-center gap-2.5 ${
                      theme === opt.key ? "text-primary bg-primary/5" : "text-foreground"
                    }`}
                  >
                    {opt.icon}
                    <div className="flex-1 min-w-0">
                      <span className="block">{opt.label}</span>
                      <span className="block text-[10px] text-muted-foreground">{opt.desc}</span>
                    </div>
                    {theme === opt.key && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── External Links Quick Access ── */}
          <ExternalLinksQuickAccess />

          {/* ── LIVE Status ── */}
          
        </div>
      </header>

      {/* ═══ Mobile Search Panel ═══ */}
      {showMobileSearch && (
        <div
          ref={mobileSearchRef}
          className="bg-background border-b border-border p-4 md:hidden z-10 relative flex-shrink-0 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search locations..."
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              onFocus={() => setMobileSearchFocused(true)}
              className="w-full pl-10 pr-10 py-2.5 bg-secondary rounded-lg text-[14px] text-foreground border-none outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
              autoFocus
            />
            {mobileSearchQuery && (
              <button
                onClick={() => setMobileSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Mobile search results */}
          {mobileSearchFocused && (
            <div className="mt-2">
              {mobileSearchQuery.trim().length >= 2 && (
                <div className="bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
                  {mobileFilteredLocations.length === 0 ? (
                    <div className="px-4 py-5 text-center">
                      <Search className="w-5 h-5 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-[12px] text-muted-foreground">
                        No locations found for "<span className="text-foreground">{mobileSearchQuery}</span>"
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="px-3 py-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold bg-secondary/40 border-b border-border/50">
                        {mobileFilteredLocations.length} Location{mobileFilteredLocations.length > 1 ? "s" : ""} Found
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {mobileFilteredLocations.map((loc) => (
                          <button
                            key={loc.name}
                            onClick={() => handleLocationSelect(loc.name)}
                            className="w-full text-left px-3 py-2.5 hover:bg-secondary transition-colors flex items-center gap-3"
                          >
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {loc.type === "substation" && <Zap className="w-3.5 h-3.5 text-primary" />}
                              {loc.type === "feeder" && <Wind className="w-3.5 h-3.5 text-amber-500" />}
                              {loc.type === "plant" && <Thermometer className="w-3.5 h-3.5 text-emerald-500" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] text-foreground truncate">{loc.name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{loc.region}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* ═══ Global Bookmark Panel ═══ */}
      <BookmarkPanel
        isOpen={showBookmarkPanel}
        onClose={() => setShowBookmarkPanel(false)}
        userId={user.id}
      />
      
      <Toaster />
    </>
  );
}