import { useState, useEffect, useRef } from "react";
import {
  Star,
  X,
  Plus,
  ExternalLink,
  Trash2,
  Globe,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useBookmarks } from "./BookmarkContext";

/* ═══════════════════════════════════════════════════
   GLOBAL HEADER BOOKMARK SYSTEM
   Role-independent personal bookmark management
   ═══════════════════════════════════════════════════ */

export interface Bookmark {
  bookmark_id: string;
  user_id: string;
  name: string;
  url: string;
  source_type: "Manual" | "ExternalLink"; // NEW: Track bookmark source
  source_id?: string; // NEW: Link to external_links_master if applicable
  created_at: string;
  updated_at: string;
}

interface BookmarkPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

// Mock bookmarks data (in production, this would come from Supabase)
const MOCK_BOOKMARKS: Bookmark[] = [
  {
    bookmark_id: "bm-001",
    user_id: "user-001",
    name: "IMD Weather",
    url: "https://www.imd.gov.in",
    source_type: "Manual",
    created_at: "2025-02-20T10:30:00Z",
    updated_at: "2025-02-20T10:30:00Z",
  },
  {
    bookmark_id: "bm-002",
    user_id: "user-001",
    name: "Tomorrow.io",
    url: "https://www.tomorrow.io",
    source_type: "Manual",
    created_at: "2025-02-21T14:15:00Z",
    updated_at: "2025-02-21T14:15:00Z",
  },
  {
    bookmark_id: "bm-003",
    user_id: "user-001",
    name: "IMD Weather",
    url: "https://mausam.imd.gov.in",
    source_type: "Manual",
    created_at: "2025-02-22T09:45:00Z",
    updated_at: "2025-02-22T09:45:00Z",
  },
];

// Get favicon URL from website URL
function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return "";
  }
}

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

export function BookmarkPanel({ isOpen, onClose, userId }: BookmarkPanelProps) {
  const { bookmarks, addBookmark, removeBookmark, isBookmarked: checkIfBookmarked } = useBookmarks();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Handle add bookmark
  const handleAddBookmark = (name: string, url: string) => {
    addBookmark({
      user_id: userId,
      name,
      url,
      source_type: "Manual",
    });
    setShowAddModal(false);
  };

  // Handle delete bookmark
  const handleDeleteBookmark = (bookmarkId: string) => {
    const bookmark = bookmarks.find((b) => b.bookmark_id === bookmarkId);
    if (bookmark) {
      removeBookmark(bookmark.url);
      setDeleteConfirmId(null);
    }
  };

  // Check for duplicate URL
  const isDuplicateUrl = (url: string): boolean => {
    return checkIfBookmarked(url);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200" />

      {/* Slide Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full sm:w-[360px] bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary fill-primary" />
            <h2 className="font-semibold text-foreground">My Bookmarks</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close bookmarks panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto">
          {bookmarks.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Star className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No bookmarks added yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
                Save frequently used external links for quick access.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Bookmark
              </button>
            </div>
          ) : (
            // Bookmark List
            <div className="p-4 space-y-2">
              {bookmarks.map((bookmark) => {
                const isWeatherEx = bookmark.url.includes("weatherex.ai");
                return (
                <div
                  key={bookmark.bookmark_id}
                  className={`group relative border rounded-xl p-4 transition-all ${
                    isWeatherEx
                      ? "bg-gradient-to-r from-sky-500/8 to-blue-500/5 border-sky-400/25 hover:border-sky-400/40 hover:from-sky-500/12"
                      : "bg-card border-border hover:bg-muted/50 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Favicon / Icon */}
                    <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden ${
                      isWeatherEx ? "bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/25" : "bg-muted"
                    }`}>
                      {isWeatherEx ? (
                        <Globe className="w-4.5 h-4.5 text-white" />
                      ) : getFaviconUrl(bookmark.url) ? (
                        <img
                          src={getFaviconUrl(bookmark.url)}
                          alt=""
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      {!isWeatherEx && <Globe className="w-4 h-4 text-muted-foreground hidden" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-semibold text-sm text-foreground truncate">
                          {bookmark.name}
                        </h4>
                        {isWeatherEx && (
                          <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-400/15 text-sky-400 border border-sky-400/20 uppercase tracking-wide">
                            AI Map
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {bookmark.url}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => setDeleteConfirmId(bookmark.bookmark_id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-600"
                        title="Delete bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Delete Confirmation Popover */}
                  {deleteConfirmId === bookmark.bookmark_id && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-popover border border-border rounded-xl shadow-xl z-10 animate-in fade-in slide-in-from-top-1 duration-150">
                      <p className="text-sm font-semibold text-foreground mb-3">
                        Remove Bookmark?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteBookmark(bookmark.bookmark_id)}
                          className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel Footer - Add Button (shown when bookmarks exist) */}
        {bookmarks.length > 0 && (
          <div className="px-4 py-4 border-t border-border bg-card/50 backdrop-blur-sm">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Bookmark
            </button>
          </div>
        )}
      </div>

      {/* Add Bookmark Modal */}
      {showAddModal && (
        <AddBookmarkModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddBookmark}
          isDuplicateUrl={isDuplicateUrl}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   ADD BOOKMARK MODAL
   ═══════════════════════════════════════════════════ */

interface AddBookmarkModalProps {
  onClose: () => void;
  onSave: (name: string, url: string) => void;
  isDuplicateUrl: (url: string) => boolean;
}

function AddBookmarkModal({ onClose, onSave, isDuplicateUrl }: AddBookmarkModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Validate URL on change
  useEffect(() => {
    if (!url) {
      setUrlError("");
      setShowDuplicateWarning(false);
      return;
    }

    if (!isValidUrl(url)) {
      setUrlError("URL must start with http:// or https://");
      setShowDuplicateWarning(false);
    } else {
      setUrlError("");
      setShowDuplicateWarning(isDuplicateUrl(url));
    }
  }, [url, isDuplicateUrl]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a bookmark name");
      return;
    }

    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    if (urlError) {
      toast.error("Please fix the URL error");
      return;
    }

    if (name.length > 50) {
      toast.error("Bookmark name must be 50 characters or less");
      return;
    }

    onSave(name.trim(), url.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Add New Bookmark</h3>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Link Name Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Link Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="e.g., IMD Weather"
              className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {name.length}/50 characters
            </p>
          </div>

          {/* URL Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              URL
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className={`w-full px-4 py-2.5 bg-card border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                urlError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-border focus:ring-primary focus:border-transparent"
              }`}
            />
            {urlError && (
              <div className="flex items-start gap-2 mt-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{urlError}</span>
              </div>
            )}
            {showDuplicateWarning && !urlError && (
              <div className="flex items-start gap-2 mt-2 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>This link already exists in your bookmarks.</span>
              </div>
            )}
          </div>

          {/* Open in New Tab (Locked ON) */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Open in new tab</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-6 bg-primary rounded-full flex items-center px-1">
                <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
              </div>
              <span className="text-xs text-muted-foreground">(Required)</span>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!name.trim() || !url.trim() || !!urlError}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save Bookmark
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BOOKMARK ICON BUTTON (for TopBar)
   ═══════════════════════════════════════════════════ */

interface BookmarkIconButtonProps {
  onClick: () => void;
  bookmarkCount: number;
}

export function BookmarkIconButton({ onClick, bookmarkCount }: BookmarkIconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground active:scale-95"
      title={bookmarkCount > 0 ? `${bookmarkCount} bookmark${bookmarkCount !== 1 ? 's' : ''}` : 'My Bookmarks'}
    >
      <Star className="w-4 h-4" />
      
      {/* Count Badge */}
      {bookmarkCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[9px] font-bold text-white bg-primary rounded-full shadow-md px-1">
          {bookmarkCount > 9 ? '9+' : bookmarkCount}
        </span>
      )}
    </button>
  );
}