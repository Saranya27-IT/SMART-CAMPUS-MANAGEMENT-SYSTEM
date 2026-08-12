"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck, CheckCircle2, XCircle, Clock, Building2, Save } from "lucide-react";
import { markRoomAttendance } from "@/lib/actions/hostel";
import { toast } from "sonner";
import { format } from "date-fns";

type Props = {
  hostels: any[];
  allBeds: any[];
  historicalAttendance: any[];
};

export function RoomWiseAttendanceClient({ hostels, allBeds, historicalAttendance }: Props) {
  const [selectedHostelId, setSelectedHostelId] = useState(hostels[0]?.id || "");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const [saving, setSaving] = useState(false);

  // Filter available rooms in selected hostel
  const currentHostelBeds = allBeds.filter((b) => {
    const hId = b.hostel_rooms?.hostel_floors?.hostel_blocks?.hostels?.id;
    return hId === selectedHostelId;
  });

  const roomMap = new Map<string, { id: string; number: string; block: string }>();
  currentHostelBeds.forEach((b) => {
    if (b.hostel_rooms) {
      roomMap.set(b.hostel_rooms.id, {
        id: b.hostel_rooms.id,
        number: b.hostel_rooms.room_number,
        block: b.hostel_rooms.hostel_floors?.hostel_blocks?.name || "Block",
      });
    }
  });

  const availableRoomsList = Array.from(roomMap.values()).sort((a, b) => a.number.localeCompare(b.number));

  // Allocated students in selected room
  const allocatedInSelectedRoom = currentHostelBeds.filter((b) => b.hostel_rooms?.id === selectedRoomId);

  // Local attendance status map for the form
  const [localAttendanceState, setLocalAttendanceState] = useState<Record<string, string>>({});

  function handleRoomSelect(roomId: string) {
    setSelectedRoomId(roomId);
    const roomBeds = currentHostelBeds.filter((b) => b.hostel_rooms?.id === roomId);

    const initialState: Record<string, string> = {};
    roomBeds.forEach((b) => {
      if (b.student_id) {
        // check if historical record exists for this student & date
        const existing = historicalAttendance.find((h) => h.student_id === b.student_id && h.date === selectedDate);
        initialState[b.student_id] = existing?.status || "present";
      }
    });

    setLocalAttendanceState(initialState);
  }

  function handleStatusChange(studentId: string, status: string) {
    setLocalAttendanceState((prev) => ({ ...prev, [studentId]: status }));
  }

  async function handleSaveAttendance() {
    if (!selectedRoomId) {
      toast.error("Please select a room first.");
      return;
    }
    if (allocatedInSelectedRoom.length === 0) {
      toast.error("No students allocated to this room.");
      return;
    }

    const payload = allocatedInSelectedRoom
      .filter((b) => b.student_id)
      .map((b) => ({
        student_id: b.student_id,
        hostel_id: selectedHostelId,
        status: localAttendanceState[b.student_id] || "present",
      }));

    if (payload.length === 0) {
      toast.error("No valid student records to mark.");
      return;
    }

    setSaving(true);
    const res = await markRoomAttendance(payload, selectedDate);
    setSaving(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Attendance marked successfully for Room ${availableRoomsList.find((r) => r.id === selectedRoomId)?.number}!`);
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="mark">
        <TabsList className="grid grid-cols-2 w-full sm:w-80">
          <TabsTrigger value="mark">Room-wise Marking</TabsTrigger>
          <TabsTrigger value="history">Attendance History</TabsTrigger>
        </TabsList>

        {/* Tab 1: Room-wise Marking */}
        <TabsContent value="mark" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Select Location & Date</CardTitle>
              <CardDescription>Choose Hostel, Room number, and Date to conduct room-wise roll call</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Select Hostel</label>
                  <Select
                    value={selectedHostelId}
                    onValueChange={(val) => {
                      setSelectedHostelId(val);
                      setSelectedRoomId("");
                      setLocalAttendanceState({});
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Hostel..." /></SelectTrigger>
                    <SelectContent>
                      {hostels.map((h) => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Select Room</label>
                  <Select value={selectedRoomId} onValueChange={(val: any) => handleRoomSelect(val || "")} disabled={!selectedHostelId}>
                    <SelectTrigger><SelectValue placeholder="Select Room..." /></SelectTrigger>
                    <SelectContent>
                      {availableRoomsList.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          Room {r.number} ({r.block})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Attendance Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student List in Room */}
          {selectedRoomId ? (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Allocated Students — Room {availableRoomsList.find((r) => r.id === selectedRoomId)?.number}
                  </CardTitle>
                  <CardDescription>Mark attendance status for each resident student</CardDescription>
                </div>
                <Button onClick={handleSaveAttendance} disabled={saving || allocatedInSelectedRoom.length === 0} className="gap-2">
                  <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Room Attendance"}
                </Button>
              </CardHeader>
              <CardContent>
                {allocatedInSelectedRoom.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No students currently allocated to this room.</p>
                ) : (
                  <div className="space-y-3">
                    {allocatedInSelectedRoom.map((b) => {
                      const student = b.profiles;
                      if (!student) return null;
                      const currentStatus = localAttendanceState[student.id] || "present";

                      return (
                        <div key={b.id} className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card">
                          <div>
                            <p className="font-bold text-sm text-foreground">{student.full_name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{student.roll_number || "STU"} · {student.department || "Dept"}</p>
                            <p className="text-xs text-primary font-medium mt-0.5">Bed {b.bed_number}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={currentStatus === "present" ? "default" : "outline"}
                              className={currentStatus === "present" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                              onClick={() => handleStatusChange(student.id, "present")}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Present
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant={currentStatus === "absent" ? "default" : "outline"}
                              className={currentStatus === "absent" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}
                              onClick={() => handleStatusChange(student.id, "absent")}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Absent
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant={currentStatus === "on_leave" ? "default" : "outline"}
                              className={currentStatus === "on_leave" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
                              onClick={() => handleStatusChange(student.id, "on_leave")}
                            >
                              <Clock className="w-3.5 h-3.5 mr-1" /> On Leave
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground space-y-2">
                <Building2 className="w-10 h-10 mx-auto opacity-30" />
                <p className="font-semibold">Please select a Room above to perform room-wise attendance marking.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: Attendance History */}
        <TabsContent value="history" className="pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Attendance Log History</CardTitle>
              <CardDescription>Recent roll call attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              {historicalAttendance.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No historical attendance records logged yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase font-semibold">
                        <th className="p-3">Date</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Roll Number</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {historicalAttendance.map((h: any) => (
                        <tr key={h.id} className="hover:bg-muted/20">
                          <td className="p-3 text-xs font-mono">{format(new Date(h.date), "dd MMM yyyy")}</td>
                          <td className="p-3 font-semibold text-foreground">{h.profiles?.full_name || "Student"}</td>
                          <td className="p-3 font-mono text-xs">{h.profiles?.roll_number || "—"}</td>
                          <td className="p-3">
                            <Badge className={
                              h.status === "present" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                              h.status === "absent" ? "bg-rose-100 text-rose-700 border-rose-200" :
                              "bg-amber-100 text-amber-700 border-amber-200"
                            }>
                              {h.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
