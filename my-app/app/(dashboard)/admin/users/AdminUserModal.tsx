"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_LABELS, USER_ROLES, type UserRole } from "@/lib/types/roles";
import { createUserByAdmin, updateUserByAdmin } from "@/lib/actions/auth";
import { toast } from "sonner";
import type { Profile } from "@/lib/types/database.types";

interface AdminUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: Profile | null;
  onSuccess?: () => void;
}

export function AdminUserModal({ open, onOpenChange, userToEdit, onSuccess }: AdminUserModalProps) {
  const isEditing = !!userToEdit;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [studentType, setStudentType] = useState("HOSTELLER");
  const [department, setDepartment] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFullName(userToEdit.full_name || "");
      setEmail(userToEdit.email || "");
      setPassword("");
      setRole((userToEdit.role as UserRole) || "student");
      setStudentType((userToEdit as any).student_type || "HOSTELLER");
      setDepartment(userToEdit.department || "");
      setRollNumber(userToEdit.roll_number || "");
      setEmployeeId(userToEdit.employee_id || "");
      setPhone(userToEdit.phone || "");
    } else {
      setFullName("");
      setEmail("");
      setPassword("Campus@12345");
      setRole("student");
      setStudentType("HOSTELLER");
      setDepartment("");
      setRollNumber("");
      setEmployeeId("");
      setPhone("");
    }
  }, [userToEdit, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please fill in required fields.");
      return;
    }

    setSubmitting(true);
    if (isEditing && userToEdit) {
      const res = await updateUserByAdmin(userToEdit.id, {
        full_name: fullName.trim(),
        role,
        student_type: role === "student" ? studentType : undefined,
        department: department.trim() || undefined,
        roll_number: role === "student" ? rollNumber.trim() || undefined : undefined,
        employee_id: role !== "student" ? employeeId.trim() || undefined : undefined,
        phone: phone.trim() || undefined,
      });
      setSubmitting(false);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`User ${fullName} updated successfully!`);
        onOpenChange(false);
        onSuccess?.();
      }
    } else {
      const res = await createUserByAdmin({
        email: email.trim(),
        password: password.trim() || "Campus@12345",
        full_name: fullName.trim(),
        role,
        student_type: role === "student" ? studentType : undefined,
        department: department.trim() || undefined,
        roll_number: role === "student" ? rollNumber.trim() || undefined : undefined,
        employee_id: role !== "student" ? employeeId.trim() || undefined : undefined,
        phone: phone.trim() || undefined,
      });
      setSubmitting(false);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`User account for ${fullName} created successfully!`);
        onOpenChange(false);
        onSuccess?.();
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Campus User" : "Create New Campus User"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update role permissions, department assignment, and student status."
              : "Provision a new single sign-on user account with dedicated role permissions."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="user-fullname">Full Name *</Label>
              <Input
                id="user-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                required
              />
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="user-email">Email Address *</Label>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@smartcampus.com"
                disabled={isEditing}
                required
              />
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="user-password">Initial Password *</Label>
              <Input
                id="user-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Campus@12345"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>System Role *</Label>
              <Select value={role} onValueChange={(val: any) => setRole(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {role === "student" ? (
              <div className="space-y-1.5">
                <Label>Student Category *</Label>
                <Select value={studentType} onValueChange={(val: any) => setStudentType(val || "HOSTELLER")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOSTELLER">Hosteller (Hostel & Mess)</SelectItem>
                    <SelectItem value="DAY_SCHOLAR">Day Scholar (Bus Shuttle)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="user-empid">Employee ID</Label>
                <Input
                  id="user-empid"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. EMP-204"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="user-dept">Department</Label>
              <Input
                id="user-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Computer Science, Transport..."
              />
            </div>

            {role === "student" ? (
              <div className="space-y-1.5">
                <Label htmlFor="user-rollno">Roll Number</Label>
                <Input
                  id="user-rollno"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 21CS042"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="user-phone">Phone Number</Label>
                <Input
                  id="user-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
            )}
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gradient-primary text-white border-0">
              {submitting ? "Saving..." : isEditing ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
