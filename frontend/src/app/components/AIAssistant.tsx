import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot,
  Sparkles,
  Send,
  Minimize2,
  X,
  MessageSquare,
  Compass,
  History,
  Trash2,
  Copy,
  ChevronDown,
  Zap,
  AlertTriangle,
  Cloud,
  Sun,
  Wind,
  BarChart3,
  MapPin,
  FileText,
  Settings,
  Cpu,
  ArrowUpRight,
  RotateCcw,
  Maximize2,
  BrainCircuit,
} from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   GLOBAL AI ASSISTANT — WeatherXpert Intelligence
   Page-context-aware · Available across all pages
   Premium glassmorphism · iOS-inspired UI
   ═══════════════════════════════════════════════════ */

// ── Page context metadata ──
const PAGE_CONTEXT: Record<string, { label: string; icon: React.ElementType; description: string; queries: string[] }> = {
  "/master-home": {
    label: "Command Center",
    icon: Zap,
    description: "Cross-utility executive overview",
    queries: [
      "What's the overall risk level today?",
      "Summarize alerts across all utilities",
      "Which utility needs attention?",
      "Show me the AI briefing highlights",
    ],
  },
  "/dashboard": {
    label: "Dashboard",
    icon: BarChart3,
    description: "Utility-specific performance metrics",
    queries: [
      "What's the current demand vs forecast?",
      "Explain the weather impact on operations",
      "Show peak demand prediction for today",
      "Are there any performance anomalies?",
    ],
  },
  "/alerts": {
    label: "Alerts",
    icon: AlertTriangle,
    description: "Active alerts and severity tracking",
    queries: [
      "How many critical alerts are active?",
      "What caused the latest alert?",
      "Show me alert trends vs last week",
      "What are the forecast alerts?",
    ],
  },
  "/forecast": {
    label: "Forecast",
    icon: Cloud,
    description: "Weather and demand forecasting",
    queries: [
      "What's the 72-hour weather outlook?",
      "How accurate was yesterday's forecast?",
      "Will there be any extreme weather?",
      "Compare model outputs (IMD vs Tomorrow.io)",
    ],
  },
  "/map": {
    label: "Map View",
    icon: MapPin,
    description: "Geospatial weather visualization",
    queries: [
      "Where are the highest risk zones?",
      "Show me stations with data gaps",
      "What regions have weather warnings?",
      "Overlay cyclone track on the map",
    ],
  },
  "/reports": {
    label: "Reports",
    icon: FileText,
    description: "Analytics and reporting",
    queries: [
      "Generate a weekly performance summary",
      "What metrics should I highlight?",
      "Compare this month vs last month",
      "Identify key trends for the board report",
    ],
  },
  "/accuracy": {
    label: "Accuracy",
    icon: BarChart3,
    description: "Forecast accuracy analysis",
    queries: [
      "Which model performed best this week?",
      "Where is accuracy below target?",
      "Show RMSE trends for temperature",
      "Suggest accuracy improvement actions",
    ],
  },
  "/settings": {
    label: "Settings",
    icon: Settings,
    description: "Platform configuration",
    queries: [
      "What alert thresholds are configured?",
      "Who has admin access?",
      "Recommend optimal refresh intervals",
      "Check system health status",
    ],
  },
  "/upload": {
    label: "Data Upload",
    icon: Cloud,
    description: "Data ingestion and quality",
    queries: [
      "What data was uploaded today?",
      "Are there any data quality issues?",
      "Check station connectivity status",
      "When was the last successful sync?",
    ],
  },
  "/report-builder": {
    label: "Report Builder",
    icon: FileText,
    description: "Custom report generation",
    queries: [
      "Help me build a storm impact report",
      "What charts should I include?",
      "Suggest KPIs for executive summary",
      "Auto-generate commentary for charts",
    ],
  },
};

const DEFAULT_CONTEXT = {
  label: "WeatherXpert",
  icon: Zap,
  description: "AI-powered weather intelligence",
  queries: [
    "What's the overall system status?",
    "Show me today's top risks",
    "Are there any anomalies detected?",
    "Summarize weather across all regions",
  ],
};

// ── Mock AI response engine ──
const AI_KNOWLEDGE: { keywords: string[]; response: string }[] = [
  {
    keywords: ["cyclone", "maha", "storm"],
    response:
      "**Cyclone MAHA Update**\n\nCurrently 480km WSW of Mumbai, moving NNE at 18 km/h.\n\n**Expected Impact:**\n- Landfall near Porbandar in ~48h\n- Mumbai: Heavy rainfall (80-120mm)\n- Wind speeds: 60-80 km/h\n- Risk Level: **HIGH**\n\n**Recommended Actions:**\n1. Pre-position maintenance crews\n2. Activate storm response protocol\n3. Monitor real-time wind sensors",
  },
  {
    keywords: ["delhi", "demand", "peak"],
    response:
      "**Delhi Demand Forecast**\n\nToday's projected peak: **6,420 MW** at 15:30 IST\n- Confidence: 93% (±180MW)\n- Temperature: Expected 44°C\n- Gap: 180MW shortfall likely\n\n**AI Recommendation:** Increase spinning reserves by 200MW before 14:00 IST to prevent load shedding in 4 zones.",
  },
  {
    keywords: ["risk", "highest", "ranking"],
    response:
      "**Weather Risk Rankings (Live)**\n\n1. **Delhi** — Risk Score: 85 (Extreme Heat)\n2. **Mumbai** — Risk Score: 72 (Cyclone Proximity)\n3. **Wind Assets** — Risk Score: 58 (High Winds)\n4. **Mundra UMPP** — Risk Score: 42 (Moderate)\n5. **Solar Assets** — Risk Score: 35 (Low)\n6. **Maithon** — Risk Score: 28 (Minimal)\n\n**Overall Status:** ELEVATED — 2 utilities above threshold.",
  },
  {
    keywords: ["solar", "generation", "irradiance"],
    response:
      "**Solar Generation Forecast (7 Days)**\n\n- Charanka Solar Park: 4.2 GWh (+6% vs avg)\n- Jodhpur Complex: 2.8 GWh\n- GHI Range: 850–920 W/m²\n- Cloud Cover: <10%\n- **Confidence: 98%**\n\nAI recommends deferring panel cleaning — soiling losses negligible (<1.2%) for next 5 days. Estimated saving: ₹2.4 Lakhs.",
  },
  {
    keywords: ["anomaly", "anomalies", "unusual"],
    response:
      "**Active Anomalies Detected (3)**\n\n1. **Mumbai Humidity Spike** — RH jumped 18% in 90 min (3.2σ deviation). Corrosion risk elevated for outdoor transformers.\n\n2. **Delhi Demand Shift** — Cooling load sensitivity up 12% per °C above 40°C vs last summer.\n\n3. **Wind Turbine Fatigue** — 3 turbines exceeded sustained 55 km/h for 14+ hours. Auto-curtailment recommended.\n\nAll anomalies flagged for review. Act now?",
  },
  {
    keywords: ["maintenance", "schedule", "plan"],
    response:
      "**AI Maintenance Recommendations**\n\n**DEFER:** Solar panel cleaning at Charanka (5 days, saves ₹2.4L)\n**SCHEDULE:** Wind turbine inspection (within 48h)\n**PRE-POSITION:** Mumbai coastal repair crews (3 teams)\n**RECALIBRATE:** Tamil Nadu wind forecast model (RMSE drifted +0.8 m/s)\n\nPrioritized by operational impact. Accept recommendations?",
  },
  {
    keywords: ["alert", "critical", "warning"],
    response:
      "**Active Alert Summary**\n\n- **Critical (2):** Cyclone Warning — Western Coast, Grid Frequency Deviation — Delhi\n- **Warning (5):** Wind curtailment, Heat wave threshold breaches\n- **Info (8):** Scheduled maintenance, Model updates\n\nTotal: 15 active alerts across 6 utilities.\nEscalation needed for 2 critical items. Should I draft escalation notifications?",
  },
  {
    keywords: ["accuracy", "forecast", "model", "rmse"],
    response:
      "**Forecast Accuracy Report**\n\n- **Temperature:** MAE 1.2°C (Target: <1.5°C) ✅\n- **Wind Speed:** RMSE 2.1 m/s (Target: <2.0) ⚠️\n- **Rainfall:** Skill Score 0.82 (Target: >0.75) ✅\n- **Solar GHI:** MAPE 4.3% (Target: <5%) ✅\n\nBest model this week: Tomorrow.io (93.1% overall). IMD lagging by 2.4% on wind.",
  },
  {
    keywords: ["status", "system", "health", "uptime"],
    response:
      "**System Health Dashboard**\n\n- Uptime: **99.97%** (last 30 days)\n- Data Coverage: **98.4%** across 144 stations\n- API Latency: **45ms** avg (P99: 120ms)\n- Active Users: **24** concurrent\n- Model Runs: On schedule (next: 12:00 UTC)\n- Storage: 72% utilized\n\nAll systems nominal. No interventions required.",
  },
  {
    keywords: ["report", "summary", "generate", "build"],
    response:
      "**Auto-Report Builder**\n\nI can help generate reports with:\n\n1. **Executive Summary** — Key metrics, trends, and risk highlights\n2. **Performance Charts** — Demand vs forecast, accuracy trends\n3. **AI Commentary** — Auto-generated narrative for each section\n4. **Recommendations** — Actionable next steps\n\nWhich report type would you like to create? I'll pre-populate the data and format.",
  },
  {
    keywords: ["wind", "turbine", "curtailment"],
    response:
      "**Wind Operations Update**\n\n- **Active Turbines:** 15/18 (3 in auto-curtailment)\n- **Wind Speed:** 52-68 km/h (above normal)\n- **Generation:** 380 MW / 420 MW capacity\n- **Fatigue Loading:** 3 turbines at WARNING level\n\nAI predicts wind speeds will moderate below 45 km/h by 18:00 IST tomorrow. Curtailed turbines can resume safely after.\n\nShall I schedule the restart sequence?",
  },
];

const FALLBACK_RESPONSE =
  "I've analyzed the available data across all utilities. Could you be more specific? I can help with:\n\n• **Weather risks** — cyclone, heat, wind conditions\n• **Demand forecasts** — peak loads, predictions\n• **Anomaly detection** — unusual patterns\n• **Maintenance planning** — schedules, recommendations\n• **Accuracy reports** — model performance\n• **System status** — health, uptime, connectivity\n\nJust ask naturally and I'll provide AI-powered insights.";

function getAIResponse(query: string): string {
  const lower = query.toLowerCase();
  for (const entry of AI_KNOWLEDGE) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return FALLBACK_RESPONSE;
}

// ── Types ──
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
  page?: string;
}

type AssistantTab = "chat" | "context" | "history";

// ── Main Component ──
export function AIAssistant({ currentPath = "/dashboard" }: { currentPath?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<AssistantTab>("chat");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Welcome to **WeatherXpert AI**. I'm your intelligent assistant — context-aware across every page. Ask me anything about weather risks, forecasts, anomalies, or operations.",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [chatHistory, setChatHistory] = useState<{ id: string; title: string; date: string; messageCount: number }[]>([
    { id: "h-1", title: "Cyclone MAHA Impact Analysis", date: "10 Feb 2026", messageCount: 8 },
    { id: "h-2", title: "Delhi Peak Demand Forecast", date: "09 Feb 2026", messageCount: 12 },
    { id: "h-3", title: "Weekly Accuracy Review", date: "07 Feb 2026", messageCount: 5 },
    { id: "h-4", title: "Solar Generation Optimization", date: "05 Feb 2026", messageCount: 9 },
    { id: "h-5", title: "Wind Curtailment Strategy", date: "03 Feb 2026", messageCount: 6 },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Current page context
  const pageCtx = useMemo(() => {
    return PAGE_CONTEXT[currentPath] || DEFAULT_CONTEXT;
  }, [currentPath]);

  const PageIcon = pageCtx.icon;

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, activeTab]);

  // Send message
  const handleSend = useCallback(
    (query?: string) => {
      const text = query || input.trim();
      if (!text || isTyping) return;

      const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text,
        time: now,
        page: pageCtx.label,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      // Simulate AI response
      const delay = 800 + Math.random() * 1200;
      setTimeout(() => {
        const response = getAIResponse(text);
        const botMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: response,
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, delay);
    },
    [input, isTyping, pageCtx.label]
  );

  // Clear chat
  const handleClearChat = useCallback(() => {
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    if (messages.length > 1) {
      setChatHistory((prev) => [
        {
          id: `h-${Date.now()}`,
          title: messages.find((m) => m.role === "user")?.text.slice(0, 40) || "Untitled conversation",
          date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          messageCount: messages.length,
        },
        ...prev,
      ]);
    }
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        text: "Chat cleared. How can I help you?",
        time: now,
      },
    ]);
    toast.success("Chat history saved & cleared");
  }, [messages]);

  // Copy message
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text.replace(/\*\*/g, ""));
    toast.success("Copied to clipboard");
  }, []);

  // Render formatted text (bold support)
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <span key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Panel dimensions
  const panelWidth = isExpanded ? "w-[520px]" : "w-[400px]";
  const panelHeight = isExpanded ? "max-h-[700px]" : "max-h-[560px]";

  // Tab config
  const tabs: { id: AssistantTab; label: string; icon: React.ElementType }[] = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "context", label: "Context", icon: Compass },
    { id: "history", label: "History", icon: History },
  ];

  return (
    <>
      {/* ── CHAT PANEL ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`fixed bottom-22 right-4 md:right-8 z-[60] ${panelWidth} max-w-[calc(100vw-2rem)] ${panelHeight} flex flex-col`}
          >
            {/* Glassmorphism container */}
            <div className="flex flex-col h-full rounded-2xl border border-white/15 dark:border-white/10 bg-white/80 dark:bg-gray-900/85 backdrop-blur-2xl shadow-2xl shadow-black/20 dark:shadow-black/40 overflow-hidden">
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-gradient-to-r from-blue-500/8 via-violet-500/5 to-purple-500/8 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
                  </div>
                  <div>
                    <h3 className="text-[14px] text-foreground font-semibold tracking-tight">WeatherXpert AI</h3>
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-2.5 h-2.5 text-emerald-500" />
                      <span className="text-[10px] text-emerald-500 font-medium">Online</span>
                      <span className="text-[10px] text-muted-foreground">· GPT-4 Turbo</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all active:scale-95"
                    title={isExpanded ? "Compact view" : "Expanded view"}
                  >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all active:scale-95"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── Page Context Bar ── */}
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30 border-b border-border/40 flex-shrink-0">
                <PageIcon className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] text-foreground font-medium">{pageCtx.label}</span>
                <span className="text-[11px] text-muted-foreground">· {pageCtx.description}</span>
              </div>

              {/* ── Tab Bar ── */}
              <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border/40 flex-shrink-0 bg-background/40">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all active:scale-[0.97] ${
                        active
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      }`}
                    >
                      <TabIcon className="w-3 h-3" />
                      {tab.label}
                    </button>
                  );
                })}

                <div className="flex-1" />
                {activeTab === "chat" && messages.length > 1 && (
                  <button
                    onClick={handleClearChat}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors active:scale-95"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>

              {/* ── Chat Tab ── */}
              {activeTab === "chat" && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`group relative max-w-[88%] ${msg.role === "user" ? "" : ""}`}>
                          {/* AI avatar for assistant messages */}
                          {msg.role === "assistant" && (
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                                <BrainCircuit className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium">WeatherXpert AI</span>
                            </div>
                          )}

                          <div
                            className={`px-3.5 py-2.5 rounded-2xl ${
                              msg.role === "user"
                                ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-br-md shadow-md shadow-blue-500/15"
                                : "bg-secondary/60 dark:bg-white/5 text-foreground rounded-bl-md border border-border/40"
                            }`}
                          >
                            <p className="text-[12px] leading-[1.65] whitespace-pre-line">{renderText(msg.text)}</p>
                            <div className={`flex items-center justify-between mt-1.5 ${msg.role === "user" ? "text-white/50" : "text-muted-foreground/60"}`}>
                              <span className="text-[9px] tabular-nums">{msg.time}</span>
                              {msg.page && msg.role === "user" && <span className="text-[9px] flex items-center gap-0.5"><Compass className="w-2.5 h-2.5" /> {msg.page}</span>}
                            </div>
                          </div>

                          {/* Copy button */}
                          {msg.role === "assistant" && msg.id !== "welcome" && msg.id !== "welcome-new" && (
                            <button
                              onClick={() => handleCopy(msg.text)}
                              className="absolute -right-1 top-6 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground transition-all"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                              <BrainCircuit className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-[10px] text-primary font-medium">Analyzing...</span>
                          </div>
                          <div className="bg-secondary/60 dark:bg-white/5 px-4 py-3 rounded-2xl rounded-bl-md border border-border/40">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground">Processing with GPT-4 Turbo...</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Suggested queries */}
                  {messages.length <= 1 && (
                    <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                      {pageCtx.queries.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSend(q)}
                          className="px-3 py-1.5 bg-secondary/50 dark:bg-white/5 border border-border/50 rounded-xl text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border transition-all truncate max-w-[200px] active:scale-[0.97]"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input area */}
                  <div className="px-4 pb-4 pt-2 border-t border-border/40 flex-shrink-0 bg-background/20">
                    <div className="flex items-center gap-2 bg-secondary/50 dark:bg-white/5 border border-border/60 rounded-xl px-3 py-2.5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask anything about weather, operations..."
                        className="flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground/50"
                        disabled={isTyping}
                      />
                      <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 text-white disabled:opacity-30 hover:shadow-md hover:shadow-blue-500/20 transition-all active:scale-90"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[9px] text-muted-foreground/50 text-center mt-1.5">
                      AI-powered by GPT-4 Turbo · Context: {pageCtx.label} · Responses are generated from mock data
                    </p>
                  </div>
                </>
              )}

              {/* ── Context Tab ── */}
              {activeTab === "context" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {/* Current page */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 ring-1 ring-primary/20 flex items-center justify-center">
                        <PageIcon className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-[13px] text-foreground font-semibold">Current Page: {pageCtx.label}</h4>
                        <p className="text-[10px] text-muted-foreground">{pageCtx.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {currentPath}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                      The AI assistant is context-aware. Questions asked from this page will be interpreted in the context of <span className="text-foreground font-medium">{pageCtx.label}</span> functionality.
                    </p>
                  </div>

                  {/* AI Capabilities */}
                  <div>
                    <h4 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-2.5">AI Capabilities</h4>
                    <div className="space-y-2">
                      {[
                        { icon: BrainCircuit, label: "Anomaly Detection", desc: "ML-powered pattern recognition across all sensors", status: "Active" },
                        { icon: BarChart3, label: "Demand Forecasting", desc: "72-hour demand prediction with 93% accuracy", status: "Active" },
                        { icon: AlertTriangle, label: "Risk Assessment", desc: "Real-time weather risk scoring for 6 utilities", status: "Active" },
                        { icon: Cloud, label: "Weather Intelligence", desc: "IMD + Tomorrow.io multi-provider ensemble analysis", status: "Active" },
                        { icon: Sparkles, label: "Natural Language", desc: "Ask questions in plain English — AI understands context", status: "Active" },
                      ].map((cap) => {
                        const CapIcon = cap.icon;
                        return (
                          <div key={cap.label} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 dark:bg-white/3 border border-border/40">
                            <CapIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-foreground font-medium">{cap.label}</span>
                                <span className="text-[9px] text-emerald-500 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">{cap.status}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{cap.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Suggested for this page */}
                  <div>
                    <h4 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-2.5">Suggested for {pageCtx.label}</h4>
                    <div className="space-y-1.5">
                      {pageCtx.queries.map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setActiveTab("chat");
                            setTimeout(() => handleSend(q), 100);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/30 dark:bg-white/3 border border-border/40 text-[11px] text-foreground hover:bg-secondary hover:border-border transition-all active:scale-[0.98] text-left"
                        >
                          <ArrowUpRight className="w-3 h-3 text-primary flex-shrink-0" />
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── History Tab ── */}
              {activeTab === "history" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
                  <p className="text-[10px] text-muted-foreground mb-3">Previous conversations are saved automatically when you clear the chat.</p>
                  {chatHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <History className="w-10 h-10 text-muted-foreground/30 mb-3" />
                      <p className="text-[12px] text-muted-foreground font-medium">No conversation history</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Start chatting — your sessions will appear here</p>
                    </div>
                  ) : (
                    chatHistory.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-start gap-3 px-3.5 py-3 rounded-xl bg-secondary/30 dark:bg-white/3 border border-border/40 hover:bg-secondary hover:border-border transition-all cursor-pointer group"
                      >
                        <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-foreground font-medium truncate">{h.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">{h.date}</span>
                            <span className="text-[10px] text-muted-foreground/60">· {h.messageCount} messages</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setChatHistory((prev) => prev.filter((item) => item.id !== h.id));
                            toast.success("Conversation deleted");
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING ACTION BUTTON ── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`fixed bottom-6 right-4 md:right-8 z-[100] w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 group ${
          isOpen
            ? "bg-secondary border border-border text-foreground shadow-md"
            : "bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 text-white shadow-xl shadow-blue-500/30"
        }`}
        title="AI Weather Assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <BrainCircuit className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status indicator */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-gray-900 items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </span>
          </span>
        )}

        {/* Helpful tooltip on hover */}
        {!isOpen && (
          <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            <div className="text-[11px] font-semibold mb-0.5">AI Weather Assistant</div>
            <div className="text-[10px] text-gray-300">Ask questions about weather, forecasts, and alerts</div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-gray-900 dark:bg-gray-800 rotate-45" />
          </div>
        )}
      </motion.button>
    </>
  );
}