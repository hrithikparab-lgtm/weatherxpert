import { RoleProvider, useRole } from "./components/RoleContext";
import type { Permission, UserRole } from "./components/RoleContext";
import { BookmarkProvider } from "./components/BookmarkContext";
import { UtilityProvider } from "./components/UtilityContext";
import { AlertManagementProvider } from "./components/AlertManagementContext";
import { AppSidebar } from "./components/AppSidebar";
import { TopBar } from "./components/TopBar";
import { NotificationDrawer, shouldAutoOpenAlerts } from "./components/NotificationDrawer";
import { AIAssistant } from "./components/AIAssistant";
import { Toaster } from "sonner";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { MasterHomePage } from "./pages/MasterHomePage";

// Application Pages
import { DashboardPage } from "./pages/DashboardPage";
import { AlertsPage } from "./pages/AlertsPage";
import { ForecastPage } from "./pages/ForecastPage";
import { MapPage } from "./pages/MapPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AccuracyPage } from "./pages/AccuracyPage";
import { DataUploadPage } from "./pages/DataUploadPage";
import { ReportBuilderPage } from "./pages/ReportBuilderPage";
import { ClimateIntelligencePage } from "./pages/ClimateIntelligencePage";
import { AnalyticsReportsPage } from "./pages/AnalyticsReportsPage";
import { UtilitySelectionPage } from "./pages/UtilitySelectionPage";
import { ChartGlobalDefs } from "./components/ChartGlobalDefs";

// React and React Router imports
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { 
  createBrowserRouter, 
  RouterProvider, 
  Navigate, 
  useNavigate, 
  useLocation,
  Outlet
} from "react-router";

// Theme provider
import { ThemeProvider } from "next-themes";

// New pages for design system and API documentation
import { DesignSystemPage } from "./pages/DesignSystemPage";
import { APIDocumentationPage } from "./pages/APIDocumentationPage";

/** Route guard — redirects if user lacks permission */
function ProtectedRoute({
  permission,
  children,
}: {
  permission: Permission;
  children: React.ReactNode;
}) {
  const { can } = useRole();
  if (!can(permission)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

// Root redirect component
function RootRedirect() {
  const { can } = useRole();
  return can("view_master_home") 
    ? <Navigate to="/master-home" replace />
    : <Navigate to="/dashboard" replace />;
}

// Master Home wrapper
function MasterHomeWrapper() {
  const { can } = useRole();
  if (!can("view_master_home")) {
    return <Navigate to="/dashboard" replace />;
  }
  return <MasterHomeWithProps />;
}

// Master Home with props from AppLayout context
function MasterHomeWithProps() {
  const navigate = useNavigate();
  const { activeUtility, setActiveUtility } = useRole();
  const location = useLocation();
  
  const utilityToLocationMap: Record<string, string> = {
    "Mumbai Distribution": "Maharashtra — Renewable Hub",
    "Delhi Distribution": "Delhi NCR — Grid Operations",
    "Renewables - Solar": "Rajasthan — Solar Array Network",
    "Renewables - Wind": "Gujarat — Wind Farm Cluster",
    "Mundra UMPP": "Gujarat — Mundra Power Complex",
    "Maithon Power": "Jharkhand — Maithon Generation",
  };
  
  const { user } = useRole();
  const getInitialLocation = () => {
    if (user.role === "superadmin") {
      return "All Renewable Assets";
    }
    return utilityToLocationMap[activeUtility] || "Maharashtra — Renewable Hub";
  };
  
  const [selectedCommandCenterLocation] = useState<string>(getInitialLocation());
  
  const handleSelectUtility = useCallback(
    (utility: string) => {
      setActiveUtility(utility);
      navigate("/dashboard");
    },
    [setActiveUtility, navigate]
  );
  
  return (
    <MasterHomePage 
      onSelectUtility={handleSelectUtility} 
      selectedLocation={selectedCommandCenterLocation}
      activeUtility={activeUtility}
    />
  );
}

/* ──────────────────────────────────────────────────────────
   STABLE ROUTER — defined ONCE outside any component so it
   is never recreated on state changes (fixes the nested
   RouterProvider / remount bug in earlier versions).
   ────────────────────────────────────────────────────────── */
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },
      {
        path: "master-home",
        element: <MasterHomeWrapper />,
      },
      {
        path: "dashboard",
        element: <DashboardWrapper />,
      },
      {
        path: "alerts",
        element: (
          <ProtectedRoute permission="view_alerts">
            <AlertsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "forecast",
        element: (
          <ProtectedRoute permission="view_forecast">
            <ForecastWrapper />
          </ProtectedRoute>
        ),
      },
      {
        path: "map",
        element: (
          <ProtectedRoute permission="view_map">
            <MapPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute permission="view_settings">
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "accuracy",
        element: (
          <ProtectedRoute permission="view_accuracy">
            <AccuracyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "upload",
        element: (
          <ProtectedRoute permission="view_upload">
            <DataUploadPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "report-builder",
        element: (
          <ProtectedRoute permission="view_report_builder">
            <ReportBuilderPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "climate-intelligence",
        element: (
          <ProtectedRoute permission="view_forecast">
            <ClimateIntelligencePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute permission="view_reports">
            <AnalyticsReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "design-system",
        element: <DesignSystemPage />,
      },
      {
        path: "api-docs",
        element: <APIDocumentationPage />,
      },
      {
        path: "select-utility",
        element: <UtilitySelectionPage />,
      },
      {
        path: "analytics-reports",
        element: <Navigate to="/reports" replace />,
      },
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);

// Dashboard wrapper to pass activeUtility
function DashboardWrapper() {
  const { activeUtility } = useRole();
  return <DashboardPage selectedUtility={activeUtility} />;
}

// Forecast wrapper to pass props
function ForecastWrapper() {
  const { activeUtility } = useRole();
  const location = useLocation();
  
  const forecastTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || undefined;
  }, [location.search]);
  
  return (
    <ForecastPage
      selectedUtility={activeUtility}
      initialTab={forecastTab}
    />
  );
}

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { activeUtility, user } = useRole();
  
  // Map activeUtility to Command Center location names for UX consistency
  const utilityToLocationMap: Record<string, string> = {
    "Mumbai Distribution": "Maharashtra — Renewable Hub",
    "Delhi Distribution": "Delhi NCR — Grid Operations",
    "Renewables - Solar": "Rajasthan — Solar Array Network",
    "Renewables - Wind": "Gujarat — Wind Farm Cluster",
    "Mundra UMPP": "Gujarat — Mundra Power Complex",
    "Maithon Power": "Jharkhand — Maithon Generation",
  };
  
  // Initialize Command Center location based on user's active utility
  const getInitialLocation = () => {
    if (user.role === "superadmin") {
      return "All Renewable Assets"; // Super Admin sees aggregated view
    }
    return utilityToLocationMap[activeUtility] || "Maharashtra — Renewable Hub";
  };
  
  const [selectedCommandCenterLocation, setSelectedCommandCenterLocation] = useState<string>(getInitialLocation());
  
  // Sync Command Center location when activeUtility changes (for Super Admin switching utilities)
  React.useEffect(() => {
    if (user.role !== "superadmin") {
      const mappedLocation = utilityToLocationMap[activeUtility];
      if (mappedLocation) {
        setSelectedCommandCenterLocation(mappedLocation);
      }
    }
  }, [activeUtility, user.role]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleNavigate = useCallback(
    (route: string) => {
      if (route === "#notifications") {
        setNotificationOpen(true);
        return;
      }
      if (route.startsWith("#")) return;
      navigate(route);
    },
    [navigate]
  );

  const currentRoute = location.pathname + location.search;

  // Smart auto-open logic for extreme severity alerts
  useEffect(() => {
    if (shouldAutoOpenAlerts(user.role, activeUtility)) {
      setNotificationOpen(true);
    }
  }, [user.role, activeUtility]);

  return (
    // Applied semantic background and text colors. Added transition-colors for smooth theme switch.
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground transition-colors duration-300 selection:bg-blue-500/30">
      <ChartGlobalDefs />
      {/* ── Sidebar (fixed, never scrolls) ── */}
      <AppSidebar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        mobileOpen={mobileMenuOpen}
        onMobileClose={closeMobileMenu}
      />

      {/* ── Main Wrapper ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-0">
        {/* Atmospheric background glow - Visible ONLY in Dark Mode */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none hidden dark:block" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none hidden dark:block" />

        {/* ── TopBar (sticky, 64px, z-50+) ── */}
        <TopBar 
          onMenuToggle={toggleMobileMenu} 
          onNotificationClick={() => setNotificationOpen(true)}
          currentRoute={currentRoute}
          onLocationChange={(location) => {
            setSelectedCommandCenterLocation(location);
          }}
        />

        {/* ── Notification Drawer ── */}
        <NotificationDrawer 
          open={notificationOpen} 
          onClose={() => setNotificationOpen(false)} 
        />

        {/* ── Content Area (ONLY scrollable element) ── */}
        <main data-content-scroll className="flex-1 relative z-10 overflow-y-auto scroll-smooth">
          <Outlet />
        </main>

        {/* ── Global AI Assistant - HIDDEN ── */}
        {/* <AIAssistant currentPath={location.pathname} /> */}
      </div>
    </div>
  );
}

// Router wrapper component that provides router context
function AppRouter() {
  return <RouterProvider router={appRouter} />;
}

/** Auth-aware root — shows Landing/Login or App shell */
function AuthGate() {
  const { isAuthenticated, login, user, logout } = useRole();
  const [selectedUtility, setSelectedUtility] = useState<string | null>(null);

  const handleSelectUtility = useCallback((utilityId: string) => {
    setSelectedUtility(utilityId);
  }, []);

  const handleBackToLanding = useCallback(() => {
    setSelectedUtility(null);
    logout();
  }, [logout]);

  // Reset to landing page on component mount (app load)
  useEffect(() => {
    // Always start fresh - logout on mount
    logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  // ── Unauthenticated: render pages directly — NO nested RouterProvider ──
  if (!isAuthenticated) {
    return !selectedUtility ? (
      <LandingPage onSelectUtility={handleSelectUtility} />
    ) : (
      <LoginPage
        onLogin={login}
        selectedUtility={selectedUtility}
        onBack={handleBackToLanding}
      />
    );
  }

  // ── Authenticated: single stable RouterProvider ──
  return (
    <BookmarkProvider userId={user.id}>
      <UtilityProvider>
        <AlertManagementProvider>
          <AppRouter />
        </AlertManagementProvider>
      </UtilityProvider>
    </BookmarkProvider>
  );
}

export default function App() {
  return (
    <RoleProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Toaster position="top-right" richColors closeButton />
        <AuthGate />
      </ThemeProvider>
    </RoleProvider>
  );
}