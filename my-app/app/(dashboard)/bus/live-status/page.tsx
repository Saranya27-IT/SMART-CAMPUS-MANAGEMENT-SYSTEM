import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { LiveBusTrackingClient } from "@/components/bus/LiveBusTrackingClient";
import { getBuses } from "@/lib/actions/bus";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Bus Tracking — Smart Campus",
  description: "Real-time GPS vehicle location, next-stop ETA countdown, and fleet telemetry.",
};

export default async function LiveBusTrackingPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const supabase = await createClient();

  const [{ data: routesData }, { data: busesData }, { data: stopsData }] = await Promise.all([
    supabase.from("bus_routes").select("*").eq("is_active", true).order("name"),
    getBuses(),
    supabase.from("bus_stops").select("*").order("stop_order", { ascending: true }),
  ]);

  const routes = (routesData ?? []) as any[];
  const buses = (busesData ?? []) as any[];
  const stops = (stopsData ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Shuttle Bus Tracking & Telemetry"
        description="Real-time GPS vehicle telemetry, active route waypoint progression, and next-stop arrival ETAs."
      />
      <LiveBusTrackingClient
        routes={routes}
        buses={buses}
        initialStops={stops}
      />
    </div>
  );
}
