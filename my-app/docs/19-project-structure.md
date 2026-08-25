# 19. Project Architecture & Codebase Structure

This document outlines the directory hierarchy, architectural conventions, and component layout of the **Smart Campus Management System (SCMS)** codebase.

---

## 1. High-Level Folder Tree

```
my-app/
├── app/                      # Next.js 15 App Router Routes & Pages
│   ├── (auth)/               # Public Authentication Pages (Login, Forgot/Reset Password)
│   ├── (dashboard)/          # Authenticated Application Layout & Domain Routes
│   │   ├── admin/            # Super Admin Console (Users, Audit Logs, Halls)
│   │   ├── bus/              # Transport & Fleet Management
│   │   ├── dashboard/        # Student Primary Home Dashboard
│   │   ├── driver/           # Bus Driver Operational Console
│   │   ├── event-organizer/  # Event Organizer Management Dashboard
│   │   ├── events/           # Events Directory, Check-In & Certificates
│   │   ├── faculty/          # Faculty Member Dashboard
│   │   ├── hostel/           # Hostel Administration, Rooms, Leaves, Fees
│   │   ├── librarian/        # Librarian Circulation Dashboard
│   │   ├── library/          # Book Catalog, Authors, Borrows, Fines
│   │   ├── mess/             # Dining Menus, Attendance, Feedback, Complaints
│   │   ├── mess-manager/     # Mess Manager Dashboard
│   │   ├── notifications/    # Centralized User Notification Center
│   │   ├── profile/          # User Profile & Security Settings
│   │   └── warden/           # Hostel Warden Dashboard
│   ├── globals.css           # Tailwind CSS & Design Token Definitions
│   ├── layout.tsx            # Root HTML Document Layout & Toast Providers
│   └── page.tsx              # Root Redirection Gate
├── components/               # Reusable React UI Components
│   ├── auth/                 # Login & Password Forms
│   ├── bus/                  # Driver Consoles, Stop Tables & Route Editors
│   ├── common/               # PageHeader, StatCard, EmptyState, DataTable
│   ├── events/               # Event Cards, QR Check-In Terminal & Modals
│   ├── hostel/               # Bed Matrix, Leave Tables & Room Cards
│   ├── layout/               # AppSidebar, AppHeader & Responsive Nav
│   ├── mess/                 # Weekly Menu Grids, Rating Modals & Feedback Feeds
│   └── ui/                   # Radix UI / shadcn Atomic Primitives (Button, Dialog, etc.)
├── docs/                     # Complete System & Client Documentation Suite
├── hooks/                    # Custom React Hooks (Debounce, Media Queries)
├── lib/                      # Core Logic, Actions & Utilities
│   ├── actions/              # Next.js Server Actions (Auth, Bus, Events, Hostel, Library, Mess)
│   ├── schemas/              # Zod Validation Schemas for Form Contracts
│   ├── supabase/             # Supabase Client Initializers (Browser, Server, Admin)
│   ├── types/                # TypeScript Interfaces, Database Types & Role Constants
│   ├── constants.ts          # Institutional Constants (Fines, Meal Times, Statuses)
│   └── utils.ts              # ClassName Merger (clsx + tailwind-merge)
├── public/                   # Static Public Assets (Logos, Icons)
├── scripts/                  # Database Migration & Master Seed Scripts (seed.mjs)
├── supabase/                 # Database Schema & Versioned SQL Migrations
│   └── migrations/           # 001_initial, 004_halls, 005_library SQL Scripts
├── middleware.ts             # Next.js Edge Middleware for Route Guards & JWT Session Check
├── next.config.ts            # Next.js Framework Configuration
├── package.json              # Project Dependencies & Build Scripts
└── tsconfig.json             # TypeScript Compiler Configuration
```

---

## 2. Directory Responsibilities

### 2.1. `app/` (Next.js App Router)
- **Route Groups**: Parentheses folders `(auth)` and `(dashboard)` organize route layouts without polluting public URL paths.
- **Server Components by Default**: Pages fetch data directly on the server for fast rendering and zero client-bundle overhead.

### 2.2. `lib/actions/` (Server Actions)
Encapsulates all database mutations into type-safe, asynchronous server functions:
- [`auth.ts`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/lib/actions/auth.ts): Session creation, logout, password recovery.
- [`hostel.ts`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/lib/actions/hostel.ts): Bed allocation, leave approvals, night roll-call.
- [`bus.ts`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/lib/actions/bus.ts): Fleet CRUD, driver assignments, trip lifecycle.
- [`library.ts`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/lib/actions/library.ts): Cataloging, borrow/return, fine waivers.
- [`events.ts`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/lib/actions/events.ts): Hall booking, registrations, QR check-in.
- [`mess.ts`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/lib/actions/mess.ts): Menu publishing, dining attendance, ratings.
- [`notifications.ts`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/lib/actions/notifications.ts): Direct and broadcast messaging.

### 2.3. `lib/supabase/` (Client Factories)
- [`client.ts`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/lib/supabase/client.ts): Client-side Supabase instance using browser cookies.
- [`server.ts`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/lib/supabase/server.ts): Server-side Supabase client reading Next.js `cookies()` store.
- `createAdminClient()`: Privileged server client utilizing `SUPABASE_SERVICE_ROLE_KEY`.

### 2.4. `components/ui/` (Atomic UI Primitives)
Contains accessible, unstyled UI primitives powered by Radix UI and styled via Tailwind CSS (Buttons, Dialogs, Dropdowns, Cards, Badges, Tables, Avatars, ScrollAreas).

---

> [!NOTE]
> For revision tracking and version history, proceed to [`20-change-log.md`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/docs/20-change-log.md).
