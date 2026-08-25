"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, Eye, Calendar, MapPin, QrCode } from "lucide-react";
import { format } from "date-fns";
import { CertificateViewModal } from "./CertificateViewModal";

interface Props {
  certificates: any[];
  recipientName: string;
  recipientId?: string;
  department?: string;
}

export function EventCertificatesClient({
  certificates,
  recipientName,
  recipientId,
  department,
}: Props) {
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (!certificates || certificates.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center text-muted-foreground space-y-3">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Award className="h-8 w-8" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">No certificates earned yet</h3>
          <p className="text-sm max-w-sm mx-auto">
            Attend your registered campus events. Once attendance is verified via QR check-in, your digital certificate is automatically issued here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificates.map((cert) => {
          const event = cert.events;
          return (
            <Card key={cert.id} className="border bg-card hover:shadow-md transition-all">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                        ✓ Verified & Issued
                      </Badge>
                    </div>
                    <h4 className="font-bold text-base text-foreground truncate">
                      {event?.title || "Campus Event"}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {event?.start_time
                        ? format(new Date(event.start_time), "d MMM yyyy")
                        : "Event Date"}
                      {event?.venue && ` · ${event.venue}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs gap-1.5"
                    onClick={() => {
                      setSelectedCert(cert);
                      setModalOpen(true);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview Certificate
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gradient-primary text-white border-0 text-xs gap-1.5"
                    onClick={() => {
                      setSelectedCert(cert);
                      setModalOpen(true);
                      setTimeout(() => {
                        window.print();
                      }, 400);
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CertificateViewModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        certificate={selectedCert}
        recipientName={recipientName}
        recipientId={recipientId}
        department={department}
      />
    </div>
  );
}
