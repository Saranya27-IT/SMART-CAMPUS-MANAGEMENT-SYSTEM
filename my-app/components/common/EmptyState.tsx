import { PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = PackageOpen,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8 gap-2" : "py-16 gap-4",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full bg-muted flex items-center justify-center",
          compact ? "w-10 h-10" : "w-16 h-16"
        )}
      >
        <Icon
          className={cn(
            "text-muted-foreground",
            compact ? "h-5 w-5" : "h-8 w-8"
          )}
        />
      </div>
      <div>
        <p
          className={cn(
            "font-semibold text-foreground",
            compact ? "text-sm" : "text-lg"
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "text-muted-foreground mt-1",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
