"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus, MapPin, Clock, Phone, User, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { format } from "date-fns";

type Props = {
  isAssigned: boolean;
  busData: any;
  error?: string | null;
};

export function StudentBusClient({ isAssigned, busData, error }: Props) {
  if (error) {
    return (
      <Card className="border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 my-6">
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
      <Card className="my-6 border-dashed">
        <CardContent className="p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
            <Bus className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">No Bus Assigned Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
              You are registered as a Day Scholar student, but you have not been allocated to a bus route yet.
              Please contact the Campus Transport Department to get a bus allocated.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { bus, driver, route, assignedStop, allRouteStops } = busData;

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bus Info Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Vehicle</span>
              <Badge className={
                bus?.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                bus?.status === "MAINTENANCE" ? "bg-amber-100 text-amber-700 border-amber-200" :
                "bg-rose-100 text-rose-700 border-rose-200"
              }>
                {bus?.status || "ACTIVE"}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-black text-foreground flex items-center gap-2 mt-1">
              <Bus className="w-6 h-6 text-primary" /> {bus?.bus_number}
            </CardTitle>
            <CardDescription className="font-mono text-xs text-muted-foreground">
              Reg No: {bus?.registration_number || "TN-30-TEMP"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 text-xs space-y-1">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Seating Capacity</span>
              <span className="font-semibold">{bus?.capacity || 50} Seats</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Vehicle Model</span>
              <span className="font-semibold">{bus?.model || "Campus Shuttle"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Route Info Card */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Route Details</span>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2 mt-1 truncate">
              <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0" /> {route?.name || "College Route"}
            </CardTitle>
            <CardDescription className="text-xs">
              {route?.college || "K.S.R. College Main Campus"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 text-xs space-y-2">
            <div className="p-2.5 rounded-lg bg-muted/50 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="truncate">Start: {route?.starting_area || bus?.starting_area || "City"}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="truncate">Dest: {route?.destination || bus?.destination || "Campus"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Contact Card */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Driver Information</span>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2 mt-1">
              <User className="w-5 h-5 text-amber-500" /> {driver?.full_name || "Assigned Driver"}
            </CardTitle>
            <CardDescription className="text-xs">
              Transport Staff
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 text-xs space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>{driver?.phone || "+91 98765 43210"}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              In case of emergency or delay, contact your driver or campus transport desk.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Route Stops Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Route Schedule & Bus Stops
              </CardTitle>
              <CardDescription className="text-xs">
                Official stop sequence and expected arrival times for {route?.name}
              </CardDescription>
            </div>

            {assignedStop && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 py-1 px-3 text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Your Boarding Stop: {assignedStop.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {(allRouteStops || []).map((stop: any, index: number) => {
              const isUserBoarding = assignedStop?.id === stop.id;

              return (
                <div key={stop.id || index} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border bg-card hover:border-primary/30 transition-colors">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[1.85rem] top-4 w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center ${
                    isUserBoarding ? "border-primary bg-primary text-white" : "border-muted-foreground/40"
                  }`}>
                    {isUserBoarding && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-muted font-bold text-xs flex items-center justify-center text-muted-foreground flex-shrink-0">
                      {stop.sequence_number || stop.stop_order || index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{stop.name}</h4>
                        {isUserBoarding && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] py-0">Your Stop</Badge>
                        )}
                      </div>
                      {stop.address && <p className="text-xs text-muted-foreground mt-0.5">{stop.address}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                      <span>Arrival: {stop.expected_arrival_time || "07:30 AM"}</span>
                    </div>
                    {stop.expected_departure_time && (
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200">
                        <span>Depart: {stop.expected_departure_time}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
