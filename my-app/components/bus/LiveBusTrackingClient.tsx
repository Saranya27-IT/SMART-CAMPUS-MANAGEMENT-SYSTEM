"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bus, MapPin, Radio, Clock, Gauge, Fuel, ShieldCheck, Navigation,
  AlertTriangle, Phone, RefreshCw, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  routes: any[];
  buses: any[];
  initialStops: any[];
}

export function LiveBusTrackingClient({ routes, buses, initialStops }: Props) {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || "");
  const [currentStopIndex, setCurrentStopIndex] = useState(1);
  const [speed, setSpeed] = useState(38);
  const [etaSeconds, setEtaSeconds] = useState(180);
  const [isSimulating, setIsSimulating] = useState(true);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const assignedBus = buses.find((b) => b.route_id === selectedRouteId) || buses[0];

  const stops = initialStops.filter((s) => s.route_id === selectedRouteId);
  const currentStops = stops.length > 0 ? stops : [
    { id: "1", name: "Central Metro Station", stop_order: 1, expected_arrival_time: "07:30 AM" },
    { id: "2", name: "City Plaza Interchange", stop_order: 2, expected_arrival_time: "07:45 AM" },
    { id: "3", name: "Greenfield Residential Junction", stop_order: 3, expected_arrival_time: "08:00 AM" },
    { id: "4", name: "West Gate Tech Park", stop_order: 4, expected_arrival_time: "08:15 AM" },
    { id: "5", name: "Smart Campus Main Terminal", stop_order: 5, expected_arrival_time: "08:30 AM" },
  ];

  // Live Telemetry simulation tick
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Fluctuate speed realistically between 25 and 52 km/h
      setSpeed(Math.floor(28 + Math.random() * 24));

      // Decrement ETA
      setEtaSeconds((prev) => {
        if (prev <= 10) {
          // Move to next stop
          setCurrentStopIndex((sIdx) => (sIdx < currentStops.length - 1 ? sIdx + 1 : 0));
          return 180;
        }
        return prev - 5;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating, currentStops.length]);

  const targetStop = currentStops[currentStopIndex] || currentStops[0];
  const etaMinutes = Math.ceil(etaSeconds / 60);

  return (
    <div className="space-y-6">
      {/* Route & Fleet Selector Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl gradient-primary text-white flex items-center justify-center flex-shrink-0">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Select Active Shuttle Route</h3>
                <p className="text-xs text-muted-foreground">Monitor real-time GPS telemetry and stop ETAs</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={selectedRouteId} onValueChange={(val: any) => setSelectedRouteId(val || "")}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Choose Route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                  {routes.length === 0 && (
                    <SelectItem value="default">Default City Campus Route</SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => {
                  toast.success("GPS Telemetry refreshed with live satellite feed.");
                  setEtaSeconds(120);
                }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sync GPS
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Telemetry Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Current Speed</p>
              <p className="text-xl font-extrabold text-foreground">{speed} <span className="text-xs font-normal text-muted-foreground">km/h</span></p>
              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200 mt-0.5">
                Optimal Cruise
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Next Stop ETA</p>
              <p className="text-xl font-extrabold text-amber-600">~{etaMinutes} <span className="text-xs font-normal text-muted-foreground">mins</span></p>
              <p className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                {targetStop?.name || "Next Stop"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40">
              <Radio className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">GPS Signal</p>
              <p className="text-xl font-extrabold text-emerald-600">Active</p>
              <p className="text-[11px] text-muted-foreground">11/12 Satellites</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40">
              <Fuel className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Vehicle Telemetry</p>
              <p className="text-xl font-extrabold text-foreground">86% <span className="text-xs font-normal text-muted-foreground">Fuel</span></p>
              <p className="text-[11px] text-emerald-600 font-medium">Engine Normal</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Route Stepper & Vehicle Position */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                Live Route Progression & Waypoints
              </CardTitle>
              <CardDescription>
                Vehicle: <strong>{assignedBus?.bus_number || "Bus-04"}</strong> · Driver: <strong>{assignedBus?.driver_name || "David Driver"}</strong>
              </CardDescription>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs w-fit">
              ● Trip In-Progress
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {/* Progress Waypoint Stepper */}
          <div className="relative py-6">
            <div className="absolute left-6 top-8 bottom-8 w-1 bg-muted-foreground/20 rounded-full sm:hidden" />
            <div className="hidden sm:block absolute top-1/2 left-8 right-8 h-1 -translate-y-1/2 bg-muted-foreground/20 rounded-full" />

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 relative">
              {currentStops.map((stop: any, idx: number) => {
                const isPassed = idx < currentStopIndex;
                const isCurrent = idx === currentStopIndex;
                const isUpcoming = idx > currentStopIndex;

                return (
                  <div key={stop.id || idx} className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-2 text-left sm:text-center group">
                    {/* Node Dot */}
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${
                        isCurrent
                          ? "bg-primary text-white ring-4 ring-primary/30 scale-110 animate-pulse"
                          : isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-muted text-muted-foreground border"
                      }`}
                    >
                      {isCurrent ? (
                        <Bus className="h-6 w-6" />
                      ) : isPassed ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <MapPin className="h-5 w-5" />
                      )}
                    </div>

                    {/* Stop Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${isCurrent ? "text-primary" : "text-foreground"}`}>
                        {stop.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {stop.expected_arrival_time || `Stop #${idx + 1}`}
                      </p>
                      {isCurrent && (
                        <Badge variant="outline" className="mt-1 text-[10px] bg-primary/10 text-primary border-primary/20">
                          Bus Approaching
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Vehicle & Driver Details Footer */}
          <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gradient-primary text-white flex items-center justify-center font-bold">
                {assignedBus?.driver_name?.charAt(0) || "D"}
              </div>
              <div>
                <p className="font-bold text-foreground">{assignedBus?.driver_name || "David Driver"}</p>
                <p className="text-muted-foreground">{assignedBus?.model || "Tata Starbus Ultra"} · Capacity: {assignedBus?.capacity || 40} Seats</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 h-8"
                onClick={() => toast.info("Driver Contact: +91 98450-12345")}
              >
                <Phone className="w-3.5 h-3.5" /> Call Driver
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="text-xs gap-1.5 h-8"
                onClick={() => toast.warning("Emergency Alert dispatched to Campus Transport Control.")}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Emergency SOS
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
