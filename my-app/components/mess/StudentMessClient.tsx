"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Utensils, Star, AlertCircle, Lightbulb, ChevronLeft, ChevronRight, Calendar, CheckCircle2 } from "lucide-react";
import { submitFeedback, createMessComplaint, submitMessSuggestion } from "@/lib/actions/mess";
import { toast } from "sonner";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";

type Props = {
  todayMenus: any[];
  weeklyData: Record<string, Record<string, string[]>>;
  startDate: string;
  endDate: string;
  userFeedback: any[];
  userComplaints: any[];
  userSuggestions: any[];
};

export function StudentMessClient({
  todayMenus,
  weeklyData,
  startDate,
  endDate,
  userFeedback,
  userComplaints,
  userSuggestions,
}: Props) {
  // Navigation for Weekly Menu
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split("T")[0]);

  // Modal States
  const [ratingOpen, setRatingOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Rating Form State
  const [ratingMealType, setRatingMealType] = useState("lunch");
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  // Complaint Form State
  const [complaintCategory, setComplaintCategory] = useState("quality");
  const [complaintMealDate, setComplaintMealDate] = useState(new Date().toISOString().split("T")[0]);
  const [complaintMealType, setComplaintMealType] = useState("lunch");
  const [complaintDesc, setComplaintDesc] = useState("");

  // Suggestion Form State
  const [suggestionText, setSuggestionText] = useState("");

  // Structuring today's menu
  const todayMenuMap: Record<string, string[]> = {
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: [],
  };

  todayMenus.forEach((m) => {
    todayMenuMap[m.meal_type] = m.items || [];
  });

  const mealIcons: Record<string, string> = {
    breakfast: "🌅",
    lunch: "☀️",
    snacks: "☕",
    dinner: "🌙",
  };

  const mealTimes: Record<string, string> = {
    breakfast: "07:30 AM - 09:30 AM",
    lunch: "12:30 PM - 02:30 PM",
    snacks: "04:30 PM - 05:30 PM",
    dinner: "07:30 PM - 09:30 PM",
  };

  const selectedDayMenu = weeklyData[selectedDay] || { breakfast: [], lunch: [], snacks: [], dinner: [] };

  async function handleRatingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (ratingStars < 1 || ratingStars > 5) {
      toast.error("Rating must be between 1 and 5 stars.");
      return;
    }

    setSubmitting(true);
    const res = await submitFeedback(ratingMealType, ratingStars, ratingComment);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Thank you! Your meal rating was submitted.");
      setRatingOpen(false);
      setRatingComment("");
    }
  }

  async function handleComplaintSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!complaintDesc || complaintDesc.trim().length < 10) {
      toast.error("Complaint description must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    const res = await createMessComplaint(complaintDesc, complaintCategory, complaintMealDate, complaintMealType);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Food complaint submitted.");
      setComplaintOpen(false);
      setComplaintDesc("");
    }
  }

  async function handleSuggestionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!suggestionText || suggestionText.trim().length < 5) {
      toast.error("Suggestion must be at least 5 characters.");
      return;
    }

    setSubmitting(true);
    const res = await submitMessSuggestion(suggestionText);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Food suggestion submitted to Mess Manager.");
      setSuggestionOpen(false);
      setSuggestionText("");
    }
  }

  // Week days list
  const daysList: string[] = [];
  const startD = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    daysList.push(format(addDays(startD, i), "yyyy-MM-dd"));
  }

  return (
    <div className="space-y-6">
      {/* Quick Student Actions Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border bg-card shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl gradient-mess text-white flex items-center justify-center shadow-md flex-shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
              Student Mess & Dining Portal
            </h3>
            <p className="text-xs text-muted-foreground">View real-time meal menus, review food quality, and suggest dishes.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setRatingOpen(true)} className="gradient-mess text-white border-0 hover:opacity-90 shadow-sm gap-1.5 text-xs font-bold rounded-xl">
            <Star className="w-3.5 h-3.5 fill-white" /> Rate Meal
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSuggestionOpen(true)} className="border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/30 gap-1.5 text-xs rounded-xl">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Suggest Dish
          </Button>
          <Button size="sm" variant="outline" onClick={() => setComplaintOpen(true)} className="border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/30 gap-1.5 text-xs rounded-xl">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Food Complaint
          </Button>
        </div>
      </div>

      {/* Today's Menu Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold flex items-center gap-2">
            <span>Today's Dining Menu</span>
          </h3>
          <Badge variant="outline" className="font-semibold text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            {format(new Date(), "EEEE, dd MMM yyyy")}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(["breakfast", "lunch", "snacks", "dinner"] as const).map((meal) => {
            const items = todayMenuMap[meal] || [];
            const mealAccent =
              meal === "breakfast"
                ? "border-amber-200/80 hover:border-amber-300 dark:border-amber-900/60"
                : meal === "lunch"
                ? "border-orange-200/80 hover:border-orange-300 dark:border-orange-900/60"
                : meal === "snacks"
                ? "border-emerald-200/80 hover:border-emerald-300 dark:border-emerald-900/60"
                : "border-indigo-200/80 hover:border-indigo-300 dark:border-indigo-900/60";

            return (
              <Card key={meal} className={cn("rounded-2xl border bg-card hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden", mealAccent)}>
                <CardHeader className="pb-3 border-b bg-muted/20">
                  <CardTitle className="text-base flex items-center gap-2.5 capitalize">
                    <span className="text-2xl">{mealIcons[meal]}</span>
                    <div>
                      <p className="font-bold text-sm text-foreground">{meal}</p>
                      <p className="text-[11px] text-muted-foreground font-medium font-mono">{mealTimes[meal]}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-1">
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-4 text-center">Menu items not posted yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <span className="text-amber-500 font-black">•</span>
                          <span className="text-foreground font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Weekly Menu Viewer */}
      <Card className="rounded-2xl border shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" /> Weekly Menu Schedule
              </CardTitle>
              <CardDescription className="text-xs">
                {format(new Date(startDate), "MMM dd")} — {format(new Date(endDate), "MMM dd, yyyy")}
              </CardDescription>
            </div>
            {/* Day Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {daysList.map((dayStr) => {
                const dObj = new Date(dayStr);
                const isSelected = selectedDay === dayStr;
                return (
                  <button
                    key={dayStr}
                    type="button"
                    onClick={() => setSelectedDay(dayStr)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center cursor-pointer ${
                      isSelected
                        ? "gradient-mess text-white shadow-xs"
                        : "bg-card border text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span>{format(dObj, "EEE")}</span>
                    <span className="text-[10px] opacity-85">{format(dObj, "dd")}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {(["breakfast", "lunch", "snacks", "dinner"] as const).map((meal) => {
              const items = selectedDayMenu[meal] || [];
              return (
                <div key={meal} className="p-3.5 rounded-xl border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm capitalize flex items-center gap-1.5">
                      <span>{mealIcons[meal]}</span> {meal}
                    </span>
                    <Badge variant="outline" className="text-[10px]">{items.length} items</Badge>
                  </div>
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-2">No menu posted</p>
                  ) : (
                    <ul className="space-y-1 text-xs">
                      {items.map((it, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* User Feedback, Complaints & Suggestions History */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Submitted Feedback */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">My Meal Ratings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userFeedback.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No meal ratings submitted.</p>
            ) : (
              userFeedback.slice(0, 5).map((fb: any) => (
                <div key={fb.id} className="p-3 rounded-lg border text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize">{fb.meal_type} · {fb.date}</span>
                    <div className="flex items-center text-amber-500 font-bold">
                      ★ {fb.rating}/5
                    </div>
                  </div>
                  {fb.comment && <p className="text-muted-foreground italic">"{fb.comment}"</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Submitted Complaints */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">My Complaints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userComplaints.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No food complaints raised.</p>
            ) : (
              userComplaints.slice(0, 5).map((c: any) => (
                <div key={c.id} className="p-3 rounded-lg border text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">{c.category}</Badge>
                    <Badge className={
                      c.status === "resolved" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                      "bg-amber-100 text-amber-700 border-amber-200"
                    }>
                      {c.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-foreground">{c.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Submitted Suggestions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">My Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userSuggestions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No food suggestions submitted.</p>
            ) : (
              userSuggestions.slice(0, 5).map((s: any) => (
                <div key={s.id} className="p-3 rounded-lg border text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{format(new Date(s.created_at), "dd MMM")}</span>
                    <Badge variant="secondary" className="capitalize">{s.status}</Badge>
                  </div>
                  <p className="text-foreground">{s.suggestion}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rate Meal Modal */}
      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Rate Meal Feedback</DialogTitle>
            <DialogDescription>Select meal type and rate from 1 to 5 stars.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRatingSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Meal Type *</Label>
              <Select value={ratingMealType} onValueChange={(val: any) => setRatingMealType(val || "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast 🌅</SelectItem>
                  <SelectItem value="lunch">Lunch ☀️</SelectItem>
                  <SelectItem value="snacks">Evening Snacks ☕</SelectItem>
                  <SelectItem value="dinner">Dinner 🌙</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Rating (1 to 5 Stars) *</Label>
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingStars(star)}
                    className={`text-2xl transition-transform ${star <= ratingStars ? "scale-110 text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rComment">Optional Comment / Feedback</Label>
              <Textarea
                id="rComment"
                placeholder="Share what you liked or how taste/quality can be improved..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setRatingOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Rating"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Raise Food Complaint Modal */}
      <Dialog open={complaintOpen} onOpenChange={setComplaintOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Submit Food Complaint</DialogTitle>
            <DialogDescription>Report food quality, hygiene, quantity, or delay issues.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleComplaintSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Meal Date *</Label>
                <Input type="date" value={complaintMealDate} onChange={(e) => setComplaintMealDate(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Meal Type *</Label>
                <Select value={complaintMealType} onValueChange={(val: any) => setComplaintMealType(val || "")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="snacks">Evening Snacks</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={complaintCategory} onValueChange={(val: any) => setComplaintCategory(val || "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">Food Quality / Taste</SelectItem>
                  <SelectItem value="hygiene">Hygiene & Cleanliness</SelectItem>
                  <SelectItem value="quantity">Quantity / Shortage</SelectItem>
                  <SelectItem value="service">Service Delay</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Description * (min 10 chars)</Label>
              <Textarea
                placeholder="Describe the food issue in detail..."
                value={complaintDesc}
                onChange={(e) => setComplaintDesc(e.target.value)}
                required
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setComplaintOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Submit Suggestion Modal */}
      <Dialog open={suggestionOpen} onOpenChange={setSuggestionOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Submit Food Suggestion</DialogTitle>
            <DialogDescription>Suggest a new dish or menu improvement to Mess Manager.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSuggestionSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Suggestion Details * (min 5 chars)</Label>
              <Textarea
                placeholder="e.g. Include Paneer Butter Masala on Fridays, Add South Indian breakfast options..."
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
                required
                rows={4}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setSuggestionOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Suggestion"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
