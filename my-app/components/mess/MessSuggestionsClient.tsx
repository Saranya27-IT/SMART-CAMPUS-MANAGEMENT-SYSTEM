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
import { Lightbulb, Plus, Search, CheckCircle2 } from "lucide-react";
import { submitMessSuggestion, updateSuggestionStatus } from "@/lib/actions/mess";
import { toast } from "sonner";
import { format } from "date-fns";

type Props = {
  suggestions: any[];
  isManager: boolean;
};

export function MessSuggestionsClient({ suggestions, isManager }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Manager update modal
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("reviewed");
  const [submitting, setSubmitting] = useState(false);

  // Student new suggestion modal
  const [newOpen, setNewOpen] = useState(false);
  const [suggestionText, setSuggestionText] = useState("");

  const filtered = suggestions.filter((s) => {
    const q = search.toLowerCase();
    const nameMatch = (s.profiles?.full_name || "").toLowerCase().includes(q);
    const textMatch = (s.suggestion || "").toLowerCase().includes(q);

    const matchesSearch = nameMatch || textMatch;
    const matchesStatus = statusFilter === "all" || s.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  async function handleUpdateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSuggestion) return;

    setSubmitting(true);
    const res = await updateSuggestionStatus(selectedSuggestion.id, newStatus);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Suggestion status updated to "${newStatus}"`);
      setUpdateOpen(false);
      setSelectedSuggestion(null);
    }
  }

  async function handleNewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!suggestionText || suggestionText.trim().length < 5) {
      toast.error("Suggestion must be at least 5 characters.");
      return;
    }

    setSubmitting(true);
    const res = await submitMessSuggestion(suggestionText);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Food suggestion submitted to Mess Manager.");
      setNewOpen(false);
      setSuggestionText("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search Student, Suggestion..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val || "")}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="implemented">Implemented</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isManager && (
            <Button onClick={() => setNewOpen(true)} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Submit Dish Suggestion
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Suggestions Feed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Student Food Suggestions ({filtered.length})</CardTitle>
          <CardDescription>Menu improvements and new dish suggestions from students</CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No suggestions found matching filters.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((s) => (
                <div key={s.id} className="p-4 rounded-xl border bg-card space-y-2 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-sm text-foreground">{s.profiles?.full_name || "Student"}</span>
                      <span className="text-xs text-muted-foreground font-mono">({s.profiles?.roll_number || "STU"})</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(s.created_at), "dd MMM yyyy")}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={
                        s.status === "implemented" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        s.status === "reviewed" ? "bg-blue-100 text-blue-700 border-blue-200" :
                        s.status === "rejected" ? "bg-rose-100 text-rose-700 border-rose-200" :
                        "bg-amber-100 text-amber-700 border-amber-200"
                      }>
                        {s.status.toUpperCase()}
                      </Badge>

                      {isManager && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => {
                            setSelectedSuggestion(s);
                            setNewStatus(s.status || "reviewed");
                            setUpdateOpen(true);
                          }}
                        >
                          Update Status
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-foreground leading-relaxed">{s.suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manager Status Update Modal */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Suggestion Status</DialogTitle>
            <DialogDescription>Mark progress for student food suggestion.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select value={newStatus} onValueChange={(val: any) => setNewStatus(val || "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="implemented">Implemented in Menu</SelectItem>
                  <SelectItem value="rejected">Not Feasible / Rejected</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Student New Suggestion Modal */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Submit Food Suggestion</DialogTitle>
            <DialogDescription>Suggest a new dish or menu improvement to Mess Manager.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Suggestion Details * (min 5 chars)</Label>
              <Textarea
                placeholder="Describe your dish suggestion or food quality recommendation..."
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
                required
                rows={4}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Suggestion"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
