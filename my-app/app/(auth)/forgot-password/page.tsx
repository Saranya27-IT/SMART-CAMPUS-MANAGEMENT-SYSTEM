import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password — Smart Campus",
  description: "Reset your Smart Campus account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
