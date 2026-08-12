import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  fullPage?: boolean;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

export function LoadingSpinner({
  size = "md",
  className,
  text,
  fullPage = false,
}: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={cn("animate-spin text-primary", sizeMap.lg)} />
          {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}
