"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus, MapPin, Clock, Phone, User, ShieldAlert, CheckCircle2, ArrowRight, Navigation } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

type Props = {
  isAssigned: boolean;
  busData: any;
  error?: string | null;
};

export function StudentBusClient({ isAssigned, busData, error }: Props) {
  if (error) {
    return (
      <Card className="border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 my-6 rounded-3xl">
        <CardContent className="p-8 text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">Access Restricted</h3>
          <p className="text-sm text-rose-600 dark:text-rose-300 max-w-md mx-auto">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!isAssigned || !busData) {
    return (
      <Card className="my-6 border-dashed rounded-3xl">
        <CardContent className="p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
            <Bus className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">No Shuttle Bus Allocated</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
              You are recognized as a <strong>Day Scholar</strong> student, but have not been allocated a bus seat yet.
              Please contact the Campus Transport Helpdesk.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { bus, driver, route, assignedStop, allRouteStops } = busData;

  return (
    <div className="space-y-6">
      {/* Top Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bus Info Card */}
        <Card className="border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-500/10 via-card to-card rounded-2xl shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Vehicle</span>
              <Badge className={
                bus?.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300" :
                bus?.status === "MAINTENANCE" ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300" :
                "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300"
              }>
                {bus?.status || "ACTIVE"}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-black text-foreground flex items-center gap-2 mt-1">
              <div className="w-8 h-8 rounded-xl gradient-bus text-white flex items-center justify-center shadow-xs">
                <Bus className="w-4.5 h-4.5" />
              </div>
              {bus?.bus_number}
            </CardTitle>
            <CardDescription className="font-mono text-xs text-muted-foreground">
              Registration: {bus?.registration_number || "TN-30-CAMPUS"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 text-xs space-y-1">
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Seating Capacity</span>
              <span className="font-bold text-foreground">{bus?.capacity || 50} Seats</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Vehicle Model</span>
              <span className="font-semibold text-foreground">{bus?.model || "Tata Starbus Ultra"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Route Info Card */}
        <Card className="rounded-2xl border bg-card hover:border-emerald-300 dark:hover:border-emerald-800 transition-all shadow-xs">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Transit Route</span>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2 mt-1 truncate">
              <MapPin className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" /> {route?.name || "City Express Route"}
            </CardTitle>
            <CardDescription className="text-xs truncate">
              Campus Destination: Main Terminal
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 text-xs space-y-2">
            <div className="p-2.5 rounded-xl bg-muted/40 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="truncate">Origin: {route?.starting_area || bus?.starting_area || "Central Terminal"}</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="truncate">Destination: {route?.destination || bus?.destination || "Smart Campus"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Contact Card */}
        <Card className="rounded-2xl border bg-card hover:border-teal-300 dark:hover:border-teal-800 transition-all shadow-xs">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Driver</span>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2 mt-1">
              <User className="w-4.5 h-4.5 text-teal-500" /> {driver?.full_name || "Assigned Driver"}
            </CardTitle>
            <CardDescription className="text-xs">
              License verified & on duty
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            <div className="flex items-center justify-between text-xs py-1 border-b border-border/50">
              <span className="text-muted-foreground">Phone Contact</span>
              <span className="font-mono font-bold text-foreground">{driver?.phone || "+91 98400-11223"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold gap-1.5 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 rounded-xl"
                onClick={() => toast.info(`Calling driver: ${driver?.phone || "+91 98400-11223"}`)}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Contact Driver
              </Button>
              <Link href="/bus/live-status" className="w-full">
                <Button size="sm" className="w-full gradient-bus text-white border-0 hover:opacity-90 text-xs font-bold gap-1 rounded-xl shadow-xs">
                  <Navigation className="w-3.5 h-3.5" /> Live GPS
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stop Waypoint Sequence List */}
      <Card className="rounded-2xl border shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" /> Stop Sequence & Estimated Arrival Times
          </CardTitle>
          <CardDescription className="text-xs">
            Your assigned boarding stop is highlighted in green.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {!allRouteStops || allRouteStops.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No stop waypoints registered for this route.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {allRouteStops.map((stop: any, idx: number) => {
                const isMyStop = assignedStop?.id === stop.id;
                return (
                  <div
                    key={stop.id || idx}
                    className={`py-3 px-3 rounded-xl flex items-center justify-between gap-4 transition-colors ${
                      isMyStop ? "bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 font-bold" : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                          isMyStop ? "gradient-bus text-white shadow-xs" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        #{stop.stop_order || idx + 1}
                      </div>
                      <div>
                        <p className={`text-sm ${isMyStop ? "text-emerald-900 dark:text-emerald-200 font-extrabold" : "text-foreground font-semibold"}`}>
                          {stop.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          ETA: {stop.expected_arrival_time || "Scheduled"}
                        </p>
                      </div>
                    </div>

                    {isMyStop && (
                      <Badge className="bg-emerald-600 text-white border-0 text-[10px] font-bold uppercase tracking-wider">
                        ★ Your Boarding Stop
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
