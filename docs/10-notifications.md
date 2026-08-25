# 10. Notifications & Alert System

The **Notification & Alert System** delivers timely, contextual, and action-oriented alerts across all five operational domains to keep students, faculty, and administrative staff synchronized with campus events, deadlines, and approvals.

---

## 1. Notification Architecture & Dispatch Mechanics

The notification subsystem supports both **Targeted Direct Messages** (individual user alerts) and **Role-Based Broadcasts** (campus-wide or departmental announcements).

```mermaid
graph TD
    Trigger[Operational Event Trigger<br/>e.g. Leave Approved / Book Overdue / Bus Delay] --> Dispatcher{Dispatch Router}
    
    Dispatcher -->|Targeted User| Direct[sendNotification(userId, title, message, type, link)]
    Dispatcher -->|All Users of Role| Broadcast[broadcastNotification(role, title, message, type)]
    
    Direct --> DB[(public.notifications Table)]
    Broadcast --> DB
    
    DB --> UI[Next.js Client Header & /notifications Center]
    UI --> Actions[User Reads / Clicks Link / Clears Alert]
```

---

## 2. Notification Types & Module Classifications

Notifications are strictly classified into seven functional channels:

| Notification Type | Primary Domain           | Representative Triggers                                                                                        | Visual Theme              |
| ----------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `library`         | **Library Module**       | Book borrowed, due date reminder (3 days before), overdue warning, fine assessed, fine waived.                 | 📚 Amber / Book Icon      |
| `event`           | **Event Module**         | Registration confirmed, ticket QR pass ready, event starting soon, certificate issued.                         | 🎭 Indigo / Calendar Icon |
| `hostel`          | **Hostel Module**        | Leave request approved/rejected by warden, room allocation confirmed, hostel fee due date, complaint resolved. | 🏢 Cyan / Building Icon   |
| `mess`            | **Mess Module**          | Weekly menu published, food complaint resolved, menu suggestion accepted.                                      | 🍽️ Rose / Utensils Icon  |
| `bus`             | **Transport Module**     | Bus route assignment confirmed, morning trip started, route delay alert, vehicle breakdown notice.             | 🚌 Emerald / Bus Icon     |
| `system`          | **Core Platform**        | Password reset confirmation, account profile updated, role permission change.                                  | ⚙️ Slate / Settings Icon  |
| `general`         | **Campus Announcements** | Dean's announcements, weather advisories, emergency campus notices.                                            | 📢 Violet / Bell Icon     |

---

## 3. Server Actions & Notification Operations

The system provides dedicated server-side actions in [`lib/actions/notifications.ts`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/lib/actions/notifications.ts):

### 3.1. `sendNotification(userId, title, message, type, link?)`
- **Purpose**: Creates an individual notification record for a specific user ID.
- **Link Parameter**: Optional relative URI (e.g. `/events/certificates` or `/hostel/leaves`) allowing users to navigate directly to the relevant record with a single click.

### 3.2. `broadcastNotification(role, title, message, type)`
- **Purpose**: Queries all active users assigned the target role (e.g. all `student` or all `faculty` profiles) and creates batch notification records.

### 3.3. `markNotificationRead(notificationId)`
- **Purpose**: Sets `read = TRUE` for a single notification when clicked by the user.

### 3.4. `markAllNotificationsRead(userId)`
- **Purpose**: Clears unread badge counts across all notifications belonging to the logged-in user.

### 3.5. `deleteNotification(notificationId)`
- **Purpose**: Removes a notification record permanently from the user's feed.

---

## 4. User Experience & Notification Center

- **Top Navigation Bell Icon**: Displays an unread badge indicator showing the real-time count of unread messages.
- **Dedicated Notifications Page ([`/notifications`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/app/(dashboard)/notifications/page.tsx))**:
  - Filterable by type (All, Library, Events, Hostel, Mess, Bus, System).
  - One-click **"Mark All as Read"** action button.
  - Interactive deep links leading directly to certificates, tickets, or leave passes.

---

> [!NOTE]
> For role-specific analytics and dashboard metrics, proceed to [`11-dashboard-and-analytics.md`](file:///f:/Project/SMART%20CAMPUS%20MANAGEMENT%20SYSTEM/SMART-CAMPUS-MANAGEMENT-SYSTEM/my-app/docs/11-dashboard-and-analytics.md).
