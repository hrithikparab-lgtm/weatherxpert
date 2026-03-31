# 🚨 Critical Alert User Flow - WeatherXpert Platform

## Complete User Journey Documentation

### Overview
This document outlines the complete, uninterrupted user experience flow when interacting with critical alerts in the WeatherXpert platform, ensuring best UX practices and role-based access control.

---

## 🎯 User Flow: Clicking on Critical Alert Card

### **Step 1: Alert Discovery**
**Location:** MasterHomePage - Global Alerts Section  
**User Action:** User sees alert card in the "Global Alerts" feed

**Visual Indicators:**
- ⚠️ Critical/Warning badge with color coding
- Alert title and description preview
- Affected utility name
- Time since alert was generated
- Hover effect: Card scales up, border color changes to red
- Chevron icon animates on hover

---

### **Step 2: Alert Card Click**
**User Action:** User clicks anywhere on the alert card

**System Response:**
```
✅ Opens AlertDetailDrawer component
✅ Smooth slide-in animation from right side (spring animation)
✅ Backdrop blur effect applied to background
✅ Card click registers the specific alert
```

---

### **Step 3: Alert Detail Drawer Opens**

#### **Header Section (Red Gradient Background)**
Displays:
1. **Alert Icon** - Large warning triangle in glassmorphic container
2. **Alert Metadata Badges:**
   - Severity level (CRITICAL/WARNING)
   - Alert ID (e.g., "ID: ga-1")
   - DUPLICATE badge (if detected)
   
3. **Alert Title & Description** (White text, bold, prominent)

4. **Status Dashboard (4 Metrics Grid):**
   ```
   ┌─────────────┬─────────────┬─────────────┬─────────────┐
   │   STATUS    │  SLA TIMER  │  GENERATED  │  LOCATION   │
   │   (NEW)     │   12m 45s   │  12 min ago │  Mumbai     │
   │  🔴 Pulse   │  ⏱️ Timer   │  📅 Date    │  📍 Pin     │
   └─────────────┴─────────────┴─────────────┴─────────────┘
   ```

5. **Assigned User Badge** (if assigned) - Shows avatar and name

6. **SLA Warning Banners:**
   - 🟡 **Amber Warning** (80%+ elapsed): "SLA Warning - Please take action"
   - 🔴 **Red Alert** (100%+ elapsed): "SLA BREACHED - Immediate escalation required"

---

### **Step 4: Main Content Area**

#### **Left Column (Main Content)**

##### **1. Context & Data Section**
- **Forecast vs Actual Comparison:**
  ```
  ┌──────────────┬──────────────┐
  │  FORECAST    │    ACTUAL    │
  │   65 km/h    │   95 km/h    │
  │  (Blue)      │   (Red)      │
  └──────────────┴──────────────┘
  ```

- **Trend Analysis Chart:**
  - Last 4 hours of data
  - Blue line = Forecast
  - Red line = Actual values
  - Interactive tooltip on hover

- **Data Source & Region:**
  - Source: AWS IMD
  - Region: Gujarat Coast

##### **2. AI Root Cause Analysis (Purple Card)**
- AI-generated explanation of the alert
- Confidence score: 94%
- Model attribution: GPT-4o + Weather Analytics
- Actionable recommendations

##### **3. Actions Section** (Only for Admin/Super Admin)

**Primary Actions (4 Buttons in Grid):**

**A. Acknowledge Button** (Blue) - Only shows if status = "new"
- Click → Changes status to "acknowledged"
- Adds timeline entry
- Shows success toast
- Updates status indicator in header

**B. Assign Button** (Green)
- Click → Opens **Assignment Modal** (overlay)
- Modal contains:
  - Team filter buttons (All, Operations, Analytics, Engineering)
  - List of team members with avatars, names, roles
  - Click member → Assigns alert
  - Optional comment field
  - Changes status to "in-progress"
  - Updates timeline with assignment details
  - Shows toast: "Alert assigned to [Name]"

**C. Escalate Button** (Amber)
- Click → Opens **Escalation Modal**
- Select escalation level (L2/L3/Management)
- Select recipients (checkboxes)
- Add escalation reason
- Submit → Adds timeline entry
- Sends notifications (simulated)
- Shows toast: "Alert escalated to [Level]"

**D. Add Note Button** (Purple)
- Click → Opens **Note Modal**
- Text area for adding context/updates
- Submit → Adds to timeline
- Visible to all team members
- Shows toast: "Note added successfully"

**Secondary Actions (3 Small Buttons):**
- 🗺️ **Map** - Opens map view of affected area
- 👁️ **History** - Shows historical similar alerts
- 📧 **Notify** - Send email notifications

**Resolve Action (Full Width Green Gradient Button):**
- Only shows if status = "acknowledged" or "in-progress"
- Click → Opens **Resolution Modal**
- Requires:
  - Resolution comment (required)
  - Resolution category dropdown (required)
- Submit → Changes status to "resolved"
- Adds timeline entry
- Shows success toast
- **Auto-closes drawer after 1.5 seconds**

##### **4. Permission States**

**For Operators (Read-Only):**
- All action buttons hidden
- Shows amber warning banner:
  ```
  ⚠️ Permission Denied
  Your role (Operator) has read-only access to critical alerts.
  Please contact an Admin or Super Admin to take action.
  ```

**For Resolved Alerts:**
- Shows green success banner:
  ```
  ✅ Alert Resolved
  This alert has been marked as resolved and moved to the alert history.
  SLA result: WITHIN SLA
  ```

---

#### **Right Column (Timeline Sidebar)**

**Activity Timeline Section:**
- Chronological list of all actions taken
- Each entry shows:
  - Icon (color-coded by action type)
  - Action name (Created, Acknowledged, Assigned, etc.)
  - User who performed action
  - Timestamp
  - Comments (if any)
  - Metadata (assignee name, escalation level, etc.)

**Timeline Entry Types:**
- 🔔 **Created** (Gray) - System generated
- ✅ **Acknowledged** (Blue) - User acknowledged
- 👥 **Assigned** (Green) - Assigned to team member
- ⬆️ **Escalated** (Amber) - Escalated to higher level
- 💬 **Note** (Purple) - User added note
- ✅ **Resolved** (Dark Green) - Alert resolved

**Visual Design:**
- Vertical timeline with connecting lines
- Color-coded circular icons
- Staggered fade-in animation
- Sticky positioning (stays visible while scrolling)

---

### **Step 5: User Takes Action**

#### **Example Flow: Acknowledging & Assigning Alert**

1. **User clicks "Acknowledge" button**
   - ✅ Status changes from "NEW" → "ACKNOWLEDGED"
   - ✅ Header status indicator updates (red dot → blue dot)
   - ✅ Timeline adds "Acknowledged" entry
   - ✅ Toast notification appears
   - ✅ "Acknowledge" button disappears
   - ✅ SLA timer continues running

2. **User clicks "Assign" button**
   - ✅ Assignment modal slides up with backdrop
   - ✅ User filters by team (e.g., "Operations")
   - ✅ User clicks on "Rajesh Kumar"
   - ✅ Status changes to "IN-PROGRESS"
   - ✅ Header shows "Assigned To: Rajesh Kumar" badge
   - ✅ Timeline adds "Assigned" entry with assignee name
   - ✅ Modal closes automatically
   - ✅ Toast: "Alert assigned to Rajesh Kumar"

3. **User adds a note for context**
   - ✅ Clicks "Add Note"
   - ✅ Note modal opens
   - ✅ Types: "Contacted turbine maintenance team. ETA 30 min"
   - ✅ Submits note
   - ✅ Timeline shows new note entry with full text
   - ✅ Modal closes
   - ✅ Toast confirmation

4. **Alert is resolved**
   - ✅ User clicks "Mark as Resolved"
   - ✅ Resolution modal opens
   - ✅ Selects category: "Weather event passed"
   - ✅ Adds comment: "Wind speeds returned to normal. Turbines restarted."
   - ✅ Submits resolution
   - ✅ Status changes to "RESOLVED"
   - ✅ Timeline shows resolution entry
   - ✅ SLA result displayed (WITHIN SLA / SLA BREACHED)
   - ✅ Toast: "Alert resolved successfully"
   - ✅ **Drawer auto-closes after 1.5 seconds**
   - ✅ User returns to MasterHomePage

---

### **Step 6: Close/Exit Options**

**User can exit the drawer at any time via:**
1. ❌ Click X button in top-right corner
2. 🖱️ Click outside drawer on backdrop
3. ⌨️ Press ESC key (standard modal behavior)
4. ✅ Auto-close after resolving alert

**Close Animation:**
- Drawer slides out to the right
- Backdrop fades out
- Returns to MasterHomePage smoothly

---

## 🎨 UX Design Principles Applied

### ✅ **Best Practices Implemented:**

1. **Clear Visual Hierarchy**
   - Most important info (title, severity) at top
   - Actions prominently displayed
   - Timeline provides context without cluttering main view

2. **Progressive Disclosure**
   - Summary on card → Full details in drawer → Modals for complex actions
   - User isn't overwhelmed with all options at once

3. **Immediate Feedback**
   - Every action triggers toast notification
   - Visual state changes (colors, icons, badges)
   - Timeline updates in real-time
   - Loading states and animations

4. **Error Prevention**
   - Required fields clearly marked
   - Role-based permissions prevent unauthorized actions
   - Confirmation modals for critical actions (resolve, escalate)
   - Validation before submission

5. **Responsive Design**
   - Mobile sticky action bar at bottom
   - Drawer width adapts (full width on mobile, 800px on desktop)
   - Stacked layout on mobile, side-by-side on desktop

6. **Accessibility**
   - Color + icon + text for severity levels (not color alone)
   - Clear labels and CTAs
   - Keyboard navigation support
   - Semantic HTML structure

7. **Smooth Animations**
   - Spring physics for natural movement
   - Staggered timeline entries
   - Hover states with smooth transitions
   - No jarring or abrupt changes

8. **Context Preservation**
   - Timeline shows complete history
   - User knows who did what and when
   - Audit trail for compliance

9. **SLA Management**
   - Real-time timer visible
   - Color-coded warnings (green → amber → red)
   - Automatic alerts when thresholds crossed

10. **Data Visualization**
    - Chart shows forecast vs actual
    - Trend analysis helps understanding
    - Metrics presented clearly (not just numbers)

---

## 🔐 Role-Based Access Control

### **Super Admin**
✅ Full access to all actions  
✅ Can acknowledge, assign, escalate, resolve  
✅ Can view all alerts across all utilities

### **Admin**
✅ Full access to all actions  
✅ Can acknowledge, assign, escalate, resolve  
✅ Can manage alerts for assigned utilities

### **Operator**
❌ Read-only access  
❌ Cannot take any actions  
✅ Can view alert details and timeline  
✅ Must request Admin/Super Admin for actions

---

## 📊 Key Features Summary

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Real-time SLA Timer** | Live countdown with color-coded warnings | Prevents SLA breaches |
| **AI Root Cause** | GPT-4o powered analysis | Faster resolution |
| **Team Assignment** | Filter by team, assign to specific members | Clear ownership |
| **Activity Timeline** | Complete audit trail | Compliance & accountability |
| **Duplicate Detection** | Automatic duplicate alert flagging | Reduces noise |
| **Escalation Workflow** | Multi-level escalation (L2/L3/Management) | Proper escalation path |
| **Note System** | Collaborative note-taking | Team coordination |
| **Trend Charts** | Visual forecast vs actual data | Better context |
| **Permission System** | Role-based action controls | Security & governance |
| **Mobile Optimized** | Responsive design with mobile actions | Works on all devices |

---

## 🎯 Success Metrics

**User can successfully:**
1. ✅ Identify critical alerts at a glance
2. ✅ Open alert details in under 1 second
3. ✅ Understand the issue from AI analysis
4. ✅ Take appropriate action based on role
5. ✅ Track alert lifecycle via timeline
6. ✅ Resolve alert with proper documentation
7. ✅ Exit flow smoothly without confusion

**Average Time to Resolution:**
- Simple alerts: ~2-3 minutes
- Complex alerts requiring escalation: ~5-10 minutes

---

## 🔄 Future Enhancements (Optional)

1. **Real-time Collaboration** - Multiple users can see each other's actions live
2. **Voice Notes** - Add audio notes to timeline
3. **Alert Clustering** - Group related alerts automatically
4. **Predictive Recommendations** - AI suggests best actions based on historical data
5. **Integration Hooks** - Connect to Slack, Teams, PagerDuty
6. **Custom SLA Rules** - Per-utility SLA configuration
7. **Alert Templates** - Pre-configured resolution templates

---

## 📝 Technical Implementation Notes

**Component:** `/src/app/components/AlertDetailDrawer.tsx`  
**Entry Point:** `MasterHomePage.tsx` (Global Alerts section)  
**State Management:** React hooks (useState, useEffect)  
**Animations:** Framer Motion (motion/react)  
**Charts:** Recharts library  
**Notifications:** Sonner toast  
**Permissions:** RoleContext provider  

**Mock Data:**
- Team members: 5 users across 3 teams
- Alert trend data: Last 4 hours (8 data points)
- SLA default: 30 minutes

---

## ✅ Checklist: Is the UX Flow Complete?

- [x] User can discover alerts easily
- [x] User can open alert details quickly
- [x] User receives all necessary context
- [x] User can take appropriate actions
- [x] User receives confirmation feedback
- [x] User can track full history
- [x] User can exit gracefully
- [x] Role-based permissions enforced
- [x] SLA management included
- [x] Mobile responsive
- [x] Accessible design
- [x] Smooth animations
- [x] Error prevention
- [x] Audit trail maintained

---

## 🎉 Conclusion

This alert flow provides an **enterprise-grade, best-practice UX experience** that:

1. **Guides users intuitively** through the alert lifecycle
2. **Prevents errors** through validation and permissions
3. **Provides context** through data visualization and AI analysis
4. **Ensures accountability** via timeline and audit trail
5. **Respects user roles** with granular access control
6. **Performs smoothly** with optimized animations
7. **Works everywhere** with responsive design

**No user confusion. No broken journey. Complete end-to-end flow.** ✅

---

*Last Updated: February 17, 2026*  
*Platform: WeatherXpert for TATA Power*  
*Component Version: AlertDetailDrawer v2.0*
