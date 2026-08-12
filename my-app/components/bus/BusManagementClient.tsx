"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Bus, Plus, Edit2, Trash2, UserPlus, Search, ShieldAlert, CheckCircle2 } from "lucide-react";
import { createBus, updateBus, deleteBus, allocateDriver } from "@/lib/actions/bus";
import { toast } from "sonner";

type Props = {
  buses: any[];
  routes: any[];
  drivers: any[];
};

export function BusManagementClient({ buses: initialBuses, routes, drivers }: Props) {
  const [buses, setBuses] = useState(initialBuses);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<any>(null);

  // Form Fields
  const [busNumber, setBusNumber] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [capacity, setCapacity] = useState("40");
  const [status, setStatus] = useState("ACTIVE");
  const [driverId, setDriverId] = useState("none");
  const [routeId, setRouteId] = useState("none");
  const [startArea, setStartArea] = useState("");
  const [destination, setDestination] = useState("");
  const [model, setModel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete & Driver Allocate Dialogs
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetBus, setTargetBus] = useState<any>(null);

  const [driverOpen, setDriverOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState("none");

  // Filter buses
  const filteredBuses = buses.filter((b) => {
    const matchesSearch =
      b.bus_number?.toLowerCase().includes(search.toLowerCase()) ||
      b.registration_number?.toLowerCase().includes(search.toLowerCase()) ||
      b.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.route_name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function openCreateModal() {
    setEditingBus(null);
    setBusNumber("");
    setRegNumber("");
    setCapacity("40");
    setStatus("ACTIVE");
    setDriverId("none");
    setRouteId("none");
    setStartArea("");
    setDestination("");
    setModel("");
    setModalOpen(true);
  }

  function openEditModal(bus: any) {
    setEditingBus(bus);
    setBusNumber(bus.bus_number || "");
    setRegNumber(bus.registration_number || "");
    setCapacity(String(bus.capacity || 40));
    setStatus(bus.status || "ACTIVE");
    setDriverId(bus.driver_id || "none");
    setRouteId(bus.route_id || "none");
    setStartArea(bus.starting_area || "");
    setDestination(bus.destination || "");
    setModel(bus.model || "");
    setModalOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const formData = {
      bus_number: busNumber,
      registration_number: regNumber,
      capacity: parseInt(capacity) || 40,
      status,
      driver_id: driverId === "none" ? null : driverId,
      route_id: routeId === "none" ? null : routeId,
      starting_area: startArea || undefined,
      destination: destination || undefined,
      model: model || undefined,
    };

    let res;
    if (editingBus) {
      res = await updateBus(editingBus.id, formData);
    } else {
      res = await createBus(formData);
    }

    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(editingBus ? "Bus updated successfully." : "New bus created successfully.");
      setModalOpen(false);
      window.location.reload();
    }
  }

  async function handleConfirmDelete() {
    if (!targetBus) return;
    setSubmitting(true);
    const res = await deleteBus(targetBus.id);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Bus record deleted.");
      setDeleteOpen(false);
      setTargetBus(null);
      window.location.reload();
    }
  }

  async function handleDriverAllocation() {
    if (!targetBus) return;
    setSubmitting(true);
    const dId = selectedDriver === "none" ? null : selectedDriver;
    const res = await allocateDriver(targetBus.id, dId);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Driver assignment updated.");
      setDriverOpen(false);
      setTargetBus(null);
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
                placeholder="Search Bus, Reg No, Driver..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val || "all")}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Filter Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="BREAKDOWN">Breakdown</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={openCreateModal} className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Add New Bus
          </Button>
        </CardContent>
      </Card>

      {/* Buses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuses.map((bus) => (
          <Card key={bus.id} className="hover:border-primary/40 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className={
                  bus.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                  bus.status === "MAINTENANCE" ? "bg-amber-100 text-amber-700 border-amber-200" :
                  bus.status === "BREAKDOWN" ? "bg-rose-100 text-rose-700 border-rose-200" :
                  "bg-gray-100 text-gray-700 border-gray-200"
                }>
                  {bus.status}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditModal(bus)} title="Edit Bus">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    onClick={() => { setTargetBus(bus); setDeleteOpen(true); }}
                    title="Delete Bus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-xl font-black text-foreground flex items-center gap-2 mt-2">
                <Bus className="w-5 h-5 text-primary" /> {bus.bus_number}
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Reg No: {bus.registration_number || "N/A"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver:</span>
                  <span className="font-bold text-foreground">{bus.driver_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Route:</span>
                  <span className="font-bold text-foreground truncate max-w-[160px]">{bus.route_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity & Utilization:</span>
                  <span className="font-bold text-foreground">{bus.assigned_count} / {bus.capacity} seats</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs gap-1.5"
                  onClick={() => {
                    setTargetBus(bus);
                    setSelectedDriver(bus.driver_id || "none");
                    setDriverOpen(true);
                  }}
                >
                  <UserPlus className="w-3.5 h-3.5" /> Allocate Driver
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add / Edit Bus Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingBus ? "Edit Bus Details" : "Create New Bus"}</DialogTitle>
            <DialogDescription>Configure vehicle number, capacity, driver, and route assignment.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Bus Number *</Label>
                <Input placeholder="e.g. BUS-12" value={busNumber} onChange={(e) => setBusNumber(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Registration Number *</Label>
                <Input placeholder="e.g. TN-30-AZ-1234" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Seating Capacity *</Label>
                <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Status *</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val || "ACTIVE")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                    <SelectItem value="BREAKDOWN">BREAKDOWN</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Assigned Driver</Label>
                <Select value={driverId} onValueChange={(val: any) => setDriverId(val || "none")}>
                  <SelectTrigger><SelectValue placeholder="Select Driver" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {drivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.full_name} ({d.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Assigned Route</Label>
                <Select value={routeId} onValueChange={(val: any) => setRouteId(val || "none")}>
                  <SelectTrigger><SelectValue placeholder="Select Route" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {routes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Starting Area</Label>
                <Input placeholder="e.g.Trichy New Bus Stand" value={startArea} onChange={(e) => setStartArea(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Destination</Label>
                <Input placeholder="e.g. A.B.C. College Campus" value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Bus Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Driver Allocation Dialog */}
      <Dialog open={driverOpen} onOpenChange={setDriverOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Allocate Driver to {targetBus?.bus_number}</DialogTitle>
            <DialogDescription>Assign a transport driver to manage this vehicle.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Select Driver</Label>
            <Select value={selectedDriver} onValueChange={(val: any) => setSelectedDriver(val || "none")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Driver (Unassigned)</SelectItem>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.full_name} ({d.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDriverOpen(false)}>Cancel</Button>
            <Button onClick={handleDriverAllocation} disabled={submitting}>
              {submitting ? "Allocating..." : "Assign Driver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Confirm Bus Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete bus <strong>{targetBus?.bus_number}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete Bus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
