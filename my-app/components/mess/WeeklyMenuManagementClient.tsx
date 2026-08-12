"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, UtensilsCrossed, AlertTriangle } from "lucide-react";
import { upsertMenu, deleteMenu } from "@/lib/actions/mess";
import { toast } from "sonner";
import { format, addDays, subDays, startOfWeek } from "date-fns";

type Props = {
  initialRefDate: string;
  weeklyMenus: Record<string, Record<string, string[]>>;
  rawMenus: any[];
  isManager: boolean;
};

export function WeeklyMenuManagementClient({
  initialRefDate,
  weeklyMenus,
  rawMenus,
  isManager,
}: Props) {
  const router = useRouter();
  const [currentRefDate, setCurrentRefDate] = useState(initialRefDate);
  const [selectedDay, setSelectedDay] = useState(initialRefDate);

  // Sync state when server re-renders with new date searchParams
  useEffect(() => {
    setCurrentRefDate(initialRefDate);
    setSelectedDay(initialRefDate);
  }, [initialRefDate]);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editDate, setEditDate] = useState(initialRefDate);
  const [editMealType, setEditMealType] = useState("breakfast");
  const [itemsText, setItemsText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetMenu, setTargetMenu] = useState<any>(null);

  // Week days list
  const startD = startOfWeek(new Date(currentRefDate), { weekStartsOn: 0 });
  const weekDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(format(addDays(startD, i), "yyyy-MM-dd"));
  }

  const mealTypes = ["breakfast", "lunch", "snacks", "dinner"] as const;
  const mealIcons: Record<string, string> = { breakfast: "🌅", lunch: "☀️", snacks: "☕", dinner: "🌙" };

  function navigateToDate(targetDate: string) {
    setCurrentRefDate(targetDate);
    setSelectedDay(targetDate);
    router.push(`/mess/menu?date=${targetDate}`);
  }

  function handlePrevWeek() {
    const prev = format(subDays(new Date(currentRefDate), 7), "yyyy-MM-dd");
    navigateToDate(prev);
  }

  function handleNextWeek() {
    const next = format(addDays(new Date(currentRefDate), 7), "yyyy-MM-dd");
    navigateToDate(next);
  }

  function handleCurrentWeek() {
    const today = new Date().toISOString().split("T")[0];
    navigateToDate(today);
  }

  function openEditModal(dStr: string, mType: string) {
    const existing = rawMenus.find((m) => m.date === dStr && m.meal_type === mType);
    setEditDate(dStr);
    setEditMealType(mType);
    setItemsText(existing ? (existing.items || []).join(", ") : "");
    setModalOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const items = itemsText
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    if (items.length === 0) {
      toast.error("Please enter at least one menu item.");
      return;
    }

    setSubmitting(true);
    const res = await upsertMenu(editDate, editMealType, items);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Menu for ${editMealType} on ${editDate} saved.`);
      setModalOpen(false);
      router.push(`/mess/menu?date=${editDate}`);
      router.refresh();
    }
  }

  async function handleConfirmDelete() {
    if (!targetMenu) return;
    setSubmitting(true);
    const res = await deleteMenu(targetMenu.id);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Menu record deleted.");
      setDeleteOpen(false);
      setTargetMenu(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Week Navigator */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevWeek}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous Week
            </Button>
            <Button variant="outline" size="sm" onClick={handleCurrentWeek}>
              Current Week
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              Next Week <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <p className="text-sm font-semibold">
            {format(new Date(weekDays[0]), "dd MMM")} — {format(new Date(weekDays[6]), "dd MMM yyyy")}
          </p>

          {isManager && (
            <Button
              onClick={() => {
                setEditDate(selectedDay);
                setEditMealType("breakfast");
                setItemsText("");
                setModalOpen(true);
              }}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" /> Add / Edit Menu Record
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Day Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {weekDays.map((dStr) => {
          const dObj = new Date(dStr);
          const isSelected = selectedDay === dStr;

          return (
            <button
              key={dStr}
              type="button"
              onClick={() => setSelectedDay(dStr)}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all text-xs flex flex-col items-center flex-1 min-w-[70px] ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-card border hover:border-primary/40 text-foreground"
              }`}
            >
              <span>{format(dObj, "EEEE")}</span>
              <span className="text-[11px] opacity-80">{format(dObj, "dd MMM")}</span>
            </button>
          );
        })}
      </div>

      {/* Meals Grid for Selected Day */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mealTypes.map((mType) => {
          const rawItem = rawMenus.find((m) => m.date === selectedDay && m.meal_type === mType);
          const items: string[] = rawItem?.items || [];

          return (
            <Card key={mType} className="border hover:border-primary/40 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2 capitalize">
                    <span>{mealIcons[mType]}</span> {mType}
                  </CardTitle>
                  {isManager && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={() => openEditModal(selectedDay, mType)}
                        title="Edit Menu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      {rawItem && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => {
                            setTargetMenu(rawItem);
                            setDeleteOpen(true);
                          }}
                          title="Delete Menu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-4">No menu items configured for this meal.</p>
                ) : (
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1.5">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <span className="text-primary font-bold">•</span>
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

      {/* Add / Edit Menu Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Configure Mess Menu</DialogTitle>
            <DialogDescription>Create or update meal items for specified date.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="eDate">Date *</Label>
                <Input id="eDate" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Meal Type *</Label>
                <Select value={editMealType} onValueChange={(val: any) => setEditMealType(val || "")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast 🌅</SelectItem>
                    <SelectItem value="lunch">Lunch ☀️</SelectItem>
                    <SelectItem value="snacks">Evening Snacks ☕</SelectItem>
                    <SelectItem value="dinner">Dinner 🌙</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="iText">Menu Items (Comma Separated) *</Label>
              <Input
                id="iText"
                placeholder="e.g. Idli, Sambar, Coconut Chutney, Tea / Coffee"
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
                required
              />
              <p className="text-[11px] text-muted-foreground">Separate each food item with a comma.</p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Menu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" /> Confirm Menu Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the <strong>{targetMenu?.meal_type}</strong> menu for <strong>{targetMenu?.date}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete Menu Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
