import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, MapPin, Radio } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Bus Tracking — Smart Campus",
};

export default function LiveBusTrackingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Bus Tracking"
        description="Real-time GPS vehicle location and ETA (Phase 2 Module)."
      />

      <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
        <CardContent className="py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
            <Radio className="h-8 w-8 animate-pulse" />
          </div>
          <div>
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">Phase 2 Feature</Badge>
            <h3 className="text-xl font-bold">Real-time GPS Tracking Integration</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
              Live vehicle telemetry, route ETA estimates, and driver GPS broadcasting will be enabled in Phase 2.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto pt-4 text-left">
            <div className="p-3 rounded-lg border bg-card space-y-1">
              <Bus className="h-5 w-5 text-indigo-600" />
              <p className="text-xs font-semibold">Active Fleet</p>
              <p className="text-xs text-muted-foreground">Ready for GPS hardware sync</p>
            </div>
            <div className="p-3 rounded-lg border bg-card space-y-1">
              <MapPin className="h-5 w-5 text-emerald-600" />
              <p className="text-xs font-semibold">Geofencing</p>
              <p className="text-xs text-muted-foreground">Bus stop alerts framework</p>
            </div>
            <div className="p-3 rounded-lg border bg-card space-y-1">
              <Radio className="h-5 w-5 text-amber-600" />
              <p className="text-xs font-semibold">Driver Mobile App</p>
              <p className="text-xs text-muted-foreground">Location beacon integration</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
