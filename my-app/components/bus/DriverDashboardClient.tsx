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
import { Bus, MapPin, Clock, AlertTriangle, Play, CheckCircle, Navigation, ShieldAlert, FileText } from "lucide-react";
import { updateTripStatus, createBusComplaint } from "@/lib/actions/bus";
import { toast } from "sonner";

type Props = {
  bus: any;
  route: any;
  stops: any[];
  activeTrip: any;
};

export function DriverDashboardClient({ bus, route, stops, activeTrip: initialTrip }: Props) {
  const [activeTrip, setActiveTrip] = useState(initialTrip);
  const [currentStatus, setCurrentStatus] = useState(initialTrip?.status || "SCHEDULED");
  const [notesText, setNotesText] = useState(initialTrip?.notes || "");
  const [updatingTrip, setUpdatingTrip] = useState(false);

  // Complaint Modal State
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [category, setCategory] = useState("Breakdown");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  if (!bus) {
    return (
      <Card className="my-6 border-dashed">
        <CardContent className="p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
            <Bus className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">No Bus Assigned</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
              You are currently not allocated to any active shuttle bus.
              Please contact the Super Admin or Transport Administrator to get assigned.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  async function handleStatusChange(newStatus: string) {
    setUpdatingTrip(true);
    const res = await updateTripStatus(activeTrip?.id || null, bus.id, route?.id || bus.route_id, newStatus, notesText);
    setUpdatingTrip(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      setCurrentStatus(newStatus);
      toast.success(`Trip status updated to ${newStatus}.`);
      window.location.reload();
    }
  }

  async function handleComplaintSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Please fill in complaint title and description.");
      return;
    }

    setSubmittingComplaint(true);
    const res = await createBusComplaint({
      bus_id: bus.id,
      category,
      title,
      description,
    });
    setSubmittingComplaint(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Breakdown complaint submitted to Super Admin.");
      setComplaintOpen(false);
      setTitle("");
      setDescription("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">Assigned Vehicle</Badge>
              <Badge variant="outline" className="font-mono text-xs">{bus.registration_number || "TN-30-TEMP"}</Badge>
            </div>
            <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
              <Bus className="w-8 h-8 text-primary" /> {bus.bus_number}
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" /> Route: <strong>{route?.name || bus.starting_area || "Assigned Shuttle Route"}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button variant="destructive" onClick={() => setComplaintOpen(true)} className="gap-2 w-full sm:w-auto">
              <AlertTriangle className="w-4 h-4" /> Raise Bus Breakdown Complaint
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trip Status Control Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" /> Today's Shuttle Trip Status
              </CardTitle>
              <CardDescription className="text-xs">Update your live trip progress for students and administrators</CardDescription>
            </div>

            <Badge className={
              currentStatus === "COMPLETED" ? "bg-emerald-100 text-emerald-700 border-emerald-200 text-xs py-1" :
              currentStatus === "ON_ROUTE" || currentStatus === "STARTED" ? "bg-blue-100 text-blue-700 border-blue-200 text-xs py-1" :
              currentStatus === "DELAYED" ? "bg-amber-100 text-amber-700 border-amber-200 text-xs py-1" :
              "bg-gray-100 text-gray-700 border-gray-200 text-xs py-1"
            }>
              CURRENT TRIP STATUS: {currentStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant={currentStatus === "STARTED" ? "default" : "outline"}
              onClick={() => handleStatusChange("STARTED")}
              disabled={updatingTrip}
              className="gap-2"
            >
              <Play className="w-4 h-4" /> START TRIP
            </Button>

            <Button
              variant={currentStatus === "ON_ROUTE" ? "default" : "outline"}
              onClick={() => handleStatusChange("ON_ROUTE")}
              disabled={updatingTrip}
              className="gap-2"
            >
              <Navigation className="w-4 h-4" /> ON ROUTE
            </Button>

            <Button
              variant={currentStatus === "DELAYED" ? "secondary" : "outline"}
              onClick={() => handleStatusChange("DELAYED")}
              disabled={updatingTrip}
              className="gap-2 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40"
            >
              <Clock className="w-4 h-4" /> DELAYED
            </Button>

            <Button
              variant={currentStatus === "COMPLETED" ? "default" : "outline"}
              onClick={() => handleStatusChange("COMPLETED")}
              disabled={updatingTrip}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle className="w-4 h-4" /> COMPLETED
            </Button>
          </div>

          <div className="space-y-1.5 pt-2">
            <Label className="text-xs">Optional Trip Note / Delay Reason</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Traffic near Kondalampatti bypass, 10 min delay."
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
              />
              <Button size="sm" variant="secondary" onClick={() => handleStatusChange(currentStatus)} disabled={updatingTrip}>
                Save Note
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Official Route Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Official Route Schedule & Timings
          </CardTitle>
          <CardDescription className="text-xs">Stop sequence and expected arrival/departure schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stops.map((stop: any, idx: number) => (
              <div key={stop.id || idx} className="p-3 rounded-xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-muted font-bold text-xs flex items-center justify-center text-muted-foreground">
                    #{stop.sequence_number || stop.stop_order || idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{stop.name}</h4>
                    {stop.address && <p className="text-xs text-muted-foreground">{stop.address}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                    <span>Expected Arrival: {stop.expected_arrival_time}</span>
                  </div>
                  {stop.expected_departure_time && (
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200">
                      <span>Depart: {stop.expected_departure_time}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Driver Breakdown Complaint Modal */}
      <Dialog open={complaintOpen} onOpenChange={setComplaintOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Raise Bus Breakdown / Issue Complaint
            </DialogTitle>
            <DialogDescription>Report vehicle breakdown, engine problem, tyre failure, or accident.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleComplaintSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Bus Vehicle</Label>
              <Input value={`${bus.bus_number} (${bus.registration_number})`} disabled className="bg-muted font-bold" />
            </div>

            <div className="space-y-1.5">
              <Label>Issue Category *</Label>
              <Select value={category} onValueChange={(val: any) => setCategory(val || "Breakdown")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breakdown">Vehicle Breakdown</SelectItem>
                  <SelectItem value="Engine">Engine Issue</SelectItem>
                  <SelectItem value="Tyre">Tyre Puncture / Failure</SelectItem>
                  <SelectItem value="Brake">Brake Issue</SelectItem>
                  <SelectItem value="Electrical">Electrical Issue</SelectItem>
                  <SelectItem value="AC">AC / Ventilation</SelectItem>
                  <SelectItem value="Accident">Accident / Impact</SelectItem>
                  <SelectItem value="Other">Other Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Problem Title *</Label>
              <Input placeholder="e.g. Engine Overheating near Kondalampatti stop" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label>Detailed Description *</Label>
              <Textarea placeholder="Explain exact location, symptoms, and immediate assistance required..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setComplaintOpen(false)}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={submittingComplaint}>
                {submittingComplaint ? "Submitting..." : "Submit Complaint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
