# Authentication Flow Documentation

This document explains how authentication works in the `niaconnect-clients` app, covering both Google OAuth and Email/Password flows up to the point where users are redirected to onboarding.

---

## 1. Email/Password Authentication Flow

1. **Signup**
    - User enters first name, last name, email, and password.
    - `supabase.auth.signUp` is called with these details. User metadata includes names and role.
    - If successful, a row is created in Supabase's `auth.users` table.
    - The backend `/api/auth/signup` API route is called to create a profile row in the `profiles` table.
    - User is redirected to `/auth/verify-email` to confirm their email address.

2. **Email Verification**
    - User receives a verification email from Supabase.
    - After confirming, user can log in.

3. **Login**
    - User enters email and password.
    - `supabase.auth.signInWithPassword` is called.
    - If successful, user session is established.
    - The app fetches the user's profile from `profiles`.
    - If email is not confirmed, user is prompted to verify.
    - If confirmed, user is redirected to onboarding (`/onboarding/step-1`) or dashboard, depending on onboarding status.

---

## 2. Google OAuth Authentication Flow

1. **Login/Signup with Google**
    - User clicks "Sign in with Google".
    - `supabase.auth.signInWithOAuth` is called with Google as the provider and proper scopes (including `userinfo.email`).
    - User is redirected to Google and authenticates.
    - On success, user is redirected back to `/auth/callback`.

2. **OAuth Callback Handling**
    - The app processes the callback, checks for errors, and fetches the Supabase session.
    - The backend `/api/auth/google-signup` API route is called to create a profile row in `profiles` (if it does not exist).
        - This route waits for the user to exist in `auth.users`, extracts user info from metadata, and creates the profile.
    - User is redirected to onboarding (`/onboarding/step-1`).

---

## 3. Onboarding Redirection
- After successful authentication (either method), the user is redirected to the onboarding process if their profile is not fully set up.
- Otherwise, they are taken to the dashboard.

---

## 4. Key Notes
- Email verification is required for email/password signups, but Google users are always considered verified.
- All profile creation logic ensures required fields are present or fallback values are used.
- Triggers and backend logic ensure robust handling of edge cases.
