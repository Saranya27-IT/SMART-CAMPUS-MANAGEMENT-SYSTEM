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
import { MapPin, Plus, Edit2, Trash2, Search, ShieldAlert, Route as RouteIcon, Navigation } from "lucide-react";
import { createRoute, updateRoute, deleteRoute } from "@/lib/actions/bus";
import { toast } from "sonner";

type Props = {
  routes: any[];
};

export function RouteManagementClient({ routes: initialRoutes }: Props) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [search, setSearch] = useState("");

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);

  const [name, setName] = useState("");
  const [startArea, setStartArea] = useState("");
  const [destination, setDestination] = useState("");
  const [college, setCollege] = useState("K.S.R. College");
  const [status, setStatus] = useState("ACTIVE");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetRoute, setTargetRoute] = useState<any>(null);

  const filteredRoutes = routes.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.starting_area?.toLowerCase().includes(search.toLowerCase()) ||
      r.destination?.toLowerCase().includes(search.toLowerCase())
  );

  function openCreateModal() {
    setEditingRoute(null);
    setName("");
    setStartArea("");
    setDestination("");
    setCollege("K.S.R. College");
    setStatus("ACTIVE");
    setDescription("");
    setModalOpen(true);
  }

  function openEditModal(r: any) {
    setEditingRoute(r);
    setName(r.name || "");
    setStartArea(r.starting_area || "");
    setDestination(r.destination || "");
    setCollege(r.college || "K.S.R. College");
    setStatus(r.status || (r.is_active ? "ACTIVE" : "INACTIVE"));
    setDescription(r.description || "");
    setModalOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const formData = {
      name,
      starting_area: startArea,
      destination,
      college,
      status,
      description: description || undefined,
    };

    let res;
    if (editingRoute) {
      res = await updateRoute(editingRoute.id, formData);
    } else {
      res = await createRoute(formData);
    }

    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(editingRoute ? "Route updated successfully." : "New route created successfully.");
      setModalOpen(false);
      window.location.reload();
    }
  }

  async function handleConfirmDelete() {
    if (!targetRoute) return;
    setSubmitting(true);
    const res = await deleteRoute(targetRoute.id);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Route record deleted.");
      setDeleteOpen(false);
      setTargetRoute(null);
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Add Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Route, Starting Area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button onClick={openCreateModal} className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Create New Route
          </Button>
        </CardContent>
      </Card>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoutes.map((route) => (
          <Card key={route.id} className="hover:border-primary/40 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className={
                  route.status === "ACTIVE" || route.is_active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-700"
                }>
                  {route.status || (route.is_active ? "ACTIVE" : "INACTIVE")}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditModal(route)} title="Edit Route">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    onClick={() => { setTargetRoute(route); setDeleteOpen(true); }}
                    title="Delete Route"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2 mt-2">
                <RouteIcon className="w-5 h-5 text-emerald-600" /> {route.name}
              </CardTitle>
              <CardDescription className="text-xs">
                {route.college || "K.S.R. College"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="truncate">Start: {route.starting_area || "City"}</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="truncate">Dest: {route.destination || "College"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-muted-foreground pt-1">
                <span>Configured Stops: <strong>{route.stops_count} stops</strong></span>
                <span>Active Buses: <strong>{route.buses_count} buses</strong></span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add / Edit Route Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingRoute ? "Edit Route Details" : "Create New Route"}</DialogTitle>
            <DialogDescription>Define starting location, destination campus, and active status.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Route Name *</Label>
              <Input placeholder="e.g. Salem - College Express" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Starting Area *</Label>
                <Input placeholder="e.g. Salem New Bus Stand" value={startArea} onChange={(e) => setStartArea(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Destination *</Label>
                <Input placeholder="e.g. K.S.R. College Campus" value={destination} onChange={(e) => setDestination(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>College / Institution</Label>
                <Input placeholder="e.g. K.S.R. College" value={college} onChange={(e) => setCollege(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Status *</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val || "ACTIVE")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description / Route Summary</Label>
              <Textarea placeholder="Details on coverage areas and major stops..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Route"}
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
              <ShieldAlert className="w-5 h-5" /> Confirm Route Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete route <strong>{targetRoute?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete Route"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
