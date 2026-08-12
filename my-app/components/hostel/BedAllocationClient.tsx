"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UserCheck, UserMinus, Plus, Search, ShieldAlert, Building2, CheckCircle2 } from "lucide-react";
import { allocateBed, deallocateBed } from "@/lib/actions/hostel";
import { toast } from "sonner";
import { format } from "date-fns";

type Props = {
  activeAllocations: any[];
  allStudents: any[];
  hostelsTree: any[];
};

export function BedAllocationClient({ activeAllocations, allStudents, hostelsTree }: Props) {
  const [search, setSearch] = useState("");
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form selection state
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedHostelId, setSelectedHostelId] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedBedId, setSelectedBedId] = useState("");

  // Deallocate Dialog
  const [deallocateOpen, setDeallocateOpen] = useState(false);
  const [targetBed, setTargetBed] = useState<any>(null);

  // Cascading selections
  const currentHostel = hostelsTree.find((h) => h.id === selectedHostelId);
  const availableBlocks = currentHostel?.hostel_blocks || [];

  const currentBlock = availableBlocks.find((b: any) => b.id === selectedBlockId);
  const availableFloors = currentBlock?.hostel_floors || [];

  const currentFloor = availableFloors.find((f: any) => f.id === selectedFloorId);
  const availableRooms = currentFloor?.hostel_rooms || [];

  const currentRoom = availableRooms.find((r: any) => r.id === selectedRoomId);
  const availableBeds = (currentRoom?.hostel_beds || []).filter((b: any) => b.status === "available");

  // Selected Student verification preview
  const selectedStudent = allStudents.find((s) => s.id === selectedStudentId);

  const filteredAllocations = activeAllocations.filter((a) => {
    const q = search.toLowerCase();
    const studentName = a.profiles?.full_name?.toLowerCase() || "";
    const roll = a.profiles?.roll_number?.toLowerCase() || "";
    const roomNum = a.hostel_rooms?.room_number?.toLowerCase() || "";
    const hostelName = a.hostel_rooms?.hostel_floors?.hostel_blocks?.hostels?.name?.toLowerCase() || "";

    return studentName.includes(q) || roll.includes(q) || roomNum.includes(q) || hostelName.includes(q);
  });

  async function handleAllocateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("Please select a student.");
      return;
    }
    if (!selectedBedId) {
      toast.error("Please select an available bed.");
      return;
    }

    setSubmitting(true);
    const res = await allocateBed(selectedBedId, selectedStudentId);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Hostel bed allocated successfully!");
      setAllocateOpen(false);
      resetForm();
    }
  }

  async function handleConfirmDeallocate() {
    if (!targetBed) return;
    setSubmitting(true);
    const res = await deallocateBed(targetBed.id);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Deallocated Bed ${targetBed.bed_number} successfully.`);
      setDeallocateOpen(false);
      setTargetBed(null);
    }
  }

  function resetForm() {
    setSelectedStudentId("");
    setSelectedHostelId("");
    setSelectedBlockId("");
    setSelectedFloorId("");
    setSelectedRoomId("");
    setSelectedBedId("");
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search Resident Student, Roll No, Room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => { resetForm(); setAllocateOpen(true); }} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Allocate New Bed
        </Button>
      </div>

      {/* Allocations Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active Bed Allocations ({filteredAllocations.length})</CardTitle>
          <CardDescription>All students currently occupying hostel beds</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAllocations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No active allocations found matching query.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase font-semibold">
                    <th className="p-3">Student</th>
                    <th className="p-3">Roll No</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Hostel & Block</th>
                    <th className="p-3">Room & Bed</th>
                    <th className="p-3">Allocated Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAllocations.map((alloc) => {
                    const student = alloc.profiles;
                    const room = alloc.hostel_rooms;
                    const floor = room?.hostel_floors;
                    const block = floor?.hostel_blocks;
                    const hostel = block?.hostels;

                    return (
                      <tr key={alloc.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-semibold text-foreground">
                          {student?.full_name || "Unknown"}
                          <p className="text-xs text-muted-foreground font-normal">{student?.email}</p>
                        </td>
                        <td className="p-3 font-mono text-xs">{student?.roll_number || "—"}</td>
                        <td className="p-3 text-xs">{student?.department || "N/A"}</td>
                        <td className="p-3 text-xs">
                          <p className="font-medium text-foreground">{hostel?.name || "Hostel"}</p>
                          <p className="text-muted-foreground">{block?.name || "Block"} · Floor {floor?.floor_number ?? 1}</p>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200">
                            Room {room?.room_number} · Bed {alloc.bed_number}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {alloc.allocated_at ? format(new Date(alloc.allocated_at), "dd MMM yyyy") : "—"}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 h-8 gap-1"
                            onClick={() => { setTargetBed(alloc); setDeallocateOpen(true); }}
                          >
                            <UserMinus className="w-3.5 h-3.5" /> Deallocate
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allocate Bed Multi-Step Dialog */}
      <Dialog open={allocateOpen} onOpenChange={setAllocateOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Allocate Hostel Bed</DialogTitle>
            <DialogDescription>Assign a student to an available room bed.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAllocateSubmit} className="space-y-4 py-2">
            {/* Step 1: Select Student */}
            <div className="space-y-1.5">
              <Label>1. Select Student *</Label>
              <Select value={selectedStudentId} onValueChange={(val: any) => setSelectedStudentId(val || "")}>
                <SelectTrigger><SelectValue placeholder="Choose a student..." /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {allStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name} ({s.roll_number || "STU"}) — [{s.student_type || "HOSTELLER"}]
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStudent && (
                <div className="text-xs p-2 rounded border bg-muted/40 mt-1 flex items-center justify-between">
                  <span>Student Type: <strong>{selectedStudent.student_type || "HOSTELLER"}</strong></span>
                  {selectedStudent.student_type === "DAY_SCHOLAR" ? (
                    <Badge className="bg-rose-100 text-rose-700 border-rose-200">DAY_SCHOLAR (Blocked)</Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Eligible</Badge>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Select Hostel */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>2. Hostel *</Label>
                <Select value={selectedHostelId} onValueChange={(val: any) => { setSelectedHostelId(val || ""); setSelectedBlockId(""); setSelectedFloorId(""); setSelectedRoomId(""); setSelectedBedId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select Hostel..." /></SelectTrigger>
                  <SelectContent>
                    {hostelsTree.map((h) => (
                      <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>3. Block *</Label>
                <Select value={selectedBlockId} onValueChange={(val: any) => { setSelectedBlockId(val || ""); setSelectedFloorId(""); setSelectedRoomId(""); setSelectedBedId(""); }} disabled={!selectedHostelId}>
                  <SelectTrigger><SelectValue placeholder="Select Block..." /></SelectTrigger>
                  <SelectContent>
                    {availableBlocks.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Step 3: Select Floor & Room */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>4. Floor *</Label>
                <Select value={selectedFloorId} onValueChange={(val: any) => { setSelectedFloorId(val || ""); setSelectedRoomId(""); setSelectedBedId(""); }} disabled={!selectedBlockId}>
                  <SelectTrigger><SelectValue placeholder="Select Floor..." /></SelectTrigger>
                  <SelectContent>
                    {availableFloors.map((f: any) => (
                      <SelectItem key={f.id} value={f.id}>Floor {f.floor_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>5. Room *</Label>
                <Select value={selectedRoomId} onValueChange={(val: any) => { setSelectedRoomId(val || ""); setSelectedBedId(""); }} disabled={!selectedFloorId}>
                  <SelectTrigger><SelectValue placeholder="Select Room..." /></SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>
                        Room {r.room_number} ({r.condition || "Good"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Step 4: Select Bed */}
            <div className="space-y-1.5">
              <Label>6. Available Bed *</Label>
              <Select value={selectedBedId} onValueChange={(val: any) => setSelectedBedId(val || "")} disabled={!selectedRoomId}>
                <SelectTrigger><SelectValue placeholder={availableBeds.length === 0 ? "No available beds in room" : "Choose Available Bed..."} /></SelectTrigger>
                <SelectContent>
                  {availableBeds.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>
                      Bed {b.bed_number} (Available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAllocateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting || !selectedBedId || selectedStudent?.student_type === "DAY_SCHOLAR"}>
                {submitting ? "Allocating..." : "Confirm Allocation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deallocate Confirmation Dialog */}
      <Dialog open={deallocateOpen} onOpenChange={setDeallocateOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirm Deallocation</DialogTitle>
            <DialogDescription>
              Are you sure you want to deallocate Bed {targetBed?.bed_number} for <strong>{targetBed?.profiles?.full_name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeallocateOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDeallocate} disabled={submitting}>
              {submitting ? "Deallocating..." : "Deallocate Bed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
