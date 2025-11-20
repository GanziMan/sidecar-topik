import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  className?: string;
  children: React.ReactNode;
  label?: string;
  blur?: boolean;
}

export function LoadingOverlay({
  isLoading,
  className,
  children,
  label = "로딩 중...",
  blur = true,
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative z-0", className)} aria-busy={isLoading} aria-live="polite">
      <div className={cn(isLoading ? "opacity-50" : undefined)}>{children}</div>
      {isLoading && (
        <div className={cn("absolute inset-0 z-10 flex items-center justify-center", blur && "backdrop-blur-sm")}>
          <div className="flex flex-col items-center gap-2 ">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700"
              aria-hidden="true"
            />
            {label && <span className="text-sm text-gray-700">{label}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadingOverlay;
