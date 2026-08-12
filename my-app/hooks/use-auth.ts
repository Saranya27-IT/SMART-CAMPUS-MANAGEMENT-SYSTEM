"use client";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database.types";
import type { UserRole } from "@/lib/types/roles";
import { useEffect, useState } from "react";

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    }

    fetchProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setProfile(null);
      } else {
        fetchProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    profile,
    loading,
    role: profile?.role as UserRole | undefined,
    isAdmin: profile?.role === "super_admin",
    isStudent: profile?.role === "student",
    isLibrarian: profile?.role === "librarian",
    isEventOrganizer: profile?.role === "event_organizer",
    isBusDriver: profile?.role === "bus_driver",
    isHostelWarden: profile?.role === "hostel_warden",
    isMessManager: profile?.role === "mess_manager",
    isFaculty: profile?.role === "faculty",
  };
}
