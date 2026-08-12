"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { registerForEvent, unregisterFromEvent } from "@/lib/actions/events";
import { toast } from "sonner";
import { Loader2, QrCode, CheckCircle2, UserMinus, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventDetailActionsProps {
  eventId: string;
  isRegistered: boolean;
  isPast: boolean;
  isOngoing: boolean;
  isFull: boolean;
  deadlinePassed: boolean;
  isOrganizer: boolean;
  myQrCode: string | null;
  myAttended: boolean;
  myCertificateIssued: boolean;
}

export function EventDetailActions({
  eventId,
  isRegistered,
  isPast,
  isOngoing,
  isFull,
  deadlinePassed,
  isOrganizer,
  myQrCode,
  myAttended,
}: EventDetailActionsProps) {
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(isRegistered);
  const [qrCode, setQrCode] = useState(myQrCode);

  async function handleRegister() {
    setLoading(true);
    const result = await registerForEvent(eventId);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Successfully registered! Your QR code is ready.");
      setRegistered(true);
      setQrCode(result.data?.qr_code ?? null);
    }
  }

  async function handleUnregister() {
    if (!confirm("Are you sure you want to cancel your registration?")) return;
    setLoading(false);
    const result = await unregisterFromEvent(eventId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Registration cancelled.");
      setRegistered(false);
      setQrCode(null);
    }
  }

  // Organizer doesn't register
  if (isOrganizer) {
    return (
      <div className="text-center py-2">
        <p className="text-xs text-muted-foreground">You are organizing this event</p>
      </div>
    );
  }

  if (myAttended) {
    return (
      <div className="text-center space-y-2">
        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
        <p className="text-sm font-semibold text-emerald-700">Attended ✓</p>
        <p className="text-xs text-muted-foreground">You have been checked in</p>
      </div>
    );
  }

  if (isPast) {
    return (
      <div className="text-center py-2">
        <p className="text-sm text-muted-foreground">This event has ended</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {registered ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm font-medium">You are registered</p>
          </div>

          {/* QR Code display */}
          {qrCode && (
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 text-center space-y-2">
              <QrCode className="h-6 w-6 text-primary mx-auto" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Ticket Code</p>
              <div className="bg-muted rounded-lg p-2">
                <p className="text-xs font-mono text-foreground break-all select-all">{qrCode}</p>
              </div>
              <p className="text-xs text-muted-foreground">Show this code at the event entrance</p>
            </div>
          )}

          {!deadlinePassed && !isOngoing && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
              onClick={handleUnregister}
              disabled={loading}
              id="unregister-event-btn"
            >
              {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <UserMinus className="mr-2 h-3.5 w-3.5" />}
              Cancel Registration
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {(isFull || deadlinePassed) ? (
            <div className="text-center py-2">
              <p className="text-sm font-medium text-rose-600">
                {isFull ? "Event is full" : "Registration closed"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isFull ? "No spots available" : "Deadline has passed"}
              </p>
            </div>
          ) : (
            <Button
              className="w-full gradient-primary text-white border-0 hover:opacity-90"
              onClick={handleRegister}
              disabled={loading}
              id="register-event-btn"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Register for Event
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
