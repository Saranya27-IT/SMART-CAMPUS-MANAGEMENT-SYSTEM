"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { createHall, updateHall, deleteHall } from "@/lib/actions/events";
import { toast } from "sonner";
import { Plus, Building2, Pencil, Trash2, Loader2, MapPin, Users, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const COMMON_FACILITIES = ["projector", "AC", "microphone", "stage", "sound_system", "whiteboard", "backstage", "video_conferencing", "large_screen"];

interface HallsClientProps {
  halls: any[];
}

interface HallForm {
  name: string;
  location: string;
  capacity: number;
  facilities: string[];
  is_active: boolean;
}

const EMPTY_FORM: HallForm = { name: "", location: "", capacity: 100, facilities: [], is_active: true };

export function HallsClient({ halls: initialHalls }: HallsClientProps) {
  const [halls, setHalls] = useState(initialHalls);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<any>(null);
  const [form, setForm] = useState<HallForm>(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditingHall(null);
    setForm(EMPTY_FORM);
    setSheetOpen(true);
  }

  function openEdit(hall: any) {
    setEditingHall(hall);
    setForm({
      name: hall.name,
      location: hall.location,
      capacity: hall.capacity,
      facilities: Array.isArray(hall.facilities) ? hall.facilities : [],
      is_active: hall.is_active,
    });
    setSheetOpen(true);
  }

  function toggleFacility(facility: string) {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Hall name is required."); return; }
    if (!form.location.trim()) { toast.error("Location is required."); return; }

    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      capacity: Number(form.capacity),
      facilities: form.facilities,
      is_active: form.is_active,
    };

    startTransition(async () => {
      const result = editingHall
        ? await updateHall(editingHall.id, payload)
        : await createHall(payload);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(editingHall ? "Hall updated." : "Hall created.");
        setSheetOpen(false);
        window.location.reload();
      }
    });
  }

  async function handleDelete(hall: any) {
    if (!confirm(`Delete "${hall.name}"? Events using this hall will lose the hall reference.`)) return;
    const result = await deleteHall(hall.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Hall deleted.");
      setHalls((prev) => prev.filter((h) => h.id !== hall.id));
    }
  }

  const columns = [
    {
      key: "name",
      header: "Hall",
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100">
            <Building2 className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-sm">{row.name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3" />
              <span>{row.location}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "capacity",
      header: "Capacity",
      cell: (row: any) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="tabular-nums">{row.capacity}</span>
        </div>
      ),
    },
    {
      key: "facilities",
      header: "Facilities",
      cell: (row: any) => {
        const facilities = Array.isArray(row.facilities) ? row.facilities : [];
        return (
          <div className="flex flex-wrap gap-1">
            {facilities.slice(0, 3).map((f: string) => (
              <Badge key={f} variant="outline" className="text-xs capitalize">
                {f.replace(/_/g, " ")}
              </Badge>
            ))}
            {facilities.length > 3 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{facilities.length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "is_active",
      header: "Status",
      cell: (row: any) => (
        row.is_active ? (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs gap-1">
            <CheckCircle className="h-3 w-3" /> Active
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs gap-1">
            <XCircle className="h-3 w-3" /> Inactive
          </Badge>
        )
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (row: any) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)} id={`edit-hall-${row.id}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
            onClick={() => handleDelete(row)}
            id={`delete-hall-${row.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={halls as any[]}
        columns={columns as never}
        searchable
        searchPlaceholder="Search halls..."
        searchKeys={["name", "location"] as never}
        pageSize={10}
        emptyTitle="No halls created"
        emptyDescription="Create event halls so organizers can assign venues to their events."
        rowKey={(row: any) => row.id}
        actions={
          <Button
            className="gradient-primary text-white border-0 hover:opacity-90"
            onClick={openCreate}
            id="create-hall-btn"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Hall
          </Button>
        }
      />

      {/* Hall Form Sheet */}
      <Sheet open={sheetOpen} onOpenChange={(v) => !v && setSheetOpen(false)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <SheetTitle>{editingHall ? "Edit Hall" : "Add New Hall"}</SheetTitle>
                <SheetDescription className="text-xs">
                  {editingHall ? "Update hall details." : "Create a new venue for campus events."}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="hall-name">Hall Name <span className="text-rose-500">*</span></Label>
              <Input id="hall-name" placeholder="e.g. Main Auditorium" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hall-location">Location <span className="text-rose-500">*</span></Label>
              <Input id="hall-location" placeholder="e.g. Academic Block A, Ground Floor" value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hall-capacity">Capacity</Label>
              <Input id="hall-capacity" type="number" min={1} value={form.capacity}
                onChange={(e) => setForm((p) => ({ ...p, capacity: Number(e.target.value) }))} disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Facilities</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_FACILITIES.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFacility(f)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all capitalize",
                      form.facilities.includes(f)
                        ? "bg-primary text-white border-primary"
                        : "bg-background border-border text-muted-foreground hover:border-primary hover:text-primary"
                    )}
                  >
                    {f.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hall-active"
                checked={form.is_active}
                onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                disabled={isPending}
                className="rounded"
              />
              <Label htmlFor="hall-active" className="cursor-pointer">Hall is active</Label>
            </div>

            <SheetFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setSheetOpen(false)} disabled={isPending}>Cancel</Button>
              <Button type="submit" className="gradient-primary text-white border-0 flex-1" disabled={isPending} id="hall-submit-btn">
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{editingHall ? "Saving..." : "Creating..."}</> : editingHall ? "Save Changes" : "Create Hall"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
