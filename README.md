# niaconnect-clients

This service is the client-facing web application for NiaConnect. It allows clients to sign up, complete onboarding, and access their dashboard to manage sessions and interact with experts.

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd niaconnect-clients
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

You can use either of the following commands:

#### Option 1: Next.js built-in dev server

```bash
PORT=3000 npm run dev
```

- Uses `next dev` (default for most Next.js apps)
- Fast local development, but does **not** emulate Vercel platform features (e.g., blob storage)

#### Option 2: Vercel platform dev server (recommended for blob storage)

```bash
PORT=3000 vercel dev
```

- Uses `vercel dev` to emulate the Vercel cloud platform locally
- Required if using Vercel Blob Storage, Edge Functions, or other Vercel-specific features

| Command      | Emulates Vercel Cloud | Supports Blob Storage | Typical Use Case                  |
| ------------ | --------------------- | --------------------- | --------------------------------- |
| `next dev`   | No                    | No                    | Fast local development            |
| `vercel dev` | Yes                   | Yes                   | Full-stack/local Vercel emulation |

The app will be available at [http://localhost:3000](http://localhost:3000)

---

## Using Vercel CLI

If you plan to use Vercel Blob Storage or other Vercel features, install and set up the Vercel CLI:

### 1. Install Vercel globally

```bash
npm install -g vercel
```

### 2. Sign in to Vercel

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

### 3. Link your project directory

From the root of your project (niaconnect-clients):

```bash
vercel link
```

This will associate your local project with a Vercel project.

---

> **Note:** In the future, the dev script will be updated to use `vercel dev` by default for full compatibility with Vercel platform features.

## Purpose of niaconnect-clients

- Client authentication and onboarding
- Secure session and dashboard management
- Connects clients with experts through the NiaConnect platform

### Features Implemented: Dynamic Client Profile Page

This update significantly enhances the client profile experience, ensuring it is dynamic, responsive, and adheres to the HeyRafiki design system.

- **"Complete Your Profile" Modal:** A modal prompt appears on login for users with incomplete profiles (shown once per session), encouraging them to fill out their details. Clicking "Complete Now" navigates to the `/profile` page.
- **Dynamic Profile Page (`/profile`):** A dedicated, mobile-first responsive profile page allows clients to view and update their information. It dynamically renders fields based on the client schema and is styled using shadcn/ui components and Tailwind CSS.
- **Profile Completion Tracker:** A progress bar visually indicates profile completeness (e.g., "X of Y fields completed - Z%"), updating smoothly as fields are filled.
- **Avatar Upload with Preview:** Users can now upload and preview their profile picture directly from the profile page.
- **"Profile Saved" Toast Notification:** A subtle toast message confirms successful profile updates.
- **Design System Adherence:**
  - **Typography:** Primary font is Plus Jakarta Sans, secondary is Figtree.
  - **Buttons:** Primary buttons feature a background color of `#256E4D` with white text and subtle hover animations.
  - **Responsiveness & Animations:** Layouts and components are fully responsive across all breakpoints, and all UI transitions (modal, form, progress bar) are smooth and powered by shadcn/ui without external animation libraries.

---
