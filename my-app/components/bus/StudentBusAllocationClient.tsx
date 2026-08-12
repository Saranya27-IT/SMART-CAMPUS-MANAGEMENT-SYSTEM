"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UserCheck, Plus, Trash2, Search, ShieldAlert, Bus, MapPin, CheckCircle2, UserX } from "lucide-react";
import { allocateStudentBus, deallocateStudentBus, getStops } from "@/lib/actions/bus";
import { toast } from "sonner";

type Props = {
  students: any[];
  assignments: any[];
  buses: any[];
  routes: any[];
};

export function StudentBusAllocationClient({ students, assignments, buses, routes }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("DAY_SCHOLAR");

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedStopId, setSelectedStopId] = useState("none");
  const [availableStops, setAvailableStops] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Deallocate Dialog
  const [deallocateOpen, setDeallocateOpen] = useState(false);
  const [targetStudent, setTargetStudent] = useState<any>(null);

  // Map assignments
  const assignmentMap = new Map();
  assignments.forEach((a) => {
    assignmentMap.set(a.student_id, a);
  });

  // Calculate filled seats per bus
  const busCapacityMap = new Map<string, { filled: number; capacity: number; bus_number: string }>();
  buses.forEach((b) => {
    const count = assignments.filter((a) => a.bus_id === b.id).length;
    busCapacityMap.set(b.id, { filled: count, capacity: b.capacity, bus_number: b.bus_number });
  });

  const filteredStudents = students.filter((s) => {
    const matchesType = typeFilter === "all" || s.student_type === typeFilter;
    const matchesSearch =
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const dayScholarStudents = students.filter((s) => s.student_type === "DAY_SCHOLAR");

  async function handleBusSelect(busId: string) {
    setSelectedBusId(busId);
    const targetBus = buses.find((b) => b.id === busId);
    if (targetBus && targetBus.route_id) {
      setSelectedRouteId(targetBus.route_id);
      const { data } = await getStops(targetBus.route_id);
      setAvailableStops(data || []);
    } else {
      setAvailableStops([]);
    }
  }

  function openAllocateModal(studentId?: string) {
    if (studentId) {
      setSelectedStudentId(studentId);
    } else {
      setSelectedStudentId(dayScholarStudents[0]?.id || "");
    }
    const defaultBus = buses.find((b) => b.status === "ACTIVE") || buses[0];
    if (defaultBus) {
      handleBusSelect(defaultBus.id);
    }
    setSelectedStopId("none");
    setModalOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedStudentId || !selectedBusId) {
      toast.error("Please select a student and an active bus.");
      return;
    }

    setSubmitting(true);
    const res = await allocateStudentBus({
      student_id: selectedStudentId,
      bus_id: selectedBusId,
      route_id: selectedRouteId || routes[0]?.id,
      stop_id: selectedStopId === "none" ? null : selectedStopId,
    });

    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Student assigned to bus successfully.");
      setModalOpen(false);
      window.location.reload();
    }
  }

  async function handleConfirmDeallocate() {
    if (!targetStudent) return;
    setSubmitting(true);
    const res = await deallocateStudentBus(targetStudent.id);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Bus allocation removed.");
      setDeallocateOpen(false);
      setTargetStudent(null);
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Student, Roll No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={typeFilter} onValueChange={(val: any) => setTypeFilter(val || "DAY_SCHOLAR")}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DAY_SCHOLAR">Day Scholars Only</SelectItem>
                <SelectItem value="HOSTELLER">Hostellers (Blocked)</SelectItem>
                <SelectItem value="all">All Students</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => openAllocateModal()} className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Allocate Student to Bus
          </Button>
        </CardContent>
      </Card>

      {/* Allocation Feed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Student Bus Allocations ({filteredStudents.length})</CardTitle>
          <CardDescription>Day Scholar shuttle seating allocations and boarding stop setup</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No students found matching filters.</p>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((student) => {
                const assignment = assignmentMap.get(student.id);
                const isDayScholar = student.student_type === "DAY_SCHOLAR";

                return (
                  <div key={student.id} className="p-4 rounded-xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                        isDayScholar ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">{student.full_name}</h4>
                          <Badge variant="outline" className="font-mono text-xs">{student.roll_number || "STU"}</Badge>
                          <Badge className={
                            isDayScholar ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"
                          }>
                            {student.student_type || "HOSTELLER"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{student.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {assignment ? (
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs space-y-0.5">
                          <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <Bus className="w-3.5 h-3.5" /> Assigned: {assignment.buses?.bus_number || "BUS"}
                          </div>
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                            Route: {assignment.bus_routes?.name || "N/A"} | Stop: {assignment.bus_stops?.name || "Main Stand"}
                          </div>
                        </div>
                      ) : isDayScholar ? (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                          Unallocated
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-xs">
                          Not Eligible (Hosteller)
                        </Badge>
                      )}

                      {assignment ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => { setTargetStudent(student); setDeallocateOpen(true); }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Deallocate
                        </Button>
                      ) : isDayScholar ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => openAllocateModal(student.id)}
                        >
                          Allocate Seat
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allocate Student Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Allocate Day Scholar to Bus</DialogTitle>
            <DialogDescription>Assign student to active campus shuttle bus and boarding stop.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Select Day Scholar Student *</Label>
              <Select value={selectedStudentId} onValueChange={(val: any) => setSelectedStudentId(val || "")}>
                <SelectTrigger><SelectValue placeholder="Select Day Scholar" /></SelectTrigger>
                <SelectContent>
                  {dayScholarStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name} ({s.roll_number || s.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Select Active Bus *</Label>
              <Select value={selectedBusId} onValueChange={(val: any) => handleBusSelect(val || "")}>
                <SelectTrigger><SelectValue placeholder="Select Bus" /></SelectTrigger>
                <SelectContent>
                  {buses.map((b) => {
                    const cap = busCapacityMap.get(b.id) || { filled: 0, capacity: b.capacity, bus_number: b.bus_number };
                    const isFull = cap.filled >= cap.capacity;

                    return (
                      <SelectItem key={b.id} value={b.id} disabled={isFull || b.status !== "ACTIVE"}>
                        {b.bus_number} — ({cap.filled}/{cap.capacity} seats filled) {isFull ? "[FULL]" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {availableStops.length > 0 && (
              <div className="space-y-1.5">
                <Label>Select Boarding Stop</Label>
                <Select value={selectedStopId} onValueChange={(val: any) => setSelectedStopId(val || "none")}>
                  <SelectTrigger><SelectValue placeholder="Select Stop" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">First Main Stop</SelectItem>
                    {availableStops.map((st) => (
                      <SelectItem key={st.id} value={st.id}>
                        Stop {st.sequence_number || st.stop_order}: {st.name} ({st.expected_arrival_time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Allocating..." : "Save Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deallocate Confirmation Dialog */}
      <Dialog open={deallocateOpen} onOpenChange={setDeallocateOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Confirm Bus Deallocation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove bus allocation for <strong>{targetStudent?.full_name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeallocateOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDeallocate} disabled={submitting}>
              {submitting ? "Deallocating..." : "Remove Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
