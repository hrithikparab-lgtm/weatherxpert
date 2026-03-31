import { useState } from "react";
import { Plus, Edit2, Trash2, Play, Save, AlertTriangle, Check } from "lucide-react";
import { useRole } from "../RoleContext";

type Condition = ">" | "<" | ">=" | "<=" | "between";
type Severity = "low" | "medium" | "high" | "critical" | "extreme";

interface AlertRule {
  id: string;
  name: string;
  parameter: string;
  condition: Condition;
  threshold: number;
  threshold2?: number; // For "between" condition
  timeWindow: string;
  severity: Severity;
  utility: string;
  equation?: string;
  enabled: boolean;
  simulationResult?: string;
}

const mockRules: AlertRule[] = [
  {
    id: "rule-1",
    name: "High Temperature Alert",
    parameter: "temperature",
    condition: ">",
    threshold: 45,
    timeWindow: "15min",
    severity: "high",
    utility: "Mumbai Distribution",
    enabled: true,
    simulationResult: "Would have triggered 3 times in last 7 days"
  },
  {
    id: "rule-2",
    name: "Critical Wind Speed",
    parameter: "wind_speed",
    condition: ">=",
    threshold: 80,
    timeWindow: "1hour",
    severity: "critical",
    utility: "Gujarat Wind Farms",
    enabled: true,
    simulationResult: "Would have triggered 1 time in last 7 days"
  },
];

export function AlertRuleEngine() {
  const { can, role } = useRole();
  const [rules, setRules] = useState<AlertRule[]>(mockRules);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  
  // New rule form state
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    parameter: "temperature",
    condition: ">",
    threshold: 0,
    timeWindow: "15min",
    severity: "medium",
    utility: "Mumbai Distribution",
    enabled: true
  });
  
  // Check permissions
  if (!can("manage_settings")) {
    return (
      <div className="p-8 text-center">
        <div className="text-[13px] text-muted-foreground">
          You don't have permission to access the Alert Rule Engine.
        </div>
      </div>
    );
  }
  
  const handleCreateRule = () => {
    const rule: AlertRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name || "Unnamed Rule",
      parameter: newRule.parameter!,
      condition: newRule.condition!,
      threshold: newRule.threshold!,
      threshold2: newRule.threshold2,
      timeWindow: newRule.timeWindow!,
      severity: newRule.severity!,
      utility: newRule.utility!,
      equation: newRule.equation,
      enabled: newRule.enabled!,
      simulationResult: "Simulation pending..."
    };
    
    setRules([...rules, rule]);
    setIsCreating(false);
    setNewRule({
      parameter: "temperature",
      condition: ">",
      threshold: 0,
      timeWindow: "15min",
      severity: "medium",
      utility: "Mumbai Distribution",
      enabled: true
    });
  };
  
  const handleToggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };
  
  const handleDeleteRule = (id: string) => {
    if (confirm("Are you sure you want to delete this alert rule?")) {
      setRules(rules.filter(rule => rule.id !== id));
    }
  };
  
  const getSeverityColor = (severity: Severity) => {
    const colors = {
      low: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30",
      medium: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
      high: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30",
      critical: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
      extreme: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30",
    };
    return colors[severity];
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-bold text-foreground mb-1">⚙ Alert Rule Engine</h3>
          <p className="text-[11px] text-muted-foreground">
            Configure equation-based alert logic and thresholds. Visible only to Super Admin and Utility Admin.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 text-[12px] font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Rule
        </button>
      </div>
      
      {/* Create/Edit Rule Modal */}
      {isCreating && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[13px] font-semibold text-foreground">Alert Rule Builder</h4>
            <button
              onClick={() => setIsCreating(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Rule Name */}
            <div>
              <label className="block text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                Rule Name
              </label>
              <input
                type="text"
                placeholder="e.g., High Temperature Alert"
                value={newRule.name || ""}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                className="w-full px-3 py-2.5 text-[13px] rounded-lg border border-border bg-card text-foreground"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parameter */}
              <div>
                <label className="block text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  Parameter
                </label>
                <select
                  value={newRule.parameter}
                  onChange={(e) => setNewRule({ ...newRule, parameter: e.target.value })}
                  className="w-full px-3 py-2.5 text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none"
                >
                  <option value="temperature">Temperature</option>
                  <option value="rainfall">Rainfall</option>
                  <option value="humidity">Humidity</option>
                  <option value="wind_speed">Wind Speed</option>
                  <option value="pressure">Pressure</option>
                </select>
              </div>
              
              {/* Condition */}
              <div>
                <label className="block text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  Condition
                </label>
                <select
                  value={newRule.condition}
                  onChange={(e) => setNewRule({ ...newRule, condition: e.target.value as Condition })}
                  className="w-full px-3 py-2.5 text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none"
                >
                  <option value=">">Greater than (&gt;)</option>
                  <option value="<">Less than (&lt;)</option>
                  <option value=">=">Greater than or equal (&gt;=)</option>
                  <option value="<=">Less than or equal (&lt;=)</option>
                  <option value="between">Between</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Threshold */}
              <div>
                <label className="block text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  Threshold Value
                </label>
                <input
                  type="number"
                  placeholder="e.g., 45"
                  value={newRule.threshold}
                  onChange={(e) => setNewRule({ ...newRule, threshold: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2.5 text-[13px] rounded-lg border border-border bg-card text-foreground"
                />
              </div>
              
              {/* Time Window */}
              <div>
                <label className="block text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  Time Window
                </label>
                <select
                  value={newRule.timeWindow}
                  onChange={(e) => setNewRule({ ...newRule, timeWindow: e.target.value })}
                  className="w-full px-3 py-2.5 text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none"
                >
                  <option value="15min">15 Minutes</option>
                  <option value="30min">30 Minutes</option>
                  <option value="1hour">1 Hour</option>
                  <option value="6hour">6 Hours</option>
                  <option value="12hour">12 Hours</option>
                  <option value="24hour">24 Hours</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Severity */}
              <div>
                <label className="block text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  Severity Level
                </label>
                <select
                  value={newRule.severity}
                  onChange={(e) => setNewRule({ ...newRule, severity: e.target.value as Severity })}
                  className="w-full px-3 py-2.5 text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                  <option value="extreme">Extreme</option>
                </select>
              </div>
              
              {/* Utility */}
              <div>
                <label className="block text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  Utility
                </label>
                <select
                  value={newRule.utility}
                  onChange={(e) => setNewRule({ ...newRule, utility: e.target.value })}
                  className="w-full px-3 py-2.5 text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none"
                >
                  <option>Mumbai Distribution</option>
                  <option>Delhi Distribution</option>
                  <option>Gujarat Wind Farms</option>
                  <option>Karnataka Solar</option>
                  <option>Rajasthan Thermal</option>
                </select>
              </div>
            </div>
            
            {/* Custom Equation (Optional) */}
            <div>
              <label className="block text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                Custom Equation (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., (temp > 45 AND humidity < 20) OR wind_speed > 80"
                value={newRule.equation || ""}
                onChange={(e) => setNewRule({ ...newRule, equation: e.target.value })}
                className="w-full px-3 py-2.5 text-[13px] rounded-lg border border-border bg-card text-foreground font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Advanced: Define complex boolean logic for alert triggering
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" />
                Test Simulation
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-[12px] font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRule}
                  className="px-4 py-2 text-[12px] font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-[13px] font-semibold text-foreground">{rule.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${getSeverityColor(rule.severity)}`}>
                    {rule.severity}
                  </span>
                  {rule.enabled ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                      Disabled
                    </span>
                  )}
                </div>
                
                <div className="text-[12px] text-foreground font-mono mb-3">
                  <span className="text-muted-foreground">IF</span> {rule.parameter} {rule.condition} {rule.threshold}
                  {rule.equation && <span className="text-muted-foreground"> OR {rule.equation}</span>}
                </div>
                
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span>Window: {rule.timeWindow}</span>
                  <span>•</span>
                  <span>Utility: {rule.utility}</span>
                  {rule.simulationResult && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <AlertTriangle className="w-3 h-3" />
                        {rule.simulationResult}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title={rule.enabled ? "Disable rule" : "Enable rule"}
                >
                  <Check className={`w-4 h-4 ${rule.enabled ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                </button>
                <button
                  onClick={() => setEditingRule(rule.id)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Edit rule"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Delete rule"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {rules.length === 0 && !isCreating && (
        <div className="text-center p-12 bg-muted/20 rounded-xl border border-border">
          <div className="text-4xl mb-3">⚙️</div>
          <div className="text-[13px] font-medium text-foreground mb-2">No Alert Rules Configured</div>
          <div className="text-[11px] text-muted-foreground mb-4">
            Create your first alert rule to start monitoring weather conditions
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 text-[12px] font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create Rule
          </button>
        </div>
      )}
    </div>
  );
}
