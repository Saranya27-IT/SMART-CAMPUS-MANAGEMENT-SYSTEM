"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Building2, BedDouble, Wrench, Search, Filter, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { updateRoomCondition } from "@/lib/actions/hostel";
import { toast } from "sonner";

type Props = {
  rooms: any[];
  hostels: any[];
};

export function RoomManagementClient({ rooms, hostels }: Props) {
  const [search, setSearch] = useState("");
  const [hostelFilter, setHostelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");

  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [newCondition, setNewCondition] = useState("Good");
  const [submitting, setSubmitting] = useState(false);

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.room_number.toLowerCase().includes(search.toLowerCase()) ||
      r.hostel_name.toLowerCase().includes(search.toLowerCase()) ||
      r.block_name.toLowerCase().includes(search.toLowerCase());

    const matchesHostel = hostelFilter === "all" || r.hostel_floors?.hostel_blocks?.hostels?.id === hostelFilter;
    const matchesStatus = statusFilter === "all" || r.computed_status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCondition = conditionFilter === "all" || (r.condition || "Good").toLowerCase() === conditionFilter.toLowerCase();

    return matchesSearch && matchesHostel && matchesStatus && matchesCondition;
  });

  async function handleConditionUpdate() {
    if (!selectedRoom) return;
    setSubmitting(true);
    const res = await updateRoomCondition(selectedRoom.id, newCondition);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Room ${selectedRoom.room_number} condition updated to "${newCondition}"`);
      setEditOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search Room Number or Hostel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={hostelFilter} onValueChange={(val: any) => setHostelFilter(val || "")}>
              <SelectTrigger><SelectValue placeholder="All Hostels" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hostels</SelectItem>
                {hostels.map((h) => (
                  <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val || "")}>
              <SelectTrigger><SelectValue placeholder="All Room Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="partially occupied">Partially Occupied</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={conditionFilter} onValueChange={(val: any) => setConditionFilter(val || "")}>
              <SelectTrigger><SelectValue placeholder="All Conditions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="needs maintenance">Needs Maintenance</SelectItem>
                <SelectItem value="under maintenance">Under Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Room Grid */}
      {filteredRooms.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground space-y-2">
            <Building2 className="w-10 h-10 mx-auto opacity-30" />
            <p className="font-semibold">No rooms match the selected filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            const isFull = room.computed_status === "Full";
            const isMaintenance = room.computed_status === "Maintenance" || room.condition === "Under Maintenance";

            return (
              <Card key={room.id} className="border hover:border-primary/40 transition-all flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        Room {room.room_number}
                        <Badge variant="outline" className="text-xs font-normal">
                          Floor {room.floor_number}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {room.hostel_name} · {room.block_name}
                      </CardDescription>
                    </div>
                    <Badge className={
                      isMaintenance ? "bg-rose-100 text-rose-700 border-rose-200" :
                      isFull ? "bg-indigo-100 text-indigo-700 border-indigo-200" :
                      room.computed_status === "Partially Occupied" ? "bg-amber-100 text-amber-700 border-amber-200" :
                      "bg-emerald-100 text-emerald-700 border-emerald-200"
                    }>
                      {room.computed_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-lg bg-muted/50 text-xs">
                    <div>
                      <p className="text-muted-foreground">Capacity</p>
                      <p className="font-bold text-sm text-foreground">{room.capacity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Occupied</p>
                      <p className="font-bold text-sm text-indigo-600">{room.occupied_beds_count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Available</p>
                      <p className="font-bold text-sm text-emerald-600">{room.available_beds_count}</p>
                    </div>
                  </div>

                  {/* Bed Occupants List */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-semibold text-muted-foreground">Beds Overview:</p>
                    {(room.hostel_beds || []).map((bed: any) => (
                      <div key={bed.id} className="flex items-center justify-between text-xs p-1.5 rounded border bg-card">
                        <span className="font-medium">Bed {bed.bed_number}</span>
                        {bed.status === "occupied" && bed.profiles ? (
                          <span className="text-foreground font-semibold truncate max-w-[140px]">
                            {bed.profiles.full_name} ({bed.profiles.roll_number || "STU"})
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium capitalize">{bed.status}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <span className="text-muted-foreground">Condition: <strong className="text-foreground">{room.condition || "Good"}</strong></span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setSelectedRoom(room);
                        setNewCondition(room.condition || "Good");
                        setEditOpen(true);
                      }}
                    >
                      <Wrench className="w-3 h-3" /> Update Condition
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Condition Update Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Room Condition</DialogTitle>
            <DialogDescription>Change condition status for Room {selectedRoom?.room_number}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Select value={newCondition} onValueChange={(val: any) => setNewCondition(val || "")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Needs Maintenance">Needs Maintenance</SelectItem>
                <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleConditionUpdate} disabled={submitting}>
              {submitting ? "Updating..." : "Save Condition"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
