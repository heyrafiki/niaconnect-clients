# Real-Time Messaging System Documentation

## 1. Project Objective

This document outlines the architecture and implementation of a real-time messaging system for the HeyRafiki platform. The objective is to enable seamless, private communication between clients and experts using Next.js 15, Socket.IO, and MongoDB.

## 2. High-Level Architecture

The system follows a standard client-server model with a dedicated WebSocket server for real-time communication.

- **Frontend (Next.js)**: The client-side application, built with React, connects to the Socket.IO server, sends messages, and displays incoming messages in real-time.
- **Backend (Next.js API Routes / Standalone Server)**: An API layer handles user authentication and persists message history to the database.
- **Socket.IO Server**: Manages persistent WebSocket connections, broadcasts messages to relevant users in real-time, and handles events like typing indicators and message status updates.

**Message Flow:**

1.  User A (Client) sends a message from the frontend.
2.  The message is emitted to the Socket.IO server.
3.  The Socket.IO server sends the message to the backend API to be saved in MongoDB.
4.  The Socket.IO server then broadcasts the message to User B (Expert).
5.  User B's frontend receives the message and displays it instantly.

## 3. Dependencies & Libraries Used

### Frontend

- `socket.io-client`: For connecting to the WebSocket server.
- `tailwindcss`: For utility-first styling.
- `shadcn/ui`: For foundational UI components.
- `tailwind-scrollbar`: For custom scrollbar styling.
- `clsx`: For conditional class name management.
- `zustand`: For global state management (planned).

### Backend

- `socket.io`: The core WebSocket server library.
- `mongoose`: For modeling and interacting with the MongoDB database.
- `next-auth`: For handling user authentication and sessions.

## 4. Schema Design

### `Conversation` Schema

- `members`: `[ObjectId]` (References to `Client` and `Expert` models)
- `lastMessage`: `String`
- `lastMessageAt`: `Date`
- `readBy`: `[ObjectId]` (To track read status)
- `createdAt`: `Date`
- `updatedAt`: `Date`

### `Message` Schema

- `conversationId`: `ObjectId` (Reference to `Conversation`)
- `senderId`: `ObjectId`
- `receiverId`: `ObjectId`
- `content`: `String`
- `status`: `Enum` (`'sent'`, `'delivered'`, `'read'`)
- `timestamp`: `Date`

---

## ✅ Implementation Summary

This section details the progress made on the messaging system UI and initial logic.

### 1. Branch Name Used

- **`feat/messaging-system`**

### 2. Initial Setup

- **Pages Scaffolded**:
  - `niaconnect-clients/app/client/messages/page.tsx`
  - `niaconnect-experts/app/expert/messages/page.tsx`
- **Layout Integration**: The messaging pages use the existing layout shells (`client/layout.tsx` and `expert/layout.tsx`), inheriting the main sidebar and header.

### 3. UI Structure & Components Created

A dedicated folder was created to house all messaging-related UI components:

- **Folder**: `components/messages/`
- **Components**:
  - `ChatSidebar.tsx`: Displays a list of recent conversations.
  - `ChatWindow.tsx`: Renders the messages for the selected conversation.
  - `ChatInput.tsx`: A form for typing and sending messages.
  - `EmptyState.tsx`: A fallback UI for when no chat is selected.

### 4. Styling Guidelines Applied

- **Layout**: Built with Tailwind CSS (`flex`, `grid`).
- **UI Primitives**: Used `shadcn/ui` components (`Card`, `Textarea`, `Button`).
- **HeyRafiki Branding**:
  - Primary green (`#3AB47D`) used for key interactive elements.
  - Consistent rounded corners, hover transitions, and spacing.
- **Responsiveness**: Fully responsive layout with `overflow-y-auto` for scrolling.

### 5. Feature Improvements

- **Custom Scrollbars**: The `tailwind-scrollbar` plugin was added to style scrollbars in `ChatSidebar` and `ChatWindow`.
- **Empty Conversation State**: A placeholder message (`"No messages yet. Say hello to start the conversation!"`) is shown when a chat has no messages.
- **Consistent Hover States**: Background hover colors now match the app's design system (`accent` color).

### 6. Behavior & Logic

- **State Management**: `useState` hook (`selectedChatId`) tracks the active conversation.
- **Conditional Rendering**:
  - `EmptyState` is shown if `selectedChatId` is `null`.
  - The "start conversation" placeholder is shown if a chat has no messages.
- **Data**: The system currently uses mock data for development.

---

## 6. Next Steps / Roadmap

- [ ] Integrate real-time messaging using Socket.IO.
- [ ] Replace `useState` with Zustand or Context for global state management.
- [ ] Set up push notifications or toast alerts for new messages.
- [ ] Add typing indicators and message read-status updates.
- [ ] Connect the UI to the live database instead of mock data.

## 7. Final Notes

- All changes are scoped within `niaconnect-clients` and `niaconnect-experts`.
- The UI implementation is aligned with the provided Figma designs.
- The messaging page respects the existing `layout.tsx` shell, inheriting the main navigation.
