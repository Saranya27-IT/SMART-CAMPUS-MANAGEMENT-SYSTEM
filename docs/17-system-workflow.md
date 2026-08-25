# 17. Complete End-to-End System Workflow

This document illustrates the holistic, interconnected lifecycle of operations within the **Smart Campus Management System (SCMS)**, tracing how an interaction travels from initial user authentication to role routing, domain operations, multi-party approvals, automated notifications, analytics aggregation, and executive reporting.

---

## 1. Universal End-to-End System Pipeline

```mermaid
flowchart TD
    subgraph 1. Authentication & Gate
        AUTH[User Enters Credentials] --> JWT[Supabase Auth Issues Session JWT]
        JWT --> ROLEDETECT{Role & Metadata Detection}
    end

    subgraph 2. Routing & Navigation
        ROLEDETECT -->|super_admin| D_ADM[/admin/dashboard]
        ROLEDETECT -->|student| D_STU[/dashboard]
        ROLEDETECT -->|faculty| D_FAC[/faculty/dashboard]
        ROLEDETECT -->|librarian| D_LIB[/librarian/dashboard]
        ROLEDETECT -->|event_organizer| D_ORG[/event-organizer/dashboard]
        ROLEDETECT -->|bus_driver| D_DRV[/driver/dashboard]
        ROLEDETECT -->|hostel_warden| D_WRD[/warden/dashboard]
        ROLEDETECT -->|mess_manager| D_MSS[/mess-manager/dashboard]
    end

    subgraph 3. Operational Domain Actions
        D_STU -.-> ACT_STU[Apply Leave / Register Event / Renew Book / Rate Mess]
        D_WRD -.-> ACT_WRD[Approve Leave / Allocate Bed / Mark Night Attendance]
        D_ORG -.-> ACT_ORG[Create Event / Scan QR Ticket Check-In]
        D_LIB -.-> ACT_LIB[Issue & Return Book / Waive Fine / Manage Catalog]
        D_MSS -.-> ACT_MSS[Publish Weekly Menu / Resolve Complaints]
        D_DRV -.-> ACT_DRV[Start & Complete Bus Trips / Report Breakdown]
    end

    subgraph 4. Business Logic & Validation Layer
        ACT_STU & ACT_WRD & ACT_ORG & ACT_LIB & ACT_MSS & ACT_DRV --> BIZ{Business Rules Engine & RLS}
        BIZ -->|Valid Transaction| DB_MUTATE[(PostgreSQL State Update)]
    end

    subgraph 5. Automated Events & Cross-Module Sync
        DB_MUTATE --> NOTIF_TRIG[Dispatch Push & In-App Notifications]
        DB_MUTATE --> AUDIT_TRIG[Record System Audit Log Entry]
        DB_MUTATE --> SYNC_TRIG[Synchronize Dependent Records<br/>e.g. Leave ➔ Attendance / Event ➔ Certificate]
    end

    subgraph 6. Analytics & Intelligence
        SYNC_TRIG --> KPI_CALC[Recompute Real-time Dashboard KPIs]
        KPI_CALC --> CHARTS[Update Charts, Headcounts & Occupancy]
        CHARTS --> EXPORT[Generate Downloadable CSV & Printable Reports]
    end
```

---

## 2. Step-by-Step Interaction Narrative

### Phase 1: Authentication & Role Gate
1. A campus member submits their email and password at `/login`.
2. Supabase Auth validates password hashes and generates cryptographic JWT tokens stored in HTTP-only cookies.
3. Edge Middleware intercepts the request, looks up the user's role from `public.profiles`, and redirects them to their designated dashboard.

### Phase 2: Domain Execution & Access Control
1. The user interacts with authorized modules exposed in their navigation tree.
2. The user submits a form (e.g. Hosteller applies for a 3-day leave pass).
3. The Server Action validates payload structure via Zod, verifies active authentication, and checks business rules (e.g. `from_date <= to_date`).

### Phase 3: Multi-Party Approval & State Transition
1. The submitted request enters a `pending` state in the database.
2. The designated administrator (Hostel Warden) views the application on their approval dashboard.
3. Upon clicking **Approve**, the database updates the status to `approved` and logs the reviewing officer's ID.

### Phase 4: Cross-Module Data Synchronization
1. **Attendance Sync**: Approving a leave pass automatically populates the student's status as `on_leave` in the nightly hostel roll-call log.
2. **Event Certificate Sync**: Validating a student's QR ticket at an event check-in immediately unlocks their downloadable digital participation certificate.
3. **Library Fine Sync**: Returning an overdue book automatically triggers late fee calculation (Overdue Days × ₹2/day) and updates student account dues.

### Phase 5: Notifications & Audit Logging
1. The system invokes [`sendNotification()`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/lib/actions/notifications.ts#L6) to deliver an instant alert to the student's notification center.
2. High-impact modifications write immutable audit entries into `public.audit_logs` capturing user ID, action type, IP address, and changed fields.

### Phase 6: Executive Analytics & Data Export
1. Real-time queries aggregate live metrics: campus occupancy percentage, fine recovery rates, event attendance ratios, and meal satisfaction scores.
2. Departmental heads and campus administrators click **Export CSV** to generate audit summaries for accreditation and board reviews.

---

> [!NOTE]
> For cloud hosting, production builds, and deployment troubleshooting, proceed to [`18-deployment-guide.md`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/docs/18-deployment-guide.md).
