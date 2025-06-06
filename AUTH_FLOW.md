# Authentication & Onboarding Flow — niaconnect-clients

## Overview
This document describes the schema design and authentication/onboarding flows for the niaconnect-clients app, covering both Email/Password and Google OAuth methods. It also specifies which fields are required at each stage, and how onboarding data is handled.

---

## 1. User Schema Design (`clients` table)

| Field         | Type      | Required | Description                                   |
|-------------- |---------- |----------|-----------------------------------------------|
| id            | UUID      | Yes      | Primary key                                   |
| email         | String    | Yes      | Unique, indexed                               |
| password_hash | String    | No       | Only for email/password users                 |
| first_name    | String    | No       | Populated from signup or Google OAuth         |
| last_name     | String    | No       | Populated from signup or Google OAuth         |
| is_verified   | Boolean   | Yes      | True if email verified (OTP or Google)        |
| provider      | Enum      | Yes      | 'email' or 'google'                           |
| created_at    | Timestamp | Yes      |                                               |
| updated_at    | Timestamp | Yes      |                                               |
| onboarding    | JSONB     | No       | All onboarding data (see below)               |

- `last_name` is optional to support Google accounts without a last name.
- `onboarding` holds all onboarding steps as a JSON object. None of its fields are mandatory at the DB level.

---

## 2. Authentication Flow

### Email/Password
1. User signs up with email, password, first name, (optionally last name).
2. Account is created with `is_verified = false`.
3. User is redirected to the OTP verification page.
4. After entering the correct OTP, `is_verified` is set to `true`.
5. User is redirected to onboarding (step 1).

### Google OAuth
1. User signs in with Google.
2. Extract email, first name, last name (if available) from Google profile.
3. Account is created or found (upsert) with `is_verified = true`, `provider = 'google'`.
4. User is redirected directly to onboarding (no OTP required).

---

## 3. Onboarding Flow
- Steps: step-1, step-2, step-3, step-4 (all optional fields)
- Data is stored in local storage until the final step.
- On completion, onboarding data is saved to the `onboarding` field in the DB.
- No onboarding fields are required at the DB level, to avoid blocking account creation.

### Example `onboarding` JSON structure:
```json
{
  "step1": { ... },
  "step2": { ... },
  "step3": { ... },
  "step4": { ... }
}
```

---

## 4. Handling Incomplete Signup States

### 1. Account Created but Not Verified
- If a user tries to sign in and their email is not verified (`is_verified = false`):
  - Redirect them to the OTP verification page.
  - Do not allow access to onboarding or dashboard until verified.

### 2. Account Verified but Onboarding Not Started/Completed
- If a user is verified (`is_verified = true`) but has not started or completed onboarding:
  - Redirect them to the onboarding process (resume from last incomplete step if possible).
  - Do not allow access to dashboard until onboarding is complete.

### 3. Account Verified and Onboarding Complete
- If a user is verified and onboarding is complete:
  - Redirect them to the dashboard upon signin.

---

## 5. Best Practices & Improvements
- Never require onboarding fields at the DB level.
- Always set `is_verified = true` for Google users, skip OTP.
- Allow users to skip onboarding and complete later.
- Store all onboarding data in a single JSONB field for flexibility.
- Use upsert logic for Google sign-in to avoid duplicate accounts.

---


### Email/Password:
```
Signup → OTP Verify → Onboarding (step 1-4) → Dashboard
```

### Google OAuth:
```
Google Signin → Onboarding (step 1-4) → Dashboard
```

---

## 6. Notes
- All fields except `email`, `id`, `provider`, `is_verified`, and timestamps are optional.
- Password is only stored for email/password users.
- Google users never need OTP verification.
- Onboarding can be resumed at any time.
