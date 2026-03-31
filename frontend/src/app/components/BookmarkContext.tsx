import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import type { Bookmark } from "./BookmarkPanel";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   GLOBAL BOOKMARK CONTEXT
   Shared state for Header Bookmarks + Settings External Links
   Syncs both manual and starred external link bookmarks
   ═══════════════════════════════════════════════════ */

interface BookmarkContextValue {
  bookmarks: Bookmark[];
  bookmarkCount: number; // NEW: Expose count directly
  isBookmarked: (url: string) => boolean;
  addBookmark: (bookmark: Omit<Bookmark, "bookmark_id" | "created_at" | "updated_at">) => void;
  removeBookmark: (url: string) => void;
  toggleBookmark: (
    url: string,
    name: string,
    userId: string,
    sourceType: "Manual" | "ExternalLink",
    sourceId?: string
  ) => boolean; // Returns true if added, false if removed
  getBookmarkCount: () => number;
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) {
    throw new Error("useBookmarks must be used within BookmarkProvider");
  }
  return ctx;
}

interface BookmarkProviderProps {
  children: ReactNode;
  userId: string;
}

// Mock initial bookmarks (in production, fetch from Supabase)
// user_id matches RoleContext userAccounts: superadmin="usr-001", admin="usr-002", operator="usr-003"
const INITIAL_BOOKMARKS: Bookmark[] = [
  // ── Super Admin (usr-001) bookmarks ──
  {
    bookmark_id: "bm-sa-000",
    user_id: "usr-001",
    name: "WeatherEx AI Map",
    url: "https://weatherex.ai/",
    source_type: "ExternalLink",
    source_id: "el-weatherex",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    bookmark_id: "bm-sa-001",
    user_id: "usr-001",
    name: "IMD Radar Composite",
    url: "https://mausam.imd.gov.in/imd_latest/contents/radar.php",
    source_type: "ExternalLink",
    source_id: "el1",
    created_at: "2025-02-20T10:30:00Z",
    updated_at: "2025-02-20T10:30:00Z",
  },
  {
    bookmark_id: "bm-sa-002",
    user_id: "usr-001",
    name: "Windy.com",
    url: "https://www.windy.com/?22.5,72.5,6",
    source_type: "ExternalLink",
    source_id: "el4",
    created_at: "2025-02-21T14:15:00Z",
    updated_at: "2025-02-21T14:15:00Z",
  },
  {
    bookmark_id: "bm-sa-003",
    user_id: "usr-001",
    name: "Tomorrow.io Forecast",
    url: "https://www.tomorrow.io",
    source_type: "Manual",
    created_at: "2025-02-22T09:45:00Z",
    updated_at: "2025-02-22T09:45:00Z",
  },
  // ── Admin (usr-002) bookmarks ──
  {
    bookmark_id: "bm-ad-001",
    user_id: "usr-002",
    name: "IMD Radar Composite",
    url: "https://mausam.imd.gov.in/imd_latest/contents/radar.php",
    source_type: "ExternalLink",
    source_id: "el1",
    created_at: "2025-02-20T10:30:00Z",
    updated_at: "2025-02-20T10:30:00Z",
  },
  {
    bookmark_id: "bm-ad-002",
    user_id: "usr-002",
    name: "Windy.com",
    url: "https://www.windy.com/?22.5,72.5,6",
    source_type: "ExternalLink",
    source_id: "el4",
    created_at: "2025-02-21T14:15:00Z",
    updated_at: "2025-02-21T14:15:00Z",
  },
  // ── Operator (usr-003) bookmarks ──
  {
    bookmark_id: "bm-op-001",
    user_id: "usr-003",
    name: "Windy.com",
    url: "https://www.windy.com/?22.5,72.5,6",
    source_type: "ExternalLink",
    source_id: "el4",
    created_at: "2025-02-21T14:15:00Z",
    updated_at: "2025-02-21T14:15:00Z",
  },
];

export function BookmarkProvider({ children, userId }: BookmarkProviderProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Load bookmarks on mount or when userId changes
  useEffect(() => {
    // In production: fetch from Supabase WHERE user_id = userId
    const userBookmarks = INITIAL_BOOKMARKS.filter((b) => b.user_id === userId);
    setBookmarks(userBookmarks);
  }, [userId]);

  // Check if URL is bookmarked
  const isBookmarked = useCallback(
    (url: string): boolean => {
      return bookmarks.some((b) => b.url === url);
    },
    [bookmarks]
  );

  // Add bookmark
  const addBookmark = useCallback(
    (bookmark: Omit<Bookmark, "bookmark_id" | "created_at" | "updated_at">) => {
      // Check for duplicate
      if (bookmarks.some((b) => b.url === bookmark.url)) {
        toast.error("This link is already bookmarked");
        return;
      }

      const newBookmark: Bookmark = {
        ...bookmark,
        bookmark_id: `bm-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // In production: INSERT into Supabase
      setBookmarks([...bookmarks, newBookmark]);
      
      toast.success("Added to bookmarks", {
        description: bookmark.name,
      });
    },
    [bookmarks]
  );

  // Remove bookmark by URL
  const removeBookmark = useCallback(
    (url: string) => {
      const bookmark = bookmarks.find((b) => b.url === url);
      if (!bookmark) return;

      // In production: DELETE from Supabase WHERE url = url AND user_id = userId
      setBookmarks(bookmarks.filter((b) => b.url !== url));
      
      toast.success("Removed from bookmarks", {
        description: bookmark.name,
      });
    },
    [bookmarks]
  );

  // Toggle bookmark (for star icon clicks)
  const toggleBookmark = useCallback(
    (
      url: string,
      name: string,
      userId: string,
      sourceType: "Manual" | "ExternalLink",
      sourceId?: string
    ): boolean => {
      const existingBookmark = bookmarks.find((b) => b.url === url);

      if (existingBookmark) {
        // Remove bookmark
        setBookmarks(bookmarks.filter((b) => b.url !== url));
        return false; // Removed
      } else {
        // Add bookmark
        const newBookmark: Bookmark = {
          bookmark_id: `bm-${Date.now()}`,
          user_id: userId,
          name,
          url,
          source_type: sourceType,
          source_id: sourceId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setBookmarks([...bookmarks, newBookmark]);
        return true; // Added
      }
    },
    [bookmarks]
  );

  // Get total bookmark count
  const getBookmarkCount = useCallback(() => {
    return bookmarks.length;
  }, [bookmarks]);

  const value: BookmarkContextValue = {
    bookmarks,
    bookmarkCount: bookmarks.length, // NEW: Expose count directly
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    getBookmarkCount,
  };

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}