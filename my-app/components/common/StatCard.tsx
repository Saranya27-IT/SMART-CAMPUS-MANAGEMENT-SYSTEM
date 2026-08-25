import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

export type StatCardColor =
  | "indigo"
  | "amber"
  | "emerald"
  | "rose"
  | "cyan"
  | "violet"
  | "purple"
  | "teal"
  | "orange"
  | "pink"
  | "blue";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: StatCardColor;
  className?: string;
}

const colorMap: Record<
  StatCardColor,
  {
    iconGradient: string;
    lightBg: string;
    borderAccent: string;
    badgeText: string;
  }
> = {
  indigo: {
    iconGradient: "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white",
    lightBg: "bg-indigo-50/60 dark:bg-indigo-950/20",
    borderAccent: "hover:border-indigo-300 dark:hover:border-indigo-700/60",
    badgeText: "text-indigo-600 dark:text-indigo-400",
  },
  blue: {
    iconGradient: "bg-gradient-to-br from-blue-500 to-blue-700 text-white",
    lightBg: "bg-blue-50/60 dark:bg-blue-950/20",
    borderAccent: "hover:border-blue-300 dark:hover:border-blue-700/60",
    badgeText: "text-blue-600 dark:text-blue-400",
  },
  purple: {
    iconGradient: "bg-gradient-to-br from-purple-500 to-purple-700 text-white",
    lightBg: "bg-purple-50/60 dark:bg-purple-950/20",
    borderAccent: "hover:border-purple-300 dark:hover:border-purple-700/60",
    badgeText: "text-purple-600 dark:text-purple-400",
  },
  violet: {
    iconGradient: "bg-gradient-to-br from-violet-500 to-violet-700 text-white",
    lightBg: "bg-violet-50/60 dark:bg-violet-950/20",
    borderAccent: "hover:border-violet-300 dark:hover:border-violet-700/60",
    badgeText: "text-violet-600 dark:text-violet-400",
  },
  amber: {
    iconGradient: "bg-gradient-to-br from-amber-500 to-amber-700 text-white",
    lightBg: "bg-amber-50/60 dark:bg-amber-950/20",
    borderAccent: "hover:border-amber-300 dark:hover:border-amber-700/60",
    badgeText: "text-amber-600 dark:text-amber-400",
  },
  orange: {
    iconGradient: "bg-gradient-to-br from-orange-500 to-orange-700 text-white",
    lightBg: "bg-orange-50/60 dark:bg-orange-950/20",
    borderAccent: "hover:border-orange-300 dark:hover:border-orange-700/60",
    badgeText: "text-orange-600 dark:text-orange-400",
  },
  emerald: {
    iconGradient: "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white",
    lightBg: "bg-emerald-50/60 dark:bg-emerald-950/20",
    borderAccent: "hover:border-emerald-300 dark:hover:border-emerald-700/60",
    badgeText: "text-emerald-600 dark:text-emerald-400",
  },
  teal: {
    iconGradient: "bg-gradient-to-br from-teal-500 to-teal-700 text-white",
    lightBg: "bg-teal-50/60 dark:bg-teal-950/20",
    borderAccent: "hover:border-teal-300 dark:hover:border-teal-700/60",
    badgeText: "text-teal-600 dark:text-teal-400",
  },
  rose: {
    iconGradient: "bg-gradient-to-br from-rose-500 to-rose-700 text-white",
    lightBg: "bg-rose-50/60 dark:bg-rose-950/20",
    borderAccent: "hover:border-rose-300 dark:hover:border-rose-700/60",
    badgeText: "text-rose-600 dark:text-rose-400",
  },
  pink: {
    iconGradient: "bg-gradient-to-br from-pink-500 to-pink-700 text-white",
    lightBg: "bg-pink-50/60 dark:bg-pink-950/20",
    borderAccent: "hover:border-pink-300 dark:hover:border-pink-700/60",
    badgeText: "text-pink-600 dark:text-pink-400",
  },
  cyan: {
    iconGradient: "bg-gradient-to-br from-cyan-500 to-cyan-700 text-white",
    lightBg: "bg-cyan-50/60 dark:bg-cyan-950/20",
    borderAccent: "hover:border-cyan-300 dark:hover:border-cyan-700/60",
    badgeText: "text-cyan-600 dark:text-cyan-400",
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
  const scheme = colorMap[color] || colorMap.indigo;
  const isPositiveTrend = (trend?.value ?? 0) >= 0;

  return (
    <Card
      className={cn(
        "stat-card-hover relative overflow-hidden rounded-2xl border bg-card transition-all duration-200 shadow-sm",
        scheme.borderAccent,
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
              {title}
            </p>
            <p className="text-3xl font-extrabold text-foreground mt-1.5 tabular-nums tracking-tight">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate font-medium">
                {subtitle}
              </p>
            )}
            {trend && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded-full text-xs font-semibold border",
                  isPositiveTrend
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
                    : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60"
                )}
              >
                {isPositiveTrend ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {Math.abs(trend.value)}% {trend.label}
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-2xl shadow-md flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
              scheme.iconGradient
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
