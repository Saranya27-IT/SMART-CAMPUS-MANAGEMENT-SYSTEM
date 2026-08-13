import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Root page — redirects to the dashboard if logged in,
 * otherwise to login.
 */
export default async function RootPage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  } catch (error: any) {
    if (
      error?.digest?.startsWith("NEXT_REDIRECT") ||
      error?.digest === "DYNAMIC_SERVER_USAGE" ||
      error?.message === "NEXT_REDIRECT"
    ) {
      throw error;
    }
    console.error("RootPage auth check error:", error);
  }

  redirect("/login");
}


