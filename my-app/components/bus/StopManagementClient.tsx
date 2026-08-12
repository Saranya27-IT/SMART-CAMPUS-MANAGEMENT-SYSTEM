"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Plus, Edit2, Trash2, Search, ShieldAlert, Clock } from "lucide-react";
import { createStop, updateStop, deleteStop } from "@/lib/actions/bus";
import { toast } from "sonner";

type Props = {
  stops: any[];
  routes: any[];
};

export function StopManagementClient({ stops: initialStops, routes }: Props) {
  const [stops, setStops] = useState(initialStops);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || "all");
  const [search, setSearch] = useState("");

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<any>(null);

  const [routeId, setRouteId] = useState(routes[0]?.id || "");
  const [name, setName] = useState("");
  const [seqNumber, setSeqNumber] = useState("1");
  const [arrivalTime, setArrivalTime] = useState("07:30 AM");
  const [deptTime, setDeptTime] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetStop, setTargetStop] = useState<any>(null);

  const filteredStops = stops.filter((s) => {
    const matchesRoute = selectedRouteId === "all" || s.route_id === selectedRouteId;
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.address?.toLowerCase().includes(search.toLowerCase());
    return matchesRoute && matchesSearch;
  });

  function openCreateModal() {
    setEditingStop(null);
    setRouteId(selectedRouteId !== "all" ? selectedRouteId : routes[0]?.id || "");
    setName("");
    const maxSeq = filteredStops.reduce((max, s) => Math.max(max, s.sequence_number || s.stop_order || 0), 0);
    setSeqNumber(String(maxSeq + 1));
    setArrivalTime("07:30 AM");
    setDeptTime("");
    setAddress("");
    setModalOpen(true);
  }

  function openEditModal(stop: any) {
    setEditingStop(stop);
    setRouteId(stop.route_id || routes[0]?.id || "");
    setName(stop.name || "");
    setSeqNumber(String(stop.sequence_number || stop.stop_order || 1));
    setArrivalTime(stop.expected_arrival_time || "07:30 AM");
    setDeptTime(stop.expected_departure_time || "");
    setAddress(stop.address || "");
    setModalOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const formData = {
      route_id: routeId,
      name,
      sequence_number: parseInt(seqNumber) || 1,
      expected_arrival_time: arrivalTime,
      expected_departure_time: deptTime || undefined,
      address: address || undefined,
    };

    let res;
    if (editingStop) {
      res = await updateStop(editingStop.id, formData);
    } else {
      res = await createStop(formData);
    }

    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(editingStop ? "Bus stop updated successfully." : "Bus stop added successfully.");
      setModalOpen(false);
      window.location.reload();
    }
  }

  async function handleConfirmDelete() {
    if (!targetStop) return;
    setSubmitting(true);
    const res = await deleteStop(targetStop.id);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Bus stop deleted.");
      setDeleteOpen(false);
      setTargetStop(null);
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="space-y-1.5 w-full sm:w-64">
              <Select value={selectedRouteId} onValueChange={(val: any) => setSelectedRouteId(val || "all")}>
                <SelectTrigger><SelectValue placeholder="Select Route" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  {routes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Stop Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Button onClick={openCreateModal} className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Add Bus Stop
          </Button>
        </CardContent>
      </Card>

      {/* Stops Feed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Bus Stops Sequence ({filteredStops.length})</CardTitle>
          <CardDescription>Official route stops, sequence order, and arrival timings</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStops.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No bus stops found for selected route.</p>
          ) : (
            <div className="space-y-3">
              {filteredStops.map((stop) => (
                <div key={stop.id} className="p-4 rounded-xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl gradient-primary text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                      #{stop.sequence_number || stop.stop_order}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{stop.name}</h4>
                        <Badge variant="outline" className="text-[10px]">{stop.bus_routes?.name || "Route"}</Badge>
                      </div>
                      {stop.address && <p className="text-xs text-muted-foreground mt-0.5">{stop.address}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                        <span>Arrival: {stop.expected_arrival_time}</span>
                      </div>
                      {stop.expected_departure_time && (
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200">
                          <span>Depart: {stop.expected_departure_time}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditModal(stop)} title="Edit Stop">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => { setTargetStop(stop); setDeleteOpen(true); }}
                        title="Delete Stop"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Stop Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingStop ? "Edit Bus Stop" : "Add Bus Stop"}</DialogTitle>
            <DialogDescription>Set stop name, sequence number, and expected arrival time.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Route *</Label>
              <Select value={routeId} onValueChange={(val: any) => setRouteId(val || "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {routes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Stop Name *</Label>
                <Input placeholder="e.g. Kondalampatti Bypass" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Sequence Number *</Label>
                <Input type="number" min={1} value={seqNumber} onChange={(e) => setSeqNumber(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Expected Arrival Time *</Label>
                <Input placeholder="e.g. 07:15 AM" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Expected Departure Time</Label>
                <Input placeholder="e.g. 07:20 AM" value={deptTime} onChange={(e) => setDeptTime(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Location / Address Landmark</Label>
              <Input placeholder="e.g. Junction Flyover Stand" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Stop"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Confirm Stop Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete stop <strong>{targetStop?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete Stop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
