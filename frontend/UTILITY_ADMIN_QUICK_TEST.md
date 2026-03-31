# Utility Administration Tab - Quick Test Guide

## ✅ How to Test the New Tab

### Step 1: Navigate to Settings
1. Open the WeatherXpert application
2. Click on **Settings** in the sidebar (or top navigation)
3. Look for the **horizontal tab navigation** at the top

### Step 2: Locate the New Tab
You should see these tabs:
```
[Users] [Roles & Permissions] [Forecast Providers] [External Links] [Utility Admin] ⭐
```

The **Utility Admin** tab should:
- Have a building icon (🏢)
- Be the last tab (rightmost)
- Show "Utility Admin" on desktop
- Show "Utility" on mobile

### Step 3: Click the Tab
Click on **Utility Admin** tab. You should see:

#### Top Section:
- **Header:** "Utility Administration"
- **Description:** "Manage users, locations, thresholds, and dashboard layouts per utility"
- **Utility Selector Dropdown:** On the right side
  - Default: "All Utilities"

### Step 4: Test "All Utilities" View
When "All Utilities" is selected, you should see **4 summary cards**:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  👥 Total       │  │  👥 Total       │  │  📍 Total       │  │  🏢 Active      │
│     Admins      │  │     Operators   │  │     Locations   │  │     Alerts      │
│                 │  │                 │  │                 │  │                 │
│      3          │  │       3         │  │       6         │  │       12        │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

Plus an info banner:
```
📊 Summary View: Select a specific utility to enable editing controls
```

### Step 5: Test Specific Utility View
1. Click the **Utility Selector** dropdown
2. Select **"Mumbai Distribution"**
3. You should now see **4 sections** appear:

#### Section 1: Utility Users — Mumbai Distribution
- Header with Users icon
- "Create User" button (top-right, blue)
- Table with columns:
  - Name | Email | Role | Status | Actions
- Should show 2 users:
  - Priya Sharma (Admin, Active)
  - Amit Patel (Operator, Active)

#### Section 2: Locations — Mumbai Distribution
- Header with MapPin icon
- "Add Location" button (top-right, blue)
- Grid of location cards (2 columns):
  - Worli Substation (Active)
  - Andheri Grid (Active)
  - Borivali Station (Inactive)
- Each card shows:
  - Name, Type, Coordinates
  - Power toggle, Edit, Delete buttons

#### Section 3: Threshold Configuration — Mumbai Distribution
- Header with Settings icon
- Lock/Unlock toggle button (top-right)
  - Should show "Admin Can Edit" (green) for Mumbai
- 6 input fields (3 columns):
  1. Temperature Threshold: 40
  2. Wind Speed Threshold: 80
  3. Rainfall Threshold: 100
  4. Risk Level 1: 60
  5. Risk Level 2: 75
  6. Extreme Level 3: 90

#### Section 4: Dashboard Layout Settings — Mumbai Distribution
- Header with Building icon
- "Reset to Default" button (top-right, amber)
- List of 5 widgets with toggles:
  - Max Temperature ✅ (enabled)
  - Min Temperature ✅ (enabled)
  - Wind Speed ✅ (enabled)
  - Rainfall ✅ (enabled)
  - Humidity ❌ (disabled)

### Step 6: Test Interactions

#### Test 6.1: Change Utility
1. Change dropdown to **"Delhi Distribution"**
2. Verify:
   - User table updates (shows only Neha Singh)
   - Locations update (shows Dwarka, Rohini)
   - Thresholds change (temp: 45, wind: 70, etc.)
   - Lock button shows "Admin Locked" (amber) for Delhi

#### Test 6.2: Toggle Location Status
1. Click the power button on any location
2. Expected:
   - Button color changes (green ↔ red)
   - Toast appears: "Location status updated"

#### Test 6.3: Toggle Admin Lock
1. Click "Admin Can Edit" / "Admin Locked" button
2. Expected:
   - Button toggles between states
   - Toast appears with status message

#### Test 6.4: Toggle Widget
1. Click any widget toggle switch
2. Expected:
   - Switch animates smoothly
   - Color changes (green ↔ gray)
   - Toast appears: "Widget visibility updated"

#### Test 6.5: Reset Layout
1. Click "Reset to Default" button
2. Expected:
   - Toast appears: "Dashboard layout reset to global default"

### Step 7: Test Mobile View
1. Resize browser to mobile width (<768px)
2. Verify:
   - All buttons are disabled (grayed out)
   - Utility selector still works
   - Tables scroll horizontally
   - Grid becomes single column

### Step 8: Test Dark Mode
1. Toggle theme to dark mode
2. Verify:
   - All cards have proper dark backgrounds
   - Text is readable
   - Glassmorphism effects work
   - Badge colors remain visible

---

## ✅ Expected Results Checklist

### Visual
- [ ] Tab appears in navigation
- [ ] Building icon is visible
- [ ] Glassmorphism effects render
- [ ] Responsive grid works
- [ ] All icons are aligned properly

### Functional
- [ ] Utility selector changes view
- [ ] "All Utilities" shows summary
- [ ] Specific utility shows 4 sections
- [ ] Data filters by utility correctly
- [ ] All toggles work
- [ ] Toast notifications appear
- [ ] Mobile disables editing

### Styling
- [ ] Dark mode colors are correct
- [ ] Hover effects work
- [ ] Active states show properly
- [ ] Badge colors match roles/statuses
- [ ] Responsive breakpoints work

---

## 🐛 Troubleshooting

### Tab Not Visible
- Check if user role is Super Admin
- Verify tab is in SETTINGS_TABS array
- Check console for errors

### Sections Not Rendering
- Verify utility is selected (not "All Utilities")
- Check browser console for errors
- Ensure mock data exists for that utility

### Buttons Not Working
- Check if mobile mode is active (view-only)
- Verify toast library is working
- Check browser console for errors

### Styling Issues
- Verify Tailwind CSS is loaded
- Check if dark mode toggle works
- Inspect element for applied classes

---

## 📸 Expected Screenshots

### Desktop - All Utilities View
```
┌─────────────────────────────────────────────────────────┐
│  Utility Administration                  [All Utilities ▼] │
│  Manage users, locations, thresholds...                    │
├─────────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                │
│  │  3   │  │  3   │  │  6   │  │  12  │                │
│  │Admins│  │Opers │  │Locs  │  │Alerts│                │
│  └──────┘  └──────┘  └──────┘  └──────┘                │
│                                                           │
│  📊 Summary View: Select a specific utility...           │
└─────────────────────────────────────────────────────────┘
```

### Desktop - Specific Utility View
```
┌─────────────────────────────────────────────────────────┐
│  Utility Administration           [Mumbai Distribution ▼] │
├─────────────────────────────────────────────────────────┤
│  👥 Utility Users — Mumbai Distribution  [Create User]   │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Name          Email          Role    Status Actions │ │
│  │ Priya Sharma  priya.s@...    Admin   Active [✏️][🗑️]│ │
│  │ Amit Patel    amit.p@...     Operator Active [✏️][🗑️]│ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  📍 Locations — Mumbai Distribution      [Add Location]  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Worli    │  │ Andheri  │  │ Borivali │              │
│  │ Active✅ │  │ Active✅ │  │ Inactive❌│              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                           │
│  ⚙️ Threshold Configuration    [🔓 Admin Can Edit]      │
│  [Temp: 40] [Wind: 80] [Rain: 100]                      │
│  [Risk1: 60] [Risk2: 75] [Extreme: 90]                  │
│                                                           │
│  🏢 Dashboard Layout Settings    [Reset to Default]      │
│  ✅ Max Temperature (IMD GFS)        [Change Source]     │
│  ✅ Min Temperature (ECMWF)          [Change Source]     │
│  ✅ Wind Speed (AccuWeather)         [Change Source]     │
│  ✅ Rainfall (Custom WRF)            [Change Source]     │
│  ❌ Humidity (IMD GFS)               [Change Source]     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Success Criteria

**Test Passed If:**
1. ✅ Tab is visible and clickable
2. ✅ Summary view shows correct stats
3. ✅ Utility selector changes content
4. ✅ All 4 sections render for specific utility
5. ✅ Data filters correctly by utility
6. ✅ Interactive elements work (toggles, buttons)
7. ✅ Toast notifications appear
8. ✅ Mobile view disables editing
9. ✅ Dark mode works properly
10. ✅ No console errors

---

*Quick Test Guide - Utility Administration Tab*  
*WeatherXpert by TATA Power*  
*Version: 1.0.0*
