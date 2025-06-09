# Authentication & Onboarding Flow — niaconnect-clients

---

## Quick Reference Table
| Flow Type        | Method(s)           | OTP Required | Onboarding Steps | Redirects           | Storage                |
|------------------|---------------------|--------------|------------------|---------------------|------------------------|
| Google OAuth     | Google              | No           | Personal, Therapy Reasons, Preferences | /onboarding/step-1 → /dashboard | JWT, localStorage (steps) |
| Email/Password   | Email, Password     | Yes          | Personal, Therapy Reasons, Preferences | /verify-otp → /onboarding/step-1 → /dashboard | JWT, localStorage (steps) |

---


## 1. Overview
This document describes authentication and onboarding for niaconnect-clients. It covers:
- Database schema
- Authentication (Google OAuth, Email/Password)
- Session management (JWT)
- Onboarding flow
- Security and best practices
- API endpoints

---

## 2. Database Schema (`clients` collection)

| Field         | Type      | Required | Description                                   |
|-------------- |---------- |----------|-----------------------------------------------|
| _id           | ObjectId  | Yes      | Primary key (MongoDB)                         |
| email         | String    | Yes      | Unique, indexed                               |
| password_hash | String    | No       | Bcrypt hash, only for email users            |
| first_name    | String    | No       | From signup form or Google profile           |
| last_name     | String    | No       | From signup form or Google profile           |
| is_verified   | Boolean   | Yes      | Default false for email, true for Google     |
| provider      | Enum      | Yes      | 'email' or 'google'                          |
| otp           | String    | No       | 6-digit code for email verification          |
| otp_expiry    | Date      | No       | OTP expiration (10 minutes)                  |
| created_at    | Date      | Yes      | Auto-set on creation                         |
| updated_at    | Date      | Yes      | Auto-updated on changes                      |
| onboarding    | Object    | No       | Onboarding progress and data                 |

---

## 3. Authentication Flows

### Google OAuth
- User clicks "Continue with Google"
- NextAuth handles OAuth
- On first login:
  - User created if not exists (`is_verified = true`, onboarding initialized)
  - JWT session created
  - Redirect to `/onboarding/step-1` (autofilled name/email/image)
- No OTP required

### Email/Password
- User signs up with email, password, name
- Backend validates, hashes password, generates OTP, creates user (`is_verified = false`)
- Redirect to `/verify-otp` (email in query, password in sessionStorage)
- On OTP verification:
  - `is_verified = true`, session created, sessionStorage cleared
  - Redirect to `/onboarding/step-1` (autofilled name/email)
- On sign-in:
  - If verified: session created, redirect to onboarding or dashboard
  - If not verified: redirect to OTP verification

---

## 4. Session Management

- JWT strategy for all sessions (NextAuth)
- Session data available on client and server
- JWT includes: user ID, email, name, image, provider, onboarding status
- Onboarding progress stored in JWT and MongoDB
- Session checked on all protected routes (dashboard, onboarding)

```typescript
{
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    image?: string;
    provider: string;
    onboarding: {
      completed: boolean;
      // step data
    }
  }
}
```

---

## 5. Onboarding Flow

- Multi-step onboarding (Personal Info → Therapy Reasons → Preferences)
- Steps are the same for Google and Email/Password, except OTP is skipped for Google
- Step data saved in localStorage; final POST to `/api/update-onboarding` (JWT required)
- Backend normalizes and saves onboarding data, sets `completed: true`
- On success, user is redirected to `/dashboard`
- Dashboard access requires onboarding completion (`session.user.onboarding.completed`)
- Onboarding can be resumed at any time if incomplete

**API:** `/api/update-onboarding` (POST, JWT-only)
- Normalizes and updates onboarding data in MongoDB
- Returns updated onboarding object

**Redirects:**
- After onboarding: `/dashboard`
- If onboarding incomplete: dashboard → `/onboarding/step-1`

**Data Storage:**
- Step data: localStorage (cleared after onboarding)
- All onboarding data: single object in MongoDB

**Security:**
- All onboarding APIs require JWT
- No sensitive data in localStorage after onboarding
- Passwords always hashed with bcrypt

**Flow Summary:**
```
Signup/Login → (OTP if email) → /onboarding/step-1 → ... → /onboarding/step-N → POST /api/update-onboarding → /dashboard
```

---

## 6. Security Considerations

- Passwords hashed with bcrypt (10 rounds), never stored plain
- OTP: 6-digit, 10 min expiry, required for all email signups/unverified sign-ins
- JWT-based sessions, secure cookies, provider tracked
- Password temporarily in sessionStorage only during OTP flow
- No sensitive data in localStorage after onboarding

---

## 7. Frontend Components & Protected Routes

- Auth components: ClientAuth, OTP verification, onboarding steps
- Onboarding routes require authentication
- Dashboard requires completed onboarding
- Auth pages redirect if already authenticated

---

## 8. API Endpoints

- `/api/auth/[...nextauth]` — NextAuth handler
- `/api/auth/signup` — Email signup
- `/api/auth/signin` — Email signin
- `/api/auth/verify-otp` — OTP verification
- `/api/update-onboarding` — Onboarding update (JWT required)

---

## 9. Best Practices

- Never require onboarding fields at DB level
- Google users: always `is_verified = true`, skip OTP
- Store all onboarding data in a single object for flexibility
- Use upsert logic for Google sign-in to avoid duplicates
- Allow resuming onboarding at any time if incomplete

---

## 10. Notes
- All fields except `email`, `id`, `provider`, `is_verified`, and timestamps are optional
- Password is only stored for email/password users
- Google users never need OTP verification
- Onboarding can be resumed at any time
