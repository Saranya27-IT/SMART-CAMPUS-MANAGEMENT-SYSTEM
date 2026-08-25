"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Printer, CheckCircle2, QrCode, Sparkles } from "lucide-react";
import { format } from "date-fns";

interface CertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: {
    id: string;
    ticket_code?: string;
    attended_at?: string;
    registered_at?: string;
    events?: {
      title: string;
      start_time: string;
      end_time?: string;
      venue?: string;
    };
  } | null;
  recipientName: string;
  recipientId?: string;
  department?: string;
}

export function CertificateViewModal({
  open,
  onOpenChange,
  certificate,
  recipientName,
  recipientId,
  department,
}: CertificateModalProps) {
  if (!certificate) return null;

  const eventTitle = certificate.events?.title || "Campus Event";
  const eventDate = certificate.events?.start_time
    ? format(new Date(certificate.events.start_time), "MMMM d, yyyy")
    : format(new Date(), "MMMM d, yyyy");
  const issueDate = certificate.attended_at
    ? format(new Date(certificate.attended_at), "MMMM d, yyyy")
    : eventDate;
  const certId = certificate.ticket_code || `SCMS-${certificate.id.slice(0, 8).toUpperCase()}`;

  function handlePrint() {
    window.print();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between no-print">
          <div>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Verified Event Certificate
            </DialogTitle>
            <p className="text-xs text-muted-foreground">Digital Certificate of Attendance & Completion</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="h-4 w-4" />
              Print / Save as PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Certificate Printable Canvas */}
        <div className="p-6 md:p-10 bg-gradient-to-br from-amber-500/5 via-primary/5 to-slate-50 dark:from-slate-900 dark:to-slate-950 print:p-0 print:bg-white">
          <div
            id="printable-certificate"
            className="relative border-8 border-double border-amber-600/60 dark:border-amber-500/40 bg-card rounded-2xl p-8 md:p-12 shadow-2xl text-center space-y-6 print:border-8 print:shadow-none print:m-0"
          >
            {/* Header / Insignia */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-primary text-white flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="text-xs uppercase tracking-[0.25em] font-extrabold text-amber-700 dark:text-amber-400">
                Smart Campus Management System
              </p>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground tracking-wide">
                Certificate of Participation
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />
            </div>

            {/* Recipient Statement */}
            <div className="space-y-3 py-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                This is proudly presented to
              </p>
              <h2 className="text-2xl md:text-4xl font-bold font-serif text-primary tracking-tight">
                {recipientName}
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                {recipientId && `ID: ${recipientId}`} {department && ` · Department of ${department}`}
              </p>
            </div>

            {/* Event Description */}
            <div className="max-w-xl mx-auto space-y-2 text-sm text-foreground/80 leading-relaxed">
              <p>
                for active participation and successful completion of the campus event
              </p>
              <p className="text-lg md:text-xl font-semibold text-foreground font-sans bg-muted/40 py-2 px-4 rounded-lg border">
                "{eventTitle}"
              </p>
              <p className="text-xs text-muted-foreground">
                Conducted on <strong>{eventDate}</strong> {certificate.events?.venue && `at ${certificate.events.venue}`}.
              </p>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-6 grid grid-cols-3 items-end border-t border-border">
              <div className="text-left space-y-1">
                <p className="font-serif font-bold text-sm text-foreground">Dr. Robert Vance</p>
                <div className="w-28 h-0.5 bg-foreground/40" />
                <p className="text-[11px] text-muted-foreground">Dean of Student Affairs</p>
              </div>

              {/* QR Verification Seal */}
              <div className="flex flex-col items-center space-y-1">
                <div className="p-2 bg-white rounded-lg border shadow-sm">
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> VERIFIED
                </Badge>
                <p className="text-[10px] font-mono text-muted-foreground">{certId}</p>
              </div>

              <div className="text-right space-y-1">
                <p className="font-serif font-bold text-sm text-foreground">Prof. Sarah Jenkins</p>
                <div className="w-28 h-0.5 bg-foreground/40 ml-auto" />
                <p className="text-[11px] text-muted-foreground">Chief Event Organizer</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
