import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password — Smart Campus",
  description: "Set a new password for your Smart Campus account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
