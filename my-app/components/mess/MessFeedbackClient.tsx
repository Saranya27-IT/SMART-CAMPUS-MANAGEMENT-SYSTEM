"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp } from "lucide-react";
import { format } from "date-fns";

type Props = {
  feedbackList: any[];
  overview: {
    averageRating: number;
    totalCount: number;
    distribution: Record<number, number>;
    mealRatings: Record<string, number>;
  };
};

export function MessFeedbackClient({ feedbackList, overview }: Props) {
  const [search, setSearch] = useState("");
  const [mealFilter, setMealFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const filtered = feedbackList.filter((fb) => {
    const q = search.toLowerCase();
    const studentName = fb.profiles?.full_name?.toLowerCase() || "";
    const comment = (fb.comment || "").toLowerCase();
    const meal = (fb.meal_type || "").toLowerCase();

    const matchesSearch = studentName.includes(q) || comment.includes(q) || meal.includes(q);
    const matchesMeal = mealFilter === "all" || fb.meal_type === mealFilter;

    let matchesRating = true;
    if (ratingFilter === "high") matchesRating = fb.rating >= 4;
    else if (ratingFilter === "low") matchesRating = fb.rating <= 2;
    else if (ratingFilter === "medium") matchesRating = fb.rating === 3;

    return matchesSearch && matchesMeal && matchesRating;
  });

  const lowRatedCount = feedbackList.filter((f) => f.rating <= 2).length;
  const highRatedCount = feedbackList.filter((f) => f.rating >= 4).length;

  return (
    <div className="space-y-6">
      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 font-black text-xl">
              ★
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Average Meal Rating</p>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-400">
                {overview.averageRating > 0 ? `${overview.averageRating} / 5` : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Feedback Count</p>
              <p className="text-2xl font-bold">{overview.totalCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Highest Rated (4-5 Stars)</p>
              <p className="text-2xl font-bold text-emerald-600">{highRatedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950">
              <ThumbsDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Low Rated (&lt; 3 Stars)</p>
              <p className="text-2xl font-bold text-rose-600">{lowRatedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meal Ratings Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Star Rating Distribution</CardTitle>
            <CardDescription>Breakdown of 1-star to 5-star ratings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = overview.distribution[star] || 0;
              const pct = overview.totalCount > 0 ? Math.round((count / overview.totalCount) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-bold flex items-center gap-1">
                    {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        star >= 4 ? "bg-emerald-500" : star === 3 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-muted-foreground font-mono">{count} ({pct}%)</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Meal Type Averages */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Meal-wise Average Ratings</CardTitle>
            <CardDescription>Average rating by meal category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(["breakfast", "lunch", "snacks", "dinner"] as const).map((meal) => {
              const avg = overview.mealRatings[meal] || 0;
              return (
                <div key={meal} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <span className="font-semibold text-sm capitalize">{meal}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-500 text-sm">★ {avg > 0 ? avg : "N/A"}</span>
                    <Badge variant="outline" className="text-xs">
                      {avg >= 4 ? "High Rating" : avg >= 3 ? "Average" : avg > 0 ? "Needs Improvement" : "No Data"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search Student, Comment, Meal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <Select value={mealFilter} onValueChange={(val: any) => setMealFilter(val || "")}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Meals" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meals</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="snacks">Evening Snacks</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={(val: any) => setRatingFilter(val || "")}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Ratings" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="high">High (4-5 Stars)</SelectItem>
                <SelectItem value="medium">Medium (3 Stars)</SelectItem>
                <SelectItem value="low">Low (&lt; 3 Stars)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Feed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Student Feedback Feed ({filtered.length})</CardTitle>
          <CardDescription>Submitted rating stars and optional comments</CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No feedback entries found matching filters.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((fb) => (
                <div key={fb.id} className="p-4 rounded-xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{fb.profiles?.full_name || "Student"}</span>
                      <Badge variant="outline" className="capitalize text-xs">{fb.meal_type}</Badge>
                      <span className="text-xs text-muted-foreground">{fb.date}</span>
                    </div>
                    {fb.comment ? (
                      <p className="text-xs text-muted-foreground italic">"{fb.comment}"</p>
                    ) : (
                      <p className="text-xs text-muted-foreground opacity-60">No comment provided.</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 font-bold text-base">
                    {"★".repeat(fb.rating)}
                    {"☆".repeat(5 - fb.rating)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
