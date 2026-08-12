import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getHostelRooms, getHostels } from "@/lib/actions/hostel";
import { PageHeader } from "@/components/common/PageHeader";
import { RoomManagementClient } from "@/components/hostel/RoomManagementClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rooms & Beds — Hostel Management",
  description: "Manage room capacity, bed status, and room maintenance condition.",
};

export default async function HostelRoomsPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isWarden = profile.role === "hostel_warden" || profile.role === "super_admin";
  if (!isWarden) redirect("/hostel");

  const [roomsResult, hostelsResult] = await Promise.all([
    getHostelRooms(),
    getHostels(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Rooms & Bed Matrix"
        description="Inspect capacity, occupied/available beds, room condition, and maintenance statuses."
      />
      <RoomManagementClient
        rooms={roomsResult.data || []}
        hostels={hostelsResult.data || []}
      />
    </div>
  );
}
