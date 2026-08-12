import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: "indigo" | "amber" | "emerald" | "rose" | "cyan" | "violet";
  className?: string;
}

const colorMap = {
  indigo: {
    icon: "gradient-primary",
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  amber: {
    icon: "gradient-amber",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  emerald: {
    icon: "gradient-emerald",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  rose: {
    icon: "bg-gradient-to-br from-rose-500 to-rose-700",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    text: "text-rose-600 dark:text-rose-400",
  },
  cyan: {
    icon: "bg-gradient-to-br from-cyan-500 to-cyan-700",
    bg: "bg-cyan-50 dark:bg-cyan-950/20",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  violet: {
    icon: "bg-gradient-to-br from-violet-500 to-violet-700",
    bg: "bg-violet-50 dark:bg-violet-950/20",
    text: "text-violet-600 dark:text-violet-400",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "indigo",
  className,
}: StatCardProps) {
  const colors = colorMap[color];
  const isPositiveTrend = (trend?.value ?? 0) >= 0;

  return (
    <Card className={cn("stat-card-hover border-0 shadow-sm", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
            )}
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-2 text-xs font-medium",
                  isPositiveTrend
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                {isPositiveTrend ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                <span>
                  {Math.abs(trend.value)}% {trend.label}
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl shadow-md flex-shrink-0",
              colors.icon
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
