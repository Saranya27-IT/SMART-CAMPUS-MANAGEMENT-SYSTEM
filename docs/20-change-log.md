# 20. Version History & Changelog

All notable changes, enhancements, and releases for the **Smart Campus Management System (SCMS)** are documented in this file following the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standard.

---

## [1.0.0] — Initial Enterprise Release

### Added
- **Core Platform & Security**:
  - Unified Next.js 15 App Router architecture with Supabase SSR session handling.
  - Role-Based Access Control (RBAC) across 8 roles: `super_admin`, `student`, `faculty`, `librarian`, `event_organizer`, `bus_driver`, `hostel_warden`, `mess_manager`.
  - Self-contained Edge Middleware ([`middleware.ts`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/middleware.ts)) for zero-latency route protection.
  - Student residency segregation between `HOSTELLER` and `DAY_SCHOLAR` user types.
  - Real-time notification dispatch engine for individual and broadcast role alerts.
  - System audit logging for tracking sensitive administrative actions.

- **Library Management Module**:
  - Full bibliographic cataloging supporting Title, ISBN, Authors, Categories, and Publishers.
  - Physical copy barcode/QR code inventory tracking with multi-state condition flags.
  - Borrow circulation with 14-day default loan period and student 3-book maximum.
  - Automated overdue fine computation (₹2.00/day) with administrative waiver workflow.
  - Self-service online book renewal (max 2 extensions of +7 days each).

- **Event & Venue Management Module**:
  - Campus event hall directory with capacity thresholds and amenity chips.
  - Hall scheduling with automated double-booking prevention.
  - Online event discovery and one-click participant registration.
  - Live QR code ticket check-in terminal with instant attendance verification.
  - Automated digital certificate of participation distribution for verified attendees.

- **Hostel Administration Module**:
  - Multi-building structural hierarchy: Hostel ➔ Block ➔ Floor ➔ Room ➔ Bed.
  - Bed allocation engine enforcing single-bed occupancy constraint per student.
  - Multi-status student leave pass workflow (Pending ➔ Approved / Rejected with mandatory remarks).
  - Night roll-call attendance system synchronized with approved leave records.
  - Semester hostel fee billing ledger with payment tracking and receipt logging.
  - Facility maintenance grievance ticketing system with priority escalation.

- **Mess & Dining Management Module**:
  - Weekly 7-day nutritional menu planner across 4 daily meal slots (Breakfast, Lunch, Snacks, Dinner).
  - Meal-by-meal dining headcount attendance logging.
  - Student meal satisfaction rating system (1 to 5 Stars) with written feedback.
  - Catering grievance redressal pipeline for food quality and hygiene complaints.
  - Collaborative student menu suggestion box.

- **Bus & Transport Logistics Module**:
  - Fleet vehicle inventory management with driver assignment.
  - Route planning with sequenced waypoint stops and geographic coordinate indexing.
  - Day Scholar student seat allocation and bus pass generation.
  - Bus Driver operational dashboard with live trip lifecycle controls (Morning/Evening/Special).
  - Vehicle mechanical breakdown and transit delay reporting.

---

## [Upcoming / Roadmap]

### Planned Enhancements
- [ ] Push notifications integration via Web Push API for mobile devices.
- [ ] Direct payment gateway integration (Stripe / Razorpay) for automated library fine and hostel fee settlements.
- [ ] GPS-based live vehicle telemetry map tracking for Day Scholar bus routes.
- [ ] Barcode thermal printer integration for physical library copy stickers.
- [ ] Automated weekly dining satisfaction analytics PDF email reports for executive leadership.
