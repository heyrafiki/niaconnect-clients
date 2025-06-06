# Previous Authentication Issues & Fixes

This document outlines the authentication problems previously encountered in the codebase and Supabase setup, describes how they were resolved, and provides best-practice recommendations for future development.

---

## 1. Issues in the Codebase

### A. Google OAuth Profile Creation Fails
- **Problem:** Google OAuth sign-in resulted in a `Database error saving new user`.
- **Root Cause:** The backend and triggers expected `first_name` and `last_name` fields, which are not always present in Google OAuth metadata. If missing, profile creation failed due to NOT NULL constraints or missing fallback logic.

### B. Race Condition on Profile Insert
- **Problem:** The `/api/auth/google-signup` route sometimes tried to create a profile before the user existed in `auth.users`.
- **Root Cause:** Google OAuth user creation is asynchronous. Profile insert logic needed to wait until the user was present in the database.

---

## 2. Issues in Supabase Setup

### A. Triggers and Constraints
- **Problem:** The `handle_new_user` trigger function on `auth.users` failed for Google users if required fields were missing, causing the entire signup to fail.
- **Problem:** The `profiles.last_name` column was NOT NULL, causing inserts to fail if last name was missing.

### B. RLS Policies
- **Problem:** Redundant or overly permissive Row Level Security (RLS) policies on the `profiles` table could allow unintended access or block legitimate inserts.

### C. Google Provider Configuration
- **Problem:** Callback URLs, client ID, or secret could be misconfigured, causing OAuth to fail before reaching application logic.

---

## 3. How Issues Were Fixed

- The `handle_new_user` trigger was updated to provide fallback values for `first_name` (using email prefix if needed) and allow `last_name` to be NULL.
- The `profiles.last_name` column was made nullable.
- The `/api/auth/google-signup` route was enhanced with retry logic to wait for user creation and robust extraction of user metadata.
- RLS policies were reviewed and fixed to avoid duplicates and ensure only authenticated users can insert/select/update their own profiles.
- Callback URLs and Google provider configuration were checked for correctness.

---

## 4. Conclusion & Best Practices

- **Always provide fallback values for required fields** in triggers and backend logic (e.g., use email prefix as first name if missing).
- **Allow optional fields to be nullable** in the database schema (e.g., last name).
- **Add retry logic** for asynchronous flows (e.g., wait for user to exist before profile insert).
- **Keep RLS policies strict and non-duplicated** to avoid security holes or accidental lockouts.
- **Check OAuth provider configuration** (callback URLs, client ID/secret) in both Supabase and Google Cloud Console.
- **Log errors with context** to aid in debugging and monitoring.
- **Test all authentication flows end-to-end** after any schema or logic changes.
