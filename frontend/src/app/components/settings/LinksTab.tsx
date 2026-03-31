import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ExternalLink, 
  Plus, 
  Edit2, 
  Trash2, 
  Globe, 
  X, 
  ArrowUpRight, 
  Search,
  Filter,
  Check,
  AlertCircle,
  Link as LinkIcon,
  Bookmark,
  Star,
  Eye,
  Copy,
  CheckCircle2,
  CloudRain,
  Zap,
  FileText,
  Wind,
  BarChart3,
  BookOpen,
  Shield,
  Users,
  Building2,
  TrendingUp,
} from "lucide-react";
import { EXTERNAL_LINKS, type ExternalLink as LinkType, UTILITIES } from "./settingsData";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   EXTERNAL LINKS TAB — Complete Link Management
   Search, Filter, CRUD, Validation, Toast Feedback
   ═══════════════════════════════════════════════════ */

const CAT_COLORS: Record<string, { color: string; bg: string; border: string; darkBg: string }> = {
  Weather:    { color: "text-sky-600 dark:text-sky-400",       bg: "bg-sky-500/10",    border: "border-sky-500/20", darkBg: "bg-sky-900/20" },
  Grid:       { color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-500/10",  border: "border-amber-500/20", darkBg: "bg-amber-900/20" },
  Regulatory: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", darkBg: "bg-emerald-900/20" },
  Internal:   { color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", darkBg: "bg-violet-900/20" },
  Analytics:  { color: "text-pink-600 dark:text-pink-400",     bg: "bg-pink-500/10",   border: "border-pink-500/20", darkBg: "bg-pink-900/20" },
  Support:    { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", darkBg: "bg-orange-900/20" },
};

const CATEGORIES = ["Weather", "Grid", "Regulatory", "Internal", "Analytics", "Support"];

interface LinksTabProps { 
  isMobile: boolean; 
}

export function LinksTab({ isMobile }: LinksTabProps) {
  // State Management
  const [links, setLinks] = useState(EXTERNAL_LINKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal State
  const [editModal, setEditModal] = useState<LinkType | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<LinkType | null>(null);
  
  // Form State
  const [formName, setFormName] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formCategory, setFormCategory] = useState("Weather");
  const [formDesc, setFormDesc] = useState("");
  const [formIcon, setFormIcon] = useState<string>("Globe");
  const [formRoleVisibility, setFormRoleVisibility] = useState<("super_admin" | "admin" | "operator")[]>(["super_admin", "admin", "operator"]);
  const [formUtilityScope, setFormUtilityScope] = useState<string[]>([]);
  const [formPriority, setFormPriority] = useState<number>(5);
  const [formActive, setFormActive] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Favorites (stored in state, could be localStorage in production)
  const [favorites, setFavorites] = useState<string[]>(["el1", "el4"]);

  // Filter and Search Logic
  const filteredLinks = useMemo(() => {
    let result = links;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        link =>
          link.name.toLowerCase().includes(query) ||
          link.description.toLowerCase().includes(query) ||
          link.url.toLowerCase().includes(query) ||
          link.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(link => link.category === selectedCategory);
    }

    // Sort: Favorites first, then alphabetically
    result.sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [links, searchQuery, selectedCategory, favorites]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: links.length };
    links.forEach(link => {
      counts[link.category] = (counts[link.category] || 0) + 1;
    });
    return counts;
  }, [links]);

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formName.trim()) {
      errors.name = "Link name is required";
    } else if (formName.length < 3) {
      errors.name = "Name must be at least 3 characters";
    }

    if (!formUrl.trim()) {
      errors.url = "URL is required";
    } else if (!isValidUrl(formUrl)) {
      errors.url = "Please enter a valid URL (must start with http:// or https://)";
    }

    if (!formDesc.trim()) {
      errors.description = "Description is required";
    } else if (formDesc.length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Handlers
  const openCreate = () => {
    setCreating(true);
    setEditModal(null);
    setFormName("");
    setFormUrl("");
    setFormCategory("Weather");
    setFormDesc("");
    setFormIcon("Globe");
    setFormRoleVisibility(["super_admin", "admin", "operator"]);
    setFormUtilityScope([]);
    setFormPriority(5);
    setFormActive(true);
    setFormErrors({});
  };

  const openEdit = (link: LinkType) => {
    setCreating(false);
    setEditModal(link);
    setFormName(link.name);
    setFormUrl(link.url);
    setFormCategory(link.category);
    setFormDesc(link.description);
    setFormIcon(link.icon || "Globe");
    setFormRoleVisibility(link.roleVisibility || ["super_admin", "admin", "operator"]);
    setFormUtilityScope(link.utilityScope || []);
    setFormPriority(link.priority || 5);
    setFormActive(link.active || true);
    setFormErrors({});
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors before saving");
      return;
    }

    if (editModal) {
      // Update existing link
      setLinks(prev =>
        prev.map(l =>
          l.id === editModal.id
            ? { ...l, name: formName.trim(), url: formUrl.trim(), category: formCategory, description: formDesc.trim(), icon: formIcon, roleVisibility: formRoleVisibility, utilityScope: formUtilityScope, priority: formPriority, active: formActive }
            : l
        )
      );
      toast.success("Link updated successfully", {
        description: `${formName} has been updated`,
      });
    } else {
      // Create new link
      const newLink: LinkType = {
        id: `el${Date.now()}`,
        name: formName.trim(),
        url: formUrl.trim(),
        category: formCategory,
        description: formDesc.trim(),
        openInNew: true,
        icon: formIcon,
        roleVisibility: formRoleVisibility,
        utilityScope: formUtilityScope,
        priority: formPriority,
        active: formActive,
      };
      setLinks(prev => [...prev, newLink]);
      toast.success("Link created successfully", {
        description: `${formName} has been added`,
      });
    }

    closeModal();
  };

  const handleDelete = (link: LinkType) => {
    setLinks(prev => prev.filter(l => l.id !== link.id));
    toast.success("Link deleted", {
      description: `${link.name} has been removed`,
    });
    setDeleteConfirm(null);
  };

  const closeModal = () => {
    setEditModal(null);
    setCreating(false);
    setFormErrors({});
  };

  const toggleFavorite = (linkId: string) => {
    setFavorites(prev =>
      prev.includes(linkId) ? prev.filter(id => id !== linkId) : [...prev, linkId]
    );
  };

  const copyUrl = (url: string, name: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard", {
      description: name,
    });
  };

  const openLink = (link: LinkType) => {
    window.open(link.url, "_blank", "noopener,noreferrer");
    toast.info("Opening external link", {
      description: link.name,
      duration: 1500,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search links by name, URL, or description..."
            className="w-full pl-10 pr-10 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              showFilters || selectedCategory !== "all"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {selectedCategory !== "all" && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                1
              </span>
            )}
          </button>

          {/* Add Link Button */}
          {!isMobile && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:shadow-primary/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Link
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Filter by Category</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === "all"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-white dark:bg-black/20 text-muted-foreground hover:text-foreground border border-black/5 dark:border-white/10"
                  }`}
                >
                  All ({categoryCounts.all || 0})
                </button>
                {CATEGORIES.map(cat => {
                  const style = CAT_COLORS[cat] || CAT_COLORS.Internal;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        selectedCategory === cat
                          ? `${style.bg} ${style.color} ${style.border} shadow-md`
                          : "bg-white dark:bg-black/20 text-muted-foreground hover:text-foreground border-black/5 dark:border-white/10"
                      }`}
                    >
                      {cat} ({categoryCounts[cat] || 0})
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <p>
          Showing <span className="font-bold text-foreground">{filteredLinks.length}</span> of{" "}
          <span className="font-bold text-foreground">{links.length}</span> links
          {searchQuery && (
            <span className="ml-1">
              for "<span className="text-primary font-medium">{searchQuery}</span>"
            </span>
          )}
        </p>
        {(searchQuery || selectedCategory !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Links Grid */}
      {filteredLinks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-4"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <LinkIcon className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">No links found</h3>
          <p className="text-xs text-muted-foreground text-center max-w-sm mb-4">
            {searchQuery || selectedCategory !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by adding your first external link"}
          </p>
          {!isMobile && !searchQuery && selectedCategory === "all" && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Link
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredLinks.map((link, index) => {
            const style = CAT_COLORS[link.category] || CAT_COLORS.Internal;
            const isFavorite = favorites.includes(link.id);
            
            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md p-5 transition-all duration-300 hover:bg-white/60 dark:hover:bg-white/5 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5"
              >
                {/* Favorite Star */}
                <button
                  onClick={() => toggleFavorite(link.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5 dark:hover:bg-white/5"
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star
                    className={`w-4 h-4 transition-colors ${
                      isFavorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                    }`}
                  />
                </button>

                <div className="flex items-start gap-4 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg} ${style.border} border shadow-sm`}
                  >
                    <Globe className={`w-5 h-5 ${style.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-[13px] text-foreground font-bold truncate tracking-tight pr-8">
                        {link.name}
                      </h3>
                    </div>
                    <span
                      className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${style.bg} ${style.color} ${style.border}`}
                    >
                      {link.category}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground/70 mb-4 leading-relaxed line-clamp-2 min-h-[2.5em]">
                  {link.description}
                </p>

                {/* URL Preview */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <ExternalLink className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="text-[10px] text-foreground/80 font-mono truncate flex-1">
                      {link.url}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openLink(link)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium group/btn"
                  >
                    <ArrowUpRight className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    Open
                  </button>
                  <button
                    onClick={() => copyUrl(link.url, link.name)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>

                {/* Admin Actions */}
                {!isMobile && (
                  <div className="absolute top-12 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(link)}
                      className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit link"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(link)}
                      className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete link"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View-Only Mobile Notice */}
      {isMobile && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
          <Eye className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">View-Only Mode</p>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-500/80 mt-0.5">
              Link management is restricted on mobile. Use desktop to add, edit, or delete links.
            </p>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(editModal || creating) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-zinc-900 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5 flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex-shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {creating ? "Add External Link" : "Edit External Link"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {creating
                      ? "Add a new external resource for quick access"
                      : "Update link details and configuration"}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground hover:text-foreground hover:bg-black/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Name Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1 flex items-center gap-1">
                    Link Name
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    value={formName}
                    onChange={e => {
                      setFormName(e.target.value);
                      if (formErrors.name) setFormErrors(prev => ({ ...prev, name: "" }));
                    }}
                    className={`w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border ${
                      formErrors.name ? "border-destructive/50" : "border-transparent focus:border-primary/30"
                    } rounded-xl text-xs text-foreground outline-none focus:ring-2 ${
                      formErrors.name ? "focus:ring-destructive/20" : "focus:ring-primary/20"
                    } transition-all`}
                    placeholder="e.g. Weather Radar Dashboard"
                  />
                  {formErrors.name && (
                    <div className="flex items-center gap-1.5 text-[10px] text-destructive mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.name}
                    </div>
                  )}
                </div>

                {/* URL Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1 flex items-center gap-1">
                    URL
                    <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                    <input
                      value={formUrl}
                      onChange={e => {
                        setFormUrl(e.target.value);
                        if (formErrors.url) setFormErrors(prev => ({ ...prev, url: "" }));
                      }}
                      className={`w-full pl-9 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border ${
                        formErrors.url ? "border-destructive/50" : "border-transparent focus:border-primary/30"
                      } rounded-xl text-xs text-foreground font-mono outline-none focus:ring-2 ${
                        formErrors.url ? "focus:ring-destructive/20" : "focus:ring-primary/20"
                      } transition-all`}
                      placeholder="https://example.com"
                    />
                  </div>
                  {formErrors.url && (
                    <div className="flex items-center gap-1.5 text-[10px] text-destructive mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.url}
                    </div>
                  )}
                </div>

                {/* Category Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full pl-4 pr-8 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none transition-all"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c} className="bg-popover">
                          {c}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                      ▼
                    </div>
                  </div>
                  {/* Category Preview */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-muted-foreground">Preview:</span>
                    {(() => {
                      const style = CAT_COLORS[formCategory] || CAT_COLORS.Internal;
                      return (
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${style.bg} ${style.color} ${style.border}`}
                        >
                          {formCategory}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Description Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1 flex items-center gap-1">
                    Description
                    <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={formDesc}
                    onChange={e => {
                      setFormDesc(e.target.value);
                      if (formErrors.description) setFormErrors(prev => ({ ...prev, description: "" }));
                    }}
                    className={`w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border ${
                      formErrors.description ? "border-destructive/50" : "border-transparent focus:border-primary/30"
                    } rounded-xl text-xs text-foreground outline-none focus:ring-2 ${
                      formErrors.description ? "focus:ring-destructive/20" : "focus:ring-primary/20"
                    } transition-all resize-none`}
                    placeholder="Brief description of what this link provides..."
                    rows={3}
                  />
                  <div className="flex items-center justify-between text-[10px]">
                    {formErrors.description ? (
                      <div className="flex items-center gap-1.5 text-destructive">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.description}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{formDesc.length} characters</span>
                    )}
                  </div>
                </div>

                {/* Icon Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">
                    Icon
                  </label>
                  <div className="relative">
                    <select
                      value={formIcon}
                      onChange={e => setFormIcon(e.target.value)}
                      className="w-full pl-4 pr-8 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none transition-all"
                    >
                      <option value="CloudRain">☁️ Cloud Rain (Weather)</option>
                      <option value="Zap">⚡ Zap (Power/Grid)</option>
                      <option value="FileText">📄 File Text (Documents)</option>
                      <option value="Wind">💨 Wind (Weather)</option>
                      <option value="BarChart3">📊 Bar Chart (Analytics)</option>
                      <option value="BookOpen">📖 Book Open (Wiki/Docs)</option>
                      <option value="Globe">🌐 Globe (Default)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Role Visibility */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1 flex items-center gap-1">
                    Role Visibility
                    <span className="text-destructive">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["super_admin", "admin", "operator"].map((role) => {
                      const isSelected = formRoleVisibility.includes(role as any);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormRoleVisibility(prev => prev.filter(r => r !== role));
                            } else {
                              setFormRoleVisibility(prev => [...prev, role as any]);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-[10px] font-semibold border transition-all ${
                            isSelected
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-black/5 dark:bg-white/5 text-muted-foreground border-transparent hover:border-black/10 dark:hover:border-white/10"
                          }`}
                        >
                          {role === "super_admin" ? "Super Admin" : role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 ml-1">
                    Select which roles can see this link in the header
                  </p>
                </div>

                {/* Utility Scope (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1 flex items-center gap-1">
                    Utility Scope
                    <span className="text-[9px] text-muted-foreground/50 normal-case font-normal">(Optional)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {UTILITIES.map((utility) => {
                      const isSelected = formUtilityScope.includes(utility);
                      return (
                        <button
                          key={utility}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormUtilityScope(prev => prev.filter(u => u !== utility));
                            } else {
                              setFormUtilityScope(prev => [...prev, utility]);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-[10px] font-semibold border transition-all ${
                            isSelected
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-black/5 dark:bg-white/5 text-muted-foreground border-transparent hover:border-black/10 dark:hover:border-white/10"
                          }`}
                        >
                          {utility}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 ml-1">
                    Leave empty to show for all utilities
                  </p>
                </div>

                {/* Display Priority */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1 flex items-center justify-between">
                    <span>Display Priority</span>
                    <span className="text-primary font-mono">{formPriority}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formPriority}
                    onChange={e => setFormPriority(Number(e.target.value))}
                    className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground/50">
                    <span>1 (Low)</span>
                    <span>10 (High)</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 ml-1">
                    Higher priority links appear first in the header (max 5 visible)
                  </p>
                </div>

                {/* Active Toggle */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">
                    Status
                  </label>
                  <div className="flex items-center justify-between px-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl border border-transparent">
                    <div>
                      <p className="text-xs font-semibold text-foreground">Active</p>
                      <p className="text-[10px] text-muted-foreground/60">
                        {formActive ? "Link is visible in header" : "Link is hidden"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormActive(!formActive)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        formActive ? "bg-primary" : "bg-black/20 dark:bg-white/20"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          formActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex-shrink-0">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-transparent border border-black/10 dark:border-white/10 rounded-xl text-xs text-muted-foreground font-semibold hover:text-foreground hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formName.trim() || !formUrl.trim() || !formDesc.trim()}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {creating ? "Create Link" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Delete External Link?</h3>
                <p className="text-xs text-muted-foreground mb-1">
                  Are you sure you want to delete <span className="font-bold text-foreground">"{deleteConfirm.name}"</span>?
                </p>
                <p className="text-xs text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-transparent border border-black/10 dark:border-white/10 rounded-xl text-xs text-muted-foreground font-semibold hover:text-foreground hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-5 py-2 bg-destructive text-destructive-foreground rounded-xl text-xs font-semibold hover:bg-destructive/90 transition-all shadow-md hover:shadow-lg"
                >
                  Delete Link
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}