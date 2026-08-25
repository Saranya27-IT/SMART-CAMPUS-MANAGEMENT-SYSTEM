# 12. Complete CRUD & Permissions Matrix

This document defines the **Create, Read, Update, Delete, Approve/Reject, and Export** privileges across all core database entities and operational resources within the **Smart Campus Management System (SCMS)**.

---

## 1. Matrix Notation & Legend

| Symbol | Meaning | Description |
|:---:|:---|:---|
| **✓** | **Allowed / Authorized** | Role possesses full permission to perform this action. |
| **—** | **Restricted / Blocked** | Role is not permitted to execute this action. |
| **Self** | **Self-Service Scope** | Operation is restricted exclusively to the user's own records (`auth.uid()`). |

---

## 2. Core Administration & Identity Management

| Module / Entity | Role | Create | Read | Update | Delete | Approve/Reject | Export |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Users & Profiles** | Super Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Users & Profiles** | Student / Faculty | — | Self | Self | — | — | — |
| **Users & Profiles** | Operational Staff | — | Domain | Self | — | — | — |
| **Audit Logs** | Super Admin | — | ✓ | — | — | — | ✓ |
| **Audit Logs** | Other Roles | — | — | — | — | — | — |
| **Notifications** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | — |
| **Notifications** | All Users | — | Self | Self | Self | — | — |

---

## 3. Library Management Module

| Module / Entity | Role | Create | Read | Update | Delete | Approve/Reject | Export |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Books & Authors** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Books & Authors** | Librarian | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Books & Authors** | Student / Faculty | — | ✓ | — | — | — | — |
| **Physical Book Copies** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Physical Book Copies** | Librarian | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Physical Book Copies** | Student / Faculty | — | ✓ | — | — | — | — |
| **Book Borrows & Loans** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Book Borrows & Loans** | Librarian | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Book Borrows & Loans** | Student (Borrower) | — | Self | Renew | — | — | — |
| **Library Fines & Waivers** | Super Admin | — | ✓ | ✓ | — | Waive | ✓ |
| **Library Fines & Waivers** | Librarian | — | ✓ | ✓ | — | Waive | ✓ |
| **Library Fines & Waivers** | Student (Borrower) | — | Self | — | — | — | — |

---

## 4. Event & Venue Management Module

| Module / Entity | Role | Create | Read | Update | Delete | Approve/Reject | Export |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Event Halls & Venues** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Event Halls & Venues** | Event Organizer | — | ✓ | — | — | Reserve | — |
| **Event Halls & Venues** | Student / Faculty | — | ✓ | — | — | — | — |
| **Campus Events** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Campus Events** | Event Organizer | ✓ | ✓ | ✓ | Self | — | ✓ |
| **Campus Events** | Student / Faculty | — | ✓ | — | — | — | — |
| **Event Registrations** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Event Registrations** | Event Organizer | — | ✓ | Check-In | — | Validate | ✓ |
| **Event Registrations** | Student / Faculty | ✓ | Self | — | Self | — | Pass |
| **Event Certificates** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Event Certificates** | Event Organizer | ✓ | ✓ | — | — | Issue | ✓ |
| **Event Certificates** | Student / Faculty | — | Self | — | — | — | Print |

---

## 5. Hostel Administration Module

| Module / Entity | Role | Create | Read | Update | Delete | Approve/Reject | Export |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Hostel Buildings & Rooms** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Hostel Buildings & Rooms** | Hostel Warden | ✓ | ✓ | ✓ | — | — | ✓ |
| **Hostel Buildings & Rooms** | Hosteller Student | — | Room | — | — | — | — |
| **Bed Allocations** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Bed Allocations** | Hostel Warden | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Bed Allocations** | Hosteller Student | — | Bed | — | — | — | — |
| **Leave Requests** | Super Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Leave Requests** | Hostel Warden | — | ✓ | ✓ | — | Approve/Reject | ✓ |
| **Leave Requests** | Hosteller Student | ✓ | Self | — | Self | — | — |
| **Night Attendance** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Night Attendance** | Hostel Warden | ✓ | ✓ | ✓ | — | — | ✓ |
| **Night Attendance** | Hosteller Student | — | Self | — | — | — | — |
| **Hostel Fees** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Hostel Fees** | Hostel Warden | ✓ | ✓ | ✓ | — | Record | ✓ |
| **Hostel Fees** | Hosteller Student | — | Self | — | — | — | — |
| **Maintenance Tickets** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Maintenance Tickets** | Hostel Warden | — | ✓ | Resolve | — | Resolve | ✓ |
| **Maintenance Tickets** | Hosteller Student | ✓ | Self | — | — | — | — |

---

## 6. Mess & Dining Operations Module

| Module / Entity | Role | Create | Read | Update | Delete | Approve/Reject | Export |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Mess Menus** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Mess Menus** | Mess Manager | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Mess Menus** | Hosteller Student | — | ✓ | — | — | — | — |
| **Dining Attendance** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Dining Attendance** | Mess Manager | ✓ | ✓ | ✓ | — | — | ✓ |
| **Dining Attendance** | Hosteller Student | ✓ | Self | — | — | — | — |
| **Feedback & Ratings** | Super Admin | — | ✓ | — | — | — | ✓ |
| **Feedback & Ratings** | Mess Manager | — | ✓ | — | — | — | ✓ |
| **Feedback & Ratings** | Hosteller Student | ✓ | Self | — | — | — | — |
| **Mess Complaints** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Mess Complaints** | Mess Manager | — | ✓ | Resolve | — | Resolve | ✓ |
| **Mess Complaints** | Hosteller Student | ✓ | Self | — | — | — | — |
| **Menu Suggestions** | Super Admin | — | ✓ | — | — | ✓ | ✓ |
| **Menu Suggestions** | Mess Manager | — | ✓ | Status | — | Accept/Reject | ✓ |
| **Menu Suggestions** | Hosteller Student | ✓ | Self | — | — | — | — |

---

## 7. Bus & Transport Logistics Module

| Module / Entity | Role | Create | Read | Update | Delete | Approve/Reject | Export |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Buses, Routes & Stops** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Buses, Routes & Stops** | Bus Driver | — | Route | — | — | — | — |
| **Buses, Routes & Stops** | Day Scholar Student| — | Route | — | — | — | — |
| **Student Bus Allocations**| Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Student Bus Allocations**| Bus Driver | — | Manifest| — | — | — | — |
| **Student Bus Allocations**| Day Scholar Student| — | Pass | — | — | — | — |
| **Bus Trips** | Super Admin | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **Bus Trips** | Bus Driver | — | Route | Trip | — | Start/End | — |
| **Bus Trips** | Day Scholar Student| — | Status | — | — | — | — |
| **Breakdown Complaints** | Super Admin | ✓ | ✓ | ✓ | ✓ | Resolve | ✓ |
| **Breakdown Complaints** | Bus Driver | ✓ | Self | — | — | — | — |

---

## 8. Authorization Enforcement Principles

1. **Self-Service Isolation**: Students and Faculty may only mutate or query records where `user_id = auth.uid()` or `student_id = auth.uid()`.
2. **Administrative Approval Boundary**: Only designated staff roles (`hostel_warden`, `mess_manager`, `librarian`, `super_admin`) hold approval and waiver authority.
3. **Audit Log Immutability**: The `public.audit_logs` table contains insert-only records that cannot be altered or purged by any role.

---

> [!NOTE]
> For institutional business rules, policy constraints, and validation logic, proceed to [`13-business-rules.md`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/docs/13-business-rules.md).
