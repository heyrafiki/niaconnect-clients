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

| Command         | Emulates Vercel Cloud | Supports Blob Storage | Typical Use Case           |
|----------------|----------------------|----------------------|----------------------------|
| `next dev`     | No                   | No                   | Fast local development     |
| `vercel dev`   | Yes                  | Yes                  | Full-stack/local Vercel emulation |

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

---
