import { useMemo, useState, useRef, useEffect } from "react";
import { EXTERNAL_LINKS } from "./settings/settingsData";
import { useRole } from "./RoleContext";
import {
  CloudRain,
  Zap,
  FileText,
  Wind,
  BarChart3,
  BookOpen,
  Globe,
  MoreHorizontal,
  ExternalLink as ExternalLinkIcon,
} from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   EXTERNAL LINKS QUICK ACCESS — Global Header Component
   Role-based filtering · Max 5 visible · Responsive
   ═══════════════════════════════════════════════════ */

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
  CloudRain,
  Zap,
  FileText,
  Wind,
  BarChart3,
  BookOpen,
  Globe,
};

export function ExternalLinksQuickAccess() {
  const { user, activeUtility } = useRole();
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMoreDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter links based on role and utility
  const visibleLinks = useMemo(() => {
    return EXTERNAL_LINKS
      .filter((link) => {
        // Filter by active status
        if (!link.active) return false;

        // Filter by role visibility
        if (!link.roleVisibility.includes(user.role as any)) return false;

        // Filter by utility scope (if specified)
        if (link.utilityScope && link.utilityScope.length > 0) {
          if (!link.utilityScope.includes(activeUtility)) return false;
        }

        return true;
      })
      .sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)
  }, [user.role, activeUtility]);

  const primaryLinks = visibleLinks.slice(0, 5);
  const overflowLinks = visibleLinks.slice(5);

  const handleLinkClick = (link: typeof EXTERNAL_LINKS[0]) => {
    window.open(link.url, "_blank", "noopener,noreferrer");
    toast.info("Opening external resource", {
      description: link.name,
      duration: 1500,
    });
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return ExternalLinkIcon;
    return ICON_MAP[iconName] || ExternalLinkIcon;
  };

  if (visibleLinks.length === 0) return null;

  return (
    <>
      {/* Desktop: Inline icons */}
      <div className="hidden lg:flex items-center gap-1 pl-2 border-l border-border">
        {primaryLinks.map((link) => {
          const Icon = getIcon(link.icon);
          return (
            <div key={link.id} className="relative group/tooltip">
              <button
                onClick={() => handleLinkClick(link)}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                aria-label={link.name}
              >
                <Icon className="w-4 h-4" />
              </button>
              
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                <p className="text-[11px] text-foreground font-medium">{link.name}</p>
              </div>
            </div>
          );
        })}

        {/* More dropdown if overflow */}
        {overflowLinks.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <div className="relative group/tooltip">
              <button
                onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                className={`p-2 rounded-lg transition-colors active:scale-95 ${
                  showMoreDropdown
                    ? "bg-secondary text-foreground"
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                aria-label="More links"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {/* Tooltip */}
              {!showMoreDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  <p className="text-[11px] text-foreground font-medium">More Resources</p>
                </div>
              )}
            </div>

            {showMoreDropdown && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-popover border border-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  More Resources
                </div>
                {overflowLinks.map((link) => {
                  const Icon = getIcon(link.icon);
                  return (
                    <button
                      key={link.id}
                      onClick={() => {
                        handleLinkClick(link);
                        setShowMoreDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-[13px] hover:bg-secondary transition-colors flex items-center gap-2.5"
                    >
                      <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="flex-1 truncate">{link.name}</span>
                      <ExternalLinkIcon className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tablet: Collapse all into dropdown */}
      <div className="hidden md:flex lg:hidden items-center pl-2 border-l border-border" ref={dropdownRef}>
        <button
          onClick={() => setShowMoreDropdown(!showMoreDropdown)}
          className={`p-2 rounded-lg transition-colors active:scale-95 ${
            showMoreDropdown
              ? "bg-secondary text-foreground"
              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
          }`}
          title="External links"
        >
          <ExternalLinkIcon className="w-4 h-4" />
        </button>

        {showMoreDropdown && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-popover border border-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3 py-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              External Resources
            </div>
            {visibleLinks.map((link) => {
              const Icon = getIcon(link.icon);
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    handleLinkClick(link);
                    setShowMoreDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-[13px] hover:bg-secondary transition-colors flex items-center gap-2.5"
                >
                  <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="flex-1 truncate">{link.name}</span>
                  <ExternalLinkIcon className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile: Show as icon that opens in new tab - handled by sidebar */}
    </>
  );
}