"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { QrCode, CheckCircle2, Loader2, AlertTriangle, User, Hash, Calendar } from "lucide-react";
import { toast } from "sonner";
import { checkInWithQR } from "@/lib/actions/events";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { EventsNav } from "@/components/events/EventsNav";

interface CheckInClientProps {
  events: any[];
  userRole?: string;
}

type CheckInResult =
  | { success: true; name: string; rollNumber: string | null; role: string; attendedAt: string }
  | { success: false; alreadyCheckedIn?: boolean; message: string; name?: string }
  | null;

export function CheckInClient({ events, userRole }: CheckInClientProps) {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? "");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult>(null);
  const [checkInCount, setCheckInCount] = useState(0);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEventId) { toast.error("Please select an event first."); return; }
    if (!qrCode.trim()) { toast.error("Please enter a QR/ticket code."); return; }

    setLoading(true);
    setResult(null);

    const res = await checkInWithQR(selectedEventId, qrCode.trim());
    setLoading(false);

    if (res.error) {
      if (res.alreadyCheckedIn && res.reg) {
        const p = res.reg.profiles;
        setResult({
          success: false,
          alreadyCheckedIn: true,
          message: "Already checked in",
          name: p?.full_name,
        });
        toast.warning("Participant already checked in.");
      } else {
        setResult({ success: false, message: res.error });
        toast.error(res.error);
      }
    } else {
      const p = res.data?.profiles;
      setResult({
        success: true,
        name: p?.full_name ?? "Unknown",
        rollNumber: p?.roll_number ?? null,
        role: p?.role ?? "student",
        attendedAt: new Date().toISOString(),
      });
      toast.success(`✓ ${p?.full_name ?? "Participant"} checked in!`);
      setCheckInCount((c) => c + 1);
    }

    setQrCode("");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Event QR Check-in"
        description="Scan participant QR codes or enter ticket codes to mark attendance."
        actions={
          checkInCount > 0 ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-sm px-3 py-1">
              {checkInCount} checked in this session
            </Badge>
          ) : undefined
        }
      />
      <EventsNav role={userRole} />

      {/* Event selector */}
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Select Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2 text-center">
              No active events available for check-in.
            </p>
          ) : (
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger id="checkin-event-select" className="w-full">
                <SelectValue placeholder="Select an event..." />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    <div className="flex items-center gap-2">
                      <span>{event.title}</span>
                      <Badge
                        variant="outline"
                        className={cn("text-xs capitalize ml-1",
                          event.status === "ongoing" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedEvent && (
            <div className="mt-3 p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground space-y-1">
              <p><span className="font-medium text-foreground">Venue:</span> {selectedEvent.venue}</p>
              <p><span className="font-medium text-foreground">Date:</span> {format(new Date(selectedEvent.start_time), "d MMM yyyy, h:mm a")}</p>
              <p><span className="font-medium text-foreground">Capacity:</span> {selectedEvent.capacity}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Input */}
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" />
            Scanner & Manual Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="qr-input">QR Code / Ticket Code</Label>
              <Input
                id="qr-input"
                placeholder="Paste QR code or scan with a barcode scanner..."
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                disabled={loading || events.length === 0}
                className="font-mono"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                The code is the UUID shown on the participant's ticket
              </p>
            </div>
            <Button
              type="submit"
              className="w-full gradient-primary text-white border-0 hover:opacity-90"
              disabled={loading || !qrCode.trim() || events.length === 0}
              id="checkin-submit-btn"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
              ) : (
                <><CheckCircle2 className="mr-2 h-4 w-4" /> Verify & Check In</>
              )}
            </Button>
          </form>

          {/* Result */}
          {result && (
            <div className={cn(
              "mt-5 p-4 rounded-xl border flex items-start gap-3 transition-all",
              result.success
                ? "bg-emerald-50 border-emerald-200"
                : result.alreadyCheckedIn
                ? "bg-amber-50 border-amber-200"
                : "bg-rose-50 border-rose-200"
            )}>
              {result.success ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : result.alreadyCheckedIn ? (
                <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                {result.success ? (
                  <>
                    <p className="font-semibold text-emerald-900 text-sm">✓ Check-in Successful!</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-800">
                        <User className="h-3.5 w-3.5" />
                        <span className="font-medium">{result.name}</span>
                      </div>
                      {result.rollNumber && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800">
                          <Hash className="h-3.5 w-3.5" />
                          <span>{result.rollNumber}</span>
                        </div>
                      )}
                      <p className="text-xs text-emerald-700/70 mt-1">
                        Checked in at {format(new Date(result.attendedAt), "h:mm:ss a")}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className={cn("font-semibold text-sm", result.alreadyCheckedIn ? "text-amber-900" : "text-rose-900")}>
                      {result.alreadyCheckedIn ? "Already Checked In" : "Check-in Failed"}
                    </p>
                    {result.name && <p className="text-xs mt-0.5 text-amber-800">{result.name}</p>}
                    <p className={cn("text-xs mt-0.5", result.alreadyCheckedIn ? "text-amber-700" : "text-rose-700")}>
                      {result.message}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
