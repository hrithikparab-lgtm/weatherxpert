import { useState, useCallback, useRef, useEffect } from "react";
import { Eye, EyeOff, User, Lock, Loader2, Building2, Factory, Wind, Sun, Zap, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import type { UserRole } from "../components/RoleContext";
const tataPowerLogoLight = "/tata-power-logo-light.png";
const tataPowerLogoDark = "/tata-power-logo-dark.png";
const windmillBg = "/windmill-animated.gif";

/* ═══════════════════════════════════════════════════
   LOGIN PAGE — WeatherXpert Enterprise Login
   Minimal · Clean · Professional · Enterprise-grade
   ═══════════════════════════════════════════════════ */

interface Utility {
  id: string;
  name: string;
  fullName: string;
  color: string;
  icon: React.ReactNode;
}

const utilities: Record<string, Utility> = {
  mumbai: {
    id: "mumbai",
    name: "Mumbai Distribution",
    fullName: "Mumbai Distribution - Weather Intelligence",
    color: "#2563EB",
    icon: <Building2 className="w-8 h-8" />
  },
  delhi: {
    id: "delhi",
    name: "Delhi Distribution",
    fullName: "Delhi Distribution - Climate Intelligence",
    color: "#7C3AED",
    icon: <Factory className="w-8 h-8" />
  },
  gujarat: {
    id: "gujarat",
    name: "Gujarat Wind Farms",
    fullName: "Gujarat Wind Farms - Performance Analytics",
    color: "#059669",
    icon: <Wind className="w-8 h-8" />
  },
  karnataka: {
    id: "karnataka",
    name: "Karnataka Solar",
    fullName: "Karnataka Solar - Generation Forecasting",
    color: "#F59E0B",
    icon: <Sun className="w-8 h-8" />
  },
  rajasthan: {
    id: "rajasthan",
    name: "Rajasthan Thermal",
    fullName: "Rajasthan Thermal - Weather Insights",
    color: "#DC2626",
    icon: <Zap className="w-8 h-8" />
  }
};

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
  selectedUtility?: string;
  onBack?: () => void;
}

export function LoginPage({ onLogin, selectedUtility, onBack }: LoginPageProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Get utility config
  const utility = selectedUtility ? utilities[selectedUtility] : null;

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);

  // Focus username on mount
  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!username || !password || isLoading) return;

      setIsLoading(true);

      // Simulate API call
      await new Promise((r) => setTimeout(r, 1000));

      // Validate credentials
      const credentials = {
        superadmin: { username: "superadmin", password: "1234" },
        admin: { username: "admin", password: "1234" },
        operator: { username: "operator", password: "1234" }
      };

      // Check credentials and assign role
      if (username === credentials.superadmin.username && password === credentials.superadmin.password) {
        onLogin("superadmin");
      } else if (username === credentials.admin.username && password === credentials.admin.password) {
        onLogin("admin");
      } else if (username === credentials.operator.username && password === credentials.operator.password) {
        onLogin("operator");
      } else {
        // Invalid credentials
        setIsLoading(false);
        alert("Invalid username or password. Please try again.");
      }
    },
    [username, password, isLoading, onLogin]
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* ═════════════════════════════════════════════════
          BACKGROUND IMAGE WITH DARKENED OVERLAY
          ══════════════════════════════════════════════════ */}
      <div className="fixed inset-0 z-0">
        <img
          src={windmillBg}
          alt="Wind Turbines Energy Farm"
          className="h-full w-full object-cover"
        />
        {/* Dark overlay for better contrast - with utility color tint if available */}
        <div 
          className="absolute inset-0 bg-black/50"
          style={utility ? {
            background: `linear-gradient(135deg, ${utility.color}15, #00000080)`
          } : undefined}
        />
      </div>

      {/* Back to Landing Button - Show only when utility is selected */}
      {utility && onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onBack}
          className="fixed top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl text-white text-sm font-medium transition-all hover:bg-white/20 hover:border-white/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Utilities
        </motion.button>
      )}

      {/* ══════════════════════════════════════════════════
          CENTERED LOGIN CARD
          ══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[440px] px-6"
      >
        {/* Glassmorphism Card */}
        <div className="rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-2xl">
          {/* ────────────────────────────────────────────────
              TOP SECTION
              ──────────────────────────────────────────────── */}
          <div className="flex flex-col items-center px-8 pt-10 pb-6">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-6 flex h-16 w-auto items-center justify-center"
            >
              <img
                src={isDark ? tataPowerLogoLight : tataPowerLogoDark}
                alt="TATA Power"
                className={`h-full w-auto object-contain ${
                  isDark ? "brightness-0 invert" : ""
                }`}
              />
            </motion.div>

            {/* Utility-specific branding or generic title */}
            {utility ? (
              <>
                {/* Utility Icon */}
                

                {/* Utility Name */}
                <h1 className="text-[20px] font-semibold tracking-tight text-white text-center mb-1">
                  {utility.fullName}
                </h1>
                
                {/* Subtitle */}
                <p className="mt-2 text-[13px] text-white/70">
                  Secure Enterprise Access
                </p>
              </>
            ) : (
              <>
                {/* Product Name */}
                <h1 className="text-[20px] font-semibold tracking-tight text-white text-center">
                  Enterprise Weather Intelligence Platform
                </h1>

                {/* Subtitle */}
                <p className="mt-2 text-[13px] text-white/70">
                  Secure Enterprise Access
                </p>
              </>
            )}
          </div>

          {/* ────────────────────────────────────────────────
              MAIN LOGIN FORM
              ──────────────────────────────────────────────── */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 px-8 pb-6"
            noValidate
          >
            {/* Username Field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-[13px] font-medium text-white/90"
              >
                Username
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  ref={usernameRef}
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-[14px] text-white outline-none transition-all placeholder:text-white/40 hover:border-white/30 hover:bg-white/15 focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-white/90"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-12 text-[14px] text-white outline-none transition-all placeholder:text-white/40 hover:border-white/30 hover:bg-white/15 focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/50 transition-colors hover:text-white/80"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={!username || !password || isLoading}
              className="w-full rounded-xl bg-white py-3.5 text-[15px] font-semibold text-gray-900 shadow-lg transition-all hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Optional SSO Link */}
          <div className="px-8 pb-8 pt-4 text-center">
            <button
              type="button"
              onClick={() => alert("Enterprise SSO authentication would be initiated here.")}
              className="text-[12px] text-white/60 transition-colors hover:text-white/90 focus-visible:outline-none focus-visible:underline"
            >
              Sign in with Enterprise SSO
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-white/50">
          &copy; {new Date().getFullYear()} TATA Power &mdash; WeatherXpert. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}