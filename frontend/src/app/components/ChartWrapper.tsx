import { memo, ReactNode } from "react";

/**
 * ChartWrapper - Memoized wrapper for Recharts components
 * 
 * This wrapper helps minimize re-renders and stabilizes chart data
 * to reduce internal Recharts duplicate key warnings.
 * 
 * Note: Some warnings may still appear from Recharts' internal rendering,
 * which are beyond application-level control.
 */

interface ChartWrapperProps {
  children: ReactNode;
  id: string;
}

const ChartWrapperComponent = ({ children, id }: ChartWrapperProps) => {
  return (
    <div data-chart-id={id} style={{ width: "100%", height: "100%" }}>
      {children}
    </div>
  );
};

export const ChartWrapper = memo(ChartWrapperComponent, (prevProps, nextProps) => {
  // Only re-render if the ID changes
  return prevProps.id === nextProps.id;
});

ChartWrapper.displayName = "ChartWrapper";
