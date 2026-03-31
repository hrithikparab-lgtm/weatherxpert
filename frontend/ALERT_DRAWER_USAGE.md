# Alert Detail Drawer - Usage Guide

The `AlertDetailDrawer` component is a shared, universal component designed with premium iOS-inspired glassmorphism aesthetics that can be used across all pages in the WeatherXpert application.

## Location
`/src/app/components/AlertDetailDrawer.tsx`

## Design Features
- **Premium Dark Theme** - Deep navy gradient background (#0f1729 → #182038 → #1a1f3a)
- **iOS-inspired Glassmorphism** - Translucent panels with backdrop blur
- **Smooth Animations** - Spring-based drawer slide with staggered content reveal
- **Responsive Layout** - Full-width on mobile, 650px on desktop

## Functional Features
- **Status Display** - "Predicted" or "Historical" badge with severity indicators
- **Severity Levels** - Critical, High, Medium, Low with color-coded badges
- **Location & Timing** - Displays location with timezone information
- **Forecasted Conditions** - Weather parameters with icons (Wind, Rainfall, etc.)
- **Provider Attribution**:
  - **External Providers** (IMD, Tomorrow.io): Shows "Provided by" section
  - **Internal Alerts**: Shows "Created By" with user avatar and name
- **Action Buttons**:
  - **View on Map** - Navigates to `/map` with alert location and ID
  - **Weather Trend** - Navigates to `/forecast?tab=hourly` with provider filtering

## Weather Trend Integration

When clicking "Weather Trend" button:

1. **For External Provider Alerts** (IMD, Tomorrow.io):
   - Navigates to `/forecast?tab=hourly&provider=imd` or `provider=tomorrowio`
   - Automatically filters the forecast chart to show ONLY that provider's data
   - User can toggle multi-provider view using the existing provider switches

2. **For Internal Alerts**:
   - Navigates to `/forecast?tab=hourly` (shows all providers)

## Usage Example

```tsx
import { useState } from "react";
import { AlertDetailDrawer, type AlertDetail } from "../components/AlertDetailDrawer";

function YourPage() {
  const [selectedAlert, setSelectedAlert] = useState<AlertDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Example: External provider alert (IMD)
  const externalAlert: AlertDetail = {
    id: "F001",
    title: "Predicted Severe Thunderstorm Activity",
    utility: "Mumbai Distribution",
    provider: "IMD",
    severity: "critical",
    status: "Predicted",
    location: "Mumbai Metropolitan Region - All Substations",
    receivedTime: "2:40 PM",
    basedOn: "Severe Thunderstorm Activity Model",
    forecastedConditions: [
      { parameter: "Wind Speed", value: "85 km/h" },
      { parameter: "Rainfall", value: "120 mm/hr" },
    ],
    startTime: "Starts in 45 minutes at 3:00 PM GMT+2 3/26/26",
    locationTime: "6:30 PM GMT+5:30 3/26/26",
    predictedValue: "85 km/h",
    thresholdValue: "60 km/h",
    isInternal: false, // External provider
  };

  // Example: Internal user-created alert
  const internalAlert: AlertDetail = {
    id: "F007",
    title: "Wind Insight for Odisha is starting within 2 hours",
    utility: "Odisha Distribution",
    provider: "Internal",
    severity: "medium",
    status: "Predicted",
    location: "Mitapur",
    receivedTime: "2:40 PM",
    basedOn: "Wind Insight for Odisha",
    forecastedConditions: [
      { parameter: "Wind Speed", value: "10.29 mph" },
    ],
    isInternal: true, // Internal alert
    createdBy: { name: "Biswas Trusha", initials: "BT" },
    startTime: "Starts in 19 minutes at 3:00 PM GMT+2 3/26/26",
    locationTime: "Location Time: 6:30 PM GMT+5:30 3/26/26",
    predictedValue: "10.29 mph",
    thresholdValue: "8 mph",
  };

  const handleAlertClick = (alert: AlertDetail) => {
    setSelectedAlert(alert);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    // Optional: delay clearing selected alert for exit animation
    setTimeout(() => setSelectedAlert(null), 300);
  };

  return (
    <div>
      <button onClick={() => handleAlertClick(externalAlert)}>
        View External Alert
      </button>
      <button onClick={() => handleAlertClick(internalAlert)}>
        View Internal Alert
      </button>
      
      {/* Alert Detail Drawer */}
      <AlertDetailDrawer
        alert={selectedAlert}
        isOpen={drawerOpen}
        onClose={closeDrawer}
        isForecast={true} // Set to false for historical alerts
      />
    </div>
  );
}
```

## AlertDetail Interface

```tsx
interface AlertDetail {
  // Required fields
  id: string;
  title: string;
  utility: string;
  provider: string; // "IMD", "Tomorrow.io", "Internal", etc.
  severity: "critical" | "high" | "medium" | "low";
  status: string;
  location: string;
  
  // Forecast specific (optional)
  expectedTriggerTime?: string;
  probability?: string;
  predictedValue?: string;
  thresholdValue?: string;
  
  // History specific (optional)
  triggeredTime?: string;
  resolvedTime?: string;
  duration?: string;
  observedValue?: string;
  
  // Additional fields for details view (optional)
  receivedTime?: string;
  basedOn?: string;
  forecastedConditions?: { 
    parameter: string; 
    value: string; 
    icon?: string; // Optional, auto-mapped from parameter name
  }[];
  createdBy?: { 
    name: string; 
    initials: string; 
  };
  startTime?: string;
  locationTime?: string;
  isInternal?: boolean; // true for internal alerts, false/undefined for provider alerts
}
```

## Severity Configuration

```tsx
critical: {
  color: "#ef4444",        // Red
  bg: "rgba(254, 242, 242, 0.95)",
  label: "CRITICAL",
  borderColor: "rgba(239, 68, 68, 0.3)",
}

high: {
  color: "#f97316",        // Orange
  bg: "rgba(255, 247, 237, 0.95)",
  label: "HIGH",
  borderColor: "rgba(249, 115, 22, 0.3)",
}

medium: {
  color: "#f59e0b",        // Amber
  bg: "rgba(255, 251, 235, 0.95)",
  label: "MEDIUM",
  borderColor: "rgba(245, 158, 11, 0.3)",
}

low: {
  color: "#10b981",        // Green
  bg: "rgba(240, 253, 244, 0.95)",
  label: "LOW",
  borderColor: "rgba(16, 185, 129, 0.3)",
}
```

## Forecasted Conditions Icons

The component automatically maps parameter names to icons:

- **Wind Speed** → Wind icon
- **Rainfall** → Droplets icon
- **Temperature** → Sun icon
- **Humidity** → CloudRain icon
- **Pressure** → Zap icon
- **Thunderstorm** → CloudLightning icon

Default fallback is the Wind icon.

## Provider Attribution Logic

### External Provider Alerts (isInternal: false or undefined)
- Shows "**PROVIDED BY**" section (uppercase)
- Displays provider name in large white text
- Example: "IMD", "Tomorrow.io"

### Internal Alerts (isInternal: true)
- Shows "**CREATED BY**" section (uppercase)
- Displays circular avatar with initials in purple background
- Shows user's full name
- Example: "BT" avatar with "Biswas Trusha"

## Navigation Behavior

### View on Map
```
/map?location=<encoded-location>&alert=<alert-id>
```

### Weather Trend
```
For IMD alert:        /forecast?tab=hourly&provider=imd
For Tomorrow.io:      /forecast?tab=hourly&provider=tomorrowio
For Internal alert:   /forecast?tab=hourly
```

The forecast page automatically:
1. Parses the `provider` URL parameter
2. Filters the chart to show only that provider's data
3. Allows users to toggle other providers using the multi-provider switches

## UX Enhancements

1. **Smooth Animations** - Spring physics for drawer slide, staggered fade-in for content
2. **Interactive Buttons** - Scale on hover (1.02x) and press (0.98x)
3. **Icon Animations** - Icons scale up on button hover
4. **Keyboard Support** - Escape key closes drawer
5. **Backdrop Dismiss** - Click outside drawer to close
6. **Accessibility** - Proper ARIA labels and semantic HTML

## Notes

- All other page UI sections remain **LOCKED** - only the drawer displays alert details
- The drawer uses a dark glassmorphism design matching WeatherXpert's enterprise aesthetic
- Provider filtering in Weather Trend page enables focused analysis of specific data sources
- Users retain full control with multi-provider toggle switches after navigation
