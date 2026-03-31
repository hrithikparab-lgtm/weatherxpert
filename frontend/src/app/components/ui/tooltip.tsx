import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "./utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

// Wrapper to filter out Figma tracking props
const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>((props, ref) => {
  // Filter out all Figma tracking props (case-insensitive)
  const cleanProps = Object.keys(props).reduce((acc, key) => {
    // Skip any prop that starts with _fg (Figma tracking) - case insensitive
    const lowerKey = key.toLowerCase();
    if (lowerKey.startsWith('_fg')) {
      return acc;
    }
    acc[key] = (props as any)[key];
    return acc;
  }, {} as any);
  
  return <TooltipPrimitive.Trigger ref={ref} {...cleanProps} />;
});
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  // Filter out Figma tracking props from content as well
  const cleanProps = Object.keys(props).reduce((acc, key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.startsWith('_fg')) {
      return acc;
    }
    acc[key] = (props as any)[key];
    return acc;
  }, {} as any);

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-xl border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-xl shadow-black/10 dark:shadow-black/30 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 backdrop-blur-xl",
          className
        )}
        {...cleanProps}
      />
    </TooltipPrimitive.Portal>
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };