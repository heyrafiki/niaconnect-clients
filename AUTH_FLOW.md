# Authentication & Onboarding Flow — niaconnect-clients

## Overview
This document describes the implemented authentication and onboarding flows for the niaconnect-clients app, covering both Email/Password and Google OAuth methods. It details the schema design, authentication flows, session handling, and onboarding process.

---

## 1. Database Schema (`clients` collection)

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

### Schema Notes:
- MongoDB is used as the database with Mongoose for schema management
- Indexes: email (unique)
- The onboarding object tracks completion status and step data
- OTP fields are only used for email authentication

---

## 2. Authentication Flows

### Google OAuth Flow
1. User clicks "Continue with Google"
2. NextAuth handles Google OAuth flow
3. On success:
   - Check if user exists in database
   - If new user:
     - Create user record with Google profile data
     - Set is_verified = true
     - Initialize empty onboarding object
   - Create JWT session with:
     - User ID, email, name
     - Google profile picture
     - Provider = "google"
4. Redirect to /onboarding/step-1 with:
   - Autofilled name from Google profile
   - Autofilled email
   - Google profile picture as avatar

### Email Signup Flow
1. User fills signup form (email, password, name)
2. Backend:
   - Validates input
   - Checks for existing email
   - Hashes password
   - Generates 6-digit OTP
   - Creates user with is_verified = false
3. Redirect to OTP verification with:
   - Email in query params
   - Password stored in sessionStorage
4. After OTP verification:
   - Update user is_verified = true
   - Create session using stored credentials
   - Clear sessionStorage
5. Redirect to /onboarding/step-1 with:
   - Autofilled name from signup
   - Autofilled email
   - Generated avatar based on name

### Email Sign-in Flow
1. User enters email/password
2. If user exists and is verified:
   - Create session
   - Redirect to /onboarding/step-1 or dashboard
3. If user exists but not verified:
   - Store password in sessionStorage
   - Redirect to OTP verification
4. After OTP verification:
   - Same as signup flow verification

---

## 3. Session Management

### JWT Session Structure
```typescript
{
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    image?: string;        // Google profile picture URL
    provider: string;      // "google" or "email"
    onboarding: {
      completed: boolean;
      // other onboarding data
    }
  }
}
```

### Session Handling
- JWT strategy used for session management
- Session data available on both client and server
- Includes provider-specific data (Google profile picture)
- Stores onboarding progress

---

## 4. Onboarding Flow

### Step 1: Personal Information
- Pre-filled data based on auth method:
  - Google: name, email, profile picture
  - Email: name, email, generated avatar
- Additional fields:
  - Phone number
  - Gender
  - Date of birth
  - Country

### Steps 2-4
[Details of other onboarding steps...]

### Data Storage
- Form data stored in local storage during steps
- Final submission saves to database
- Onboarding object tracks completion status

---

## 5. Security Considerations

### Password Handling
- Passwords hashed using bcrypt (10 rounds)
- Never stored in plain text
- Temporary storage in sessionStorage only during OTP flow

### OTP Verification
- 6-digit numeric code
- 10-minute expiration
- Required for all email signups
- Required for unverified email sign-ins

### Session Security
- JWT-based sessions
- Configured secure cookie handling
- Provider information tracked to prevent method mixing

---

## 6. Frontend Components

### Auth Components
- ClientAuth: Main authentication component
- OTP verification component
- Onboarding step components

### Protected Routes
- Onboarding routes check authentication
- Dashboard requires completed onboarding
- Auth pages redirect if already authenticated

---

## 7. API Routes

### Authentication
- /api/auth/[...nextauth] - NextAuth handler
- /api/auth/signup - Email signup
- /api/auth/signin - Email signin
- /api/auth/verify-otp - OTP verification

### Onboarding
[Details of onboarding API routes...]
