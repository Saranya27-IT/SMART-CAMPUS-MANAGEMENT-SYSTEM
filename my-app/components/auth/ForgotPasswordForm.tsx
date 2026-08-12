"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/schemas/auth";
import { forgotPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      const result = await forgotPassword(formData);
      if (result?.error) {
        toast.error("Failed to send reset email", { description: result.error });
      } else {
        setSent(true);
        toast.success("Reset email sent!");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <Card className="shadow-2xl border-0 glass">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full gradient-emerald flex items-center justify-center mx-auto">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-xl font-bold">Check your inbox</h2>
          <p className="text-muted-foreground text-sm">
            We sent a password reset link to your email address. It expires in
            1 hour.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full mt-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl border-0 glass">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a reset link
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email address</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="you@college.edu"
              disabled={isLoading}
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary text-white border-0 hover:opacity-90"
            disabled={isLoading}
            id="forgot-password-submit-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send reset link
              </>
            )}
          </Button>

          <Link href="/login">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
