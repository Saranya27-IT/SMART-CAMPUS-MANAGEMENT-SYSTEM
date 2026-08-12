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
import { AlertCircle, Plus, Search, CheckCircle2, Clock } from "lucide-react";
import { createMessComplaint, updateMessComplaintStatus } from "@/lib/actions/mess";
import { toast } from "sonner";
import { format } from "date-fns";

type Props = {
  complaints: any[];
  isManager: boolean;
};

export function MessComplaintsClient({ complaints, isManager }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Manager Update Status Modal
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("resolved");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Student New Complaint Modal
  const [newOpen, setNewOpen] = useState(false);
  const [mealDate, setMealDate] = useState(new Date().toISOString().split("T")[0]);
  const [mealType, setMealType] = useState("lunch");
  const [category, setCategory] = useState("quality");
  const [description, setDescription] = useState("");

  const filteredComplaints = complaints.filter((c) => {
    const q = search.toLowerCase();
    const studentName = c.profiles?.full_name?.toLowerCase() || "";
    const desc = (c.description || "").toLowerCase();
    const cat = (c.category || "").toLowerCase();

    const matchesSearch = studentName.includes(q) || desc.includes(q) || cat.includes(q);
    const matchesStatus = statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === "all" || c.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  async function handleUpdateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSubmitting(true);
    const res = await updateMessComplaintStatus(selectedComplaint.id, newStatus, remarks);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Complaint status updated to "${newStatus.replace("_", " ")}"`);
      setUpdateOpen(false);
      setSelectedComplaint(null);
      setRemarks("");
    }
  }

  async function handleNewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description || description.trim().length < 10) {
      toast.error("Description must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    const res = await createMessComplaint(description, category, mealDate, mealType);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Mess food complaint submitted.");
      setNewOpen(false);
      setDescription("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search Student, Description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val || "")}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open / Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(val: any) => setCategoryFilter(val || "")}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="quality">Quality & Taste</SelectItem>
                <SelectItem value="hygiene">Hygiene</SelectItem>
                <SelectItem value="quantity">Quantity</SelectItem>
                <SelectItem value="service">Service Delay</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isManager && (
            <Button onClick={() => setNewOpen(true)} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Raise Food Complaint
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Complaints Feed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Food & Service Complaints ({filteredComplaints.length})</CardTitle>
          <CardDescription>Reported meal issues and manager resolution notes</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredComplaints.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No food complaints found matching filters.</p>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border bg-card space-y-2 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{c.profiles?.full_name || "Student"}</span>
                      <span className="text-xs text-muted-foreground font-mono">({c.profiles?.roll_number || "STU"})</span>
                      <Badge variant="outline" className="capitalize text-xs">{c.category}</Badge>
                      {c.meal_type && <Badge variant="secondary" className="capitalize text-[10px]">{c.meal_type}</Badge>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={
                        c.status === "resolved" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        c.status === "in_progress" ? "bg-blue-100 text-blue-700 border-blue-200" :
                        "bg-amber-100 text-amber-700 border-amber-200"
                      }>
                        {c.status.replace("_", " ").toUpperCase()}
                      </Badge>

                      {isManager && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => {
                            setSelectedComplaint(c);
                            setNewStatus(c.status || "resolved");
                            setRemarks(c.resolution_remarks || "");
                            setUpdateOpen(true);
                          }}
                        >
                          Update Status
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-foreground leading-relaxed">{c.description}</p>

                  {c.resolution_remarks && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-200">
                      <strong>Resolution Remarks:</strong> {c.resolution_remarks}
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground">
                    Submitted on {format(new Date(c.created_at), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manager Status Update Modal */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
            <DialogDescription>Change complaint status and enter resolution notes for student.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select value={newStatus} onValueChange={(val: any) => setNewStatus(val || "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open / Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed / Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Resolution Remarks</Label>
              <Textarea
                placeholder="State action taken or resolution notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setUpdateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Save Status"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student New Complaint Modal */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Submit Food Complaint</DialogTitle>
            <DialogDescription>Report quality, hygiene, or catering issues.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Meal Date *</Label>
                <Input type="date" value={mealDate} onChange={(e) => setMealDate(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Meal Type *</Label>
                <Select value={mealType} onValueChange={(val: any) => setMealType(val || "")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="snacks">Evening Snacks</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={category} onValueChange={(val: any) => setCategory(val || "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">Quality & Taste</SelectItem>
                  <SelectItem value="hygiene">Hygiene & Cleanliness</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="service">Service Delay</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Description * (min 10 chars)</Label>
              <Textarea
                placeholder="Describe the complaint in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
