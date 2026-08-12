import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login — Smart Campus Management System",
  description:
    "Sign in to the Smart Campus Management System to access library, events, hostel, bus, and mess services.",
};

export default function LoginPage() {
  return <LoginForm />;
}
