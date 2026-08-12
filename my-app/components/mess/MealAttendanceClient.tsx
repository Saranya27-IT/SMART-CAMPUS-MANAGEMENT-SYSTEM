"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CalendarCheck, CheckCircle2, XCircle, Utensils } from "lucide-react";
import { markMessAttendance } from "@/lib/actions/mess";
import { toast } from "sonner";

type Props = {
  initialDate: string;
  attendanceData: any[];
  isManager: boolean;
};

export function MealAttendanceClient({ initialDate, attendanceData, isManager }: Props) {
  const [date, setDate] = useState(initialDate);
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "snacks" | "dinner">("lunch");
  const [search, setSearch] = useState("");
  const [updatingStudent, setUpdatingStudent] = useState<string | null>(null);

  const filteredStudents = attendanceData.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.full_name || "").toLowerCase().includes(q) ||
      (s.roll_number || "").toLowerCase().includes(q) ||
      (s.department || "").toLowerCase().includes(q)
    );
  });

  async function handleToggleAttendance(studentId: string, currentPresent: boolean) {
    if (!isManager) {
      toast.error("Only Mess Managers and Super Admins can mark attendance.");
      return;
    }

    setUpdatingStudent(studentId);
    const res = await markMessAttendance(studentId, mealType, !currentPresent, date);
    setUpdatingStudent(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Marked ${!currentPresent ? "PRESENT" : "ABSENT"} for ${mealType.toUpperCase()}`);
    }
  }

  const mealLabels: Record<string, string> = {
    breakfast: "Breakfast 🌅",
    lunch: "Lunch ☀️",
    snacks: "Evening Snacks ☕",
    dinner: "Dinner 🌙",
  };

  return (
    <div className="space-y-6">
      {/* Date & Meal Filter Header */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Select Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Select Meal Type</label>
              <Select value={mealType} onValueChange={(val: any) => setMealType(val)}>
                <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast 🌅</SelectItem>
                  <SelectItem value="lunch">Lunch ☀️</SelectItem>
                  <SelectItem value="snacks">Evening Snacks ☕</SelectItem>
                  <SelectItem value="dinner">Dinner 🌙</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search student name or roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendance List Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Meal Attendance — {mealLabels[mealType]} ({date})
              </CardTitle>
              <CardDescription>Click to toggle Present/Absent status per student</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Total: {filteredStudents.length} Students
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No students found.</p>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((s) => {
                const isPresent = Boolean(s[mealType]);
                const isUpdating = updatingStudent === s.student_id;

                return (
                  <div key={s.student_id} className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card hover:border-primary/30 transition-all">
                    <div>
                      <p className="font-bold text-sm text-foreground">{s.full_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{s.roll_number} · {s.department}</p>
                    </div>

                    {/* Meal Status Summary & Toggle */}
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground mr-2">
                        <span className={`px-1.5 py-0.5 rounded ${s.breakfast ? "bg-emerald-100 text-emerald-700" : "bg-muted"}`}>B</span>
                        <span className={`px-1.5 py-0.5 rounded ${s.lunch ? "bg-emerald-100 text-emerald-700" : "bg-muted"}`}>L</span>
                        <span className={`px-1.5 py-0.5 rounded ${s.snacks ? "bg-emerald-100 text-emerald-700" : "bg-muted"}`}>S</span>
                        <span className={`px-1.5 py-0.5 rounded ${s.dinner ? "bg-emerald-100 text-emerald-700" : "bg-muted"}`}>D</span>
                      </div>

                      {isManager ? (
                        <Button
                          size="sm"
                          variant={isPresent ? "default" : "outline"}
                          className={`gap-1.5 h-8 text-xs font-semibold ${
                            isPresent ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-rose-200 text-rose-600 hover:bg-rose-50"
                          }`}
                          onClick={() => handleToggleAttendance(s.student_id, isPresent)}
                          disabled={isUpdating}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Present
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Absent
                            </>
                          )}
                        </Button>
                      ) : (
                        <Badge className={isPresent ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>
                          {isPresent ? "Present" : "Absent"}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
