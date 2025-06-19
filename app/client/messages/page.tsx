"use client";
import { useState } from "react";
import ChatSidebar from "@/components/messages/ChatSidebar";
import ChatWindow from "@/components/messages/ChatWindow";
import ChatInput from "@/components/messages/ChatInput";
import EmptyState from "@/components/messages/EmptyState";

export default function MessagesPage() {
  // Mock chat selection state
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // For demo, only one chat has messages
  const hasSelectedChat = selectedChatId === "2";

  return (
    <div className="flex w-full h-[calc(100vh-32px)] min-h-[600px] bg-gray-100 rounded-xl shadow-lg overflow-hidden">
      {/* Left Panel: Sidebar */}
      <div className="w-full md:w-1/3 max-w-xs h-full border-r bg-white">
        <ChatSidebar
          selectedId={selectedChatId || undefined}
          onSelect={setSelectedChatId}
        />
      </div>
      {/* Right Panel: Chat Window or Empty State */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {hasSelectedChat ? (
          <>
            <div className="flex-1 flex flex-col h-0">
              <ChatWindow />
            </div>
            <ChatInput />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
