# 🏫 Smart Campus Management System — Complete System Concept & Workflow Guide

Welcome to the **Smart Campus Management System (SCMS)** documentation. This document provides a complete conceptual breakdown, role-based workflows, and user credentials for client presentation and demonstration.

---

## 📌 1. System Concept & High-Level Architecture

The **Smart Campus Management System** is a unified, real-time enterprise platform built using **Next.js (App Router)** and **Supabase (PostgreSQL + RLS + Realtime Auth)**. It digitizes all daily academic and administrative operations across 5 core operational domains:

```
                          ┌──────────────────────────────────────┐
                          │   Smart Campus Core Platform         │
                          │   (Next.js + Supabase + RLS Auth)    │
                          └──────────────────┬───────────────────┘
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      │                  │                   │                   │                  │
┌─────▼──────┐    ┌──────▼─────┐      ┌──────▼─────┐      ┌──────▼─────┐     ┌──────▼─────┐
│  Library   │    │   Events   │      │   Hostel   │      │    Mess    │     │    Bus     │
│ Management │    │ Management │      │ Management │      │ Management │     │ Management │
└────────────┘    └────────────┘      └────────────┘      └────────────┘     └────────────┘
```

### Key Architectural Highlights:
1. **Unified Authentication & RBAC**: Single sign-on for 8 distinct roles enforced via Row Level Security (RLS).
2. **Role-Based Nav & UI**: Dashboards automatically adapt to the user's role and student type (`HOSTELLER` vs `DAY_SCHOLAR`).
3. **QR Code Ticket System**: Digital verification for Event check-ins and Library book issuance.
4. **Real-time Notifications & Audit Trail**: Automated event alerts and administrative audit logs for compliance.

---

## 🔑 2. Master Credentials Table (All Roles)

Use these seeded credentials to test and demo the system across all role views:

| Role Name | User Name | Email | Password | Role Key | Student Type / Scope | Default Dashboard |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **System Admin** | System Admin | `admin@smartcampus.com` | `Admin@12345` | `super_admin` | Unrestricted Access | `/admin/dashboard` |
| **Event Manager** | Ethan Organizer | `organizer@smartcampus.com` | `Organizer@12345` | `event_organizer` | Campus Events & Venues | `/event-organizer/dashboard` |
| **Library Manager** | Laura Librarian | `librarian@smartcampus.com` | `Librarian@12345` | `librarian` | Catalog, Borrows, Fines | `/librarian/dashboard` |
| **Hostel Manager** | Henry Warden | `warden@smartcampus.com` | `Warden@12345` | `hostel_warden` | Rooms, Beds, Leaves | `/warden/dashboard` |
| **Mess Manager** | Marcus Mess | `mess@smartcampus.com` | `Mess@12345` | `mess_manager` | Menus, Meal Attendance | `/mess-manager/dashboard` |
| **Bus Manager / Driver**| David Driver | `driver@smartcampus.com` | `Driver@12345` | `bus_driver` | Bus Routes & Daily Trips | `/driver/dashboard` |
| **Faculty** | Prof. Sarah Connor | `faculty@smartcampus.com` | `Faculty@12345` | `faculty` | Event Reg & Certificates | `/faculty/dashboard` |
| **Student (Hosteller)** | Alex Student | `student@smartcampus.com` | `Student@12345` | `student` | `HOSTELLER` | `/dashboard` |
| **Student (Day Scholar)**| Karan Malhotra | `student11@smartcampus.com` | `Student11@12345` | `student` | `DAY_SCHOLAR` | `/dashboard` |

---

## 🔄 3. Complete Module Workflows

### 📅 3.1. Event Management Module Workflow
```
[Super Admin] ──────► Create Event Halls (Main Auditorium, Seminar Hall 1)
                            │
[Event Organizer] ───► Create Event ──► Set Capacity, Venue & Category ──► Status: Upcoming
                                                                               │
[Student / Faculty] ─► Browse Events ──► Click Register ──► Receive Ticket QR Code & Notification
                                                                               │
[Event Organizer] ───► Open QR Check-in ──► Scan / Input Participant Ticket ──► Attendance Marked
                                                                               │
[Student / Faculty] ─► View Earned Digital Certificate on /events/certificates ◄┘
```
- **Super Admin**: Creates and manages campus halls/venues with capacities and facility lists.
- **Event Organizer**: Creates events, updates status (`draft`, `upcoming`, `ongoing`, `completed`, `cancelled`), monitors registration progress, and executes live QR check-ins.
- **Student & Faculty**: Browse active events, register with 1-click, view ticket QR codes, and download digital certificates upon check-in.

---

### 📚 3.2. Library Management Module Workflow
```
[Librarian] ────────► Add Book Title, Author & Copies ──► System Generates Copy QR Codes
                                                                    │
[Student] ──────────► Browse Book Catalog ──► Request Borrow at Library Counter
                                                                    │
[Librarian] ────────► Issue Book to Student ──► Due Date Set (14 days)
                                                                    │
[Return Workflow] ──► Return Book ──► System Calculates Fine (if overdue ₹2/day)
                                │
                                └─► Paid / Renewed ──► Inventory Updated
```
- **Librarian**: Manages categories, authors, publishers, books, and specific copy barcodes. Processes borrows, returns, and calculates overdue fines.
- **Student**: Searches library catalog by title/author/ISBN, tracks currently borrowed books and due dates.

---

### 🏠 3.3. Hostel Management Module Workflow
```
[Hostel Warden] ────► Manage Hostels, Blocks, Floors, Rooms & Beds
                                        │
[Hostel Warden] ────► Allocate Available Bed to Hosteller Student
                                        │
[Hosteller Student] ─► View Room Info ──► Submit Leave Request / Lodge Maintenance Complaint
                                        │
[Hostel Warden] ────► Review Leave Request ──► Approve / Reject ──► Night Attendance Marked
```
- **Hostel Warden**: Oversees building structures, room capacities, bed allocations, student leave requests, complaint tickets, and daily night attendance.
- **Hosteller Student**: Accesses room allocation details, applies for leave passes with emergency contacts, and files hostel complaints.

---

### 🍽️ 3.4. Mess Management Module Workflow
```
[Mess Manager] ─────► Publish Weekly Menu (Breakfast, Lunch, Snacks, Dinner)
                                        │
[Hosteller Student] ─► View Today's Menu ──► Attend Meal / Provide Rating (1-5 Stars) & Feedback
                                        │
[Mess Manager] ─────► Track Meal Attendance & Review Feedback / Resolve Complaints
```
- **Mess Manager**: Configures meal menus by day and time slot, monitors meal attendance, tracks rating analytics, and addresses meal quality feedback.
- **Hosteller Student**: Views daily menus with meal timings, records meal attendance, and submits ratings or suggestions.

---

### 🚌 3.5. Bus Management Module Workflow
```
[Super Admin] ──────► Create Buses, Routes & Bus Stops (with Order & GPS)
                                        │
[Super Admin] ──────► Assign Route & Stop to Day Scholar Student
                                        │
[Bus Driver] ───────► View Assigned Route & Stops ──► Start Morning / Evening Trip
                                        │
[Day Scholar] ──────► View Bus Number, Driver Info, Route Stops & Timings
```
- **Super Admin**: Manages bus fleet, route definitions, stop sequences, and assigns day scholars to specific routes.
- **Bus Driver**: Starts and completes scheduled trips (Morning/Evening/Special).
- **Day Scholar**: Sees their designated bus route, vehicle number, driver contact details, and pickup stop.

---

## 🔒 4. Role-Based Access Control (RBAC) Matrix

| Feature / Page | Super Admin | Event Organizer | Librarian | Hostel Warden | Mess Manager | Bus Driver | Faculty | Student |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **System Admin Dashboard** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **User & Role Management** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Hall Management** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Create & Edit Events** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Event QR Check-in** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Browse & Register Events**| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Issue / Return Books** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Hostel & Bed Allocation** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Mess Menu & Feedback** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Bus Routes & Drivers** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## 🚀 5. Quick Demo Guide for Client Presentation

To showcase the system effectively to stakeholders:

1. **Event Management Demo**:
   - Log in as **Event Manager** (`organizer@smartcampus.com`).
   - Navigate to `/events/manage` → Click **Create Event** → Pick "Seminar Hall 1" and fill details.
   - Log in as **Student** (`student@smartcampus.com`).
   - Go to `/events` → Open the new event → Click **Register**. Copy the generated Ticket Code.
   - Switch back to **Event Manager** → Go to `/events/check-in` → Paste the ticket code → Click **Verify Check-in**.

2. **Day Scholar vs Hosteller Demo**:
   - Log in as **Hosteller Student** (`student@smartcampus.com`): Notice **Hostel** and **Mess** in sidebar, but **Bus** hidden.
   - Log in as **Day Scholar Student** (`student11@smartcampus.com`): Notice **My Bus** in sidebar, but **Hostel** and **Mess** hidden.

3. **Hall Management Demo**:
   - Log in as **Super Admin** (`admin@smartcampus.com`).
   - Go to `/events` → Click **Hall Management** tab → Click **Add Hall** → Fill capacity and toggle facility chips.

---
*Documentation generated for Smart Campus Management System.*
