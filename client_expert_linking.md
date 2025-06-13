# Client-Expert Linking — Client App

## 1. Overview
This document details how clients (end-users) discover, connect, and schedule sessions with experts (mental health professionals) in the niaconnect-clients app. The app connects to a shared MongoDB database and focuses on seamless expert discovery, session requests, and calendar management.

---

## 2. Relevant Models
- **Client**: User profile, onboarding, preferences.
- **SessionRequest**: Outgoing requests to experts (pending, accepted, declined, rescheduled).
- **Session**: Confirmed sessions with experts.

---

## 3. UI/UX Flow

### A. `/experts` (Therapists) Page
- **Purpose**: Discover and filter available experts.
- **Flow**:
  1. Fetch and display expert cards (with filters: specialty, session type, time, demographics).
  2. View expert profile via modal.
  3. Request session: open modal, select preferred times (see expert's availability), submit request.
  4. Show request status (pending, accepted, declined, rescheduled) via notifications and on calendar.

### B. `/calendar` Page
- **Purpose**: Unified view of all sessions (upcoming, past, pending).
- **Flow**:
  1. Fetch all sessions and requests for the client.
  2. Display in chronological order, with status badges.
  3. Allow rescheduling/cancelling pending or accepted sessions.
  4. Show notifications for status changes.

### C. Notifications
- In-app notifications for request status changes (accepted, declined, rescheduled).
- (Phase 2) Email notifications for important updates.

### D. Session Request/Reschedule
- Allow proposing multiple times.
- Show expert's available slots.
- Allow negotiation (reschedule flow).

---

## 4. API Endpoints
- `GET /api/experts` — List/filter experts.
- `GET /api/experts/:id/availability` — Get expert's available slots.
- `POST /api/session-requests` — Create session request.
- `PATCH /api/session-requests/:id/reschedule` — Propose new times.
- `GET /api/sessions?client_id=<id>` — List all sessions for client.

---

## 5. Phased Implementation

### **Phase 1: Core Linking & Scheduling**
- `/experts` page: list, filter, request session.
- `/calendar` page: view all sessions/requests.
- Basic notifications (in-app).

### **Phase 2: Enhanced Interaction & Notifications**
- Reschedule/cancel requests.
- Email notifications.
- Improved expert profile view.

### **Phase 3: Session Management & UX Polish**
- Session details page.
- Feedback after session.
- Advanced calendar features.

### **Phase 4: Advanced Features**
- Real-time chat for negotiation.
- Calendar sync (Google/Outlook).
- Analytics/dashboard.

---

## 6. Notes & Best Practices
- All API calls require JWT authentication.
- Only show available experts (filter by availability).
- Validate all times/slots before request.
- Store all onboarding and session data securely.
- Allow resuming onboarding if incomplete.
- Log all actions for support/debugging.
- Ensure accessibility and mobile responsiveness.

