import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/actions/auth";
import { PageHeader } from "@/components/common/PageHeader";
import { BedAllocationClient } from "@/components/hostel/BedAllocationClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bed Allocations — Hostel Management",
  description: "Allocate and deallocate student hostel beds with strict capacity & student type validation.",
};

export default async function HostelAllocationsPage() {
  const profile = await getCurrentUser();
  if (!profile || (profile.role !== "hostel_warden" && profile.role !== "super_admin")) {
    redirect("/hostel");
  }

  const supabase = await createClient();

  // Active bed allocations
  const { data: bedsData } = await supabase
    .from("hostel_beds")
    .select(`
      *,
      hostel_rooms(
        room_number,
        hostel_floors(
          floor_number,
          hostel_blocks(
            name,
            hostels(name)
          )
        )
      ),
      profiles!hostel_beds_student_id_fkey(id, full_name, roll_number, email, department, student_type)
    `)
    .eq("status", "occupied")
    .order("allocated_at", { ascending: false });

  // All student profiles
  const { data: studentsData } = await supabase
    .from("profiles")
    .select("id, full_name, roll_number, email, department, student_type")
    .eq("role", "student")
    .eq("is_active", true)
    .order("roll_number");

  // Hostels tree for cascading dropdowns
  const { data: hostelsData } = await supabase
    .from("hostels")
    .select(`
      id, name,
      hostel_blocks(
        id, name,
        hostel_floors(
          id, floor_number,
          hostel_rooms(
            id, room_number, condition, type, capacity,
            hostel_beds(id, bed_number, status)
          )
        )
      )
    `)
    .order("name");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Bed Allocations"
        description="Allocate rooms/beds to HOSTELLER students, inspect current room capacity, and manage active allocations."
      />
      <BedAllocationClient
        activeAllocations={bedsData ?? []}
        allStudents={studentsData ?? []}
        hostelsTree={hostelsData ?? []}
      />
    </div>
  );
}
