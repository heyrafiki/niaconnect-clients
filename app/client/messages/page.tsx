"use client";
import { useState } from "react";
import ChatSidebar from "@/components/messages/ChatSidebar";
import ChatWindow from "@/components/messages/ChatWindow";
import ChatInput from "@/components/messages/ChatInput";
import EmptyState from "@/components/messages/EmptyState";

export default function MessagesPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const handleSendMessage = (message: string) => {
    console.log("Sending message:", message);
    // TODO: Implement real-time message sending
  };

  return (
    <div className="-m-4 -mx-6 lg:-m-8">
      <div className="flex w-full h-screen bg-white overflow-hidden">
        {/* Left Panel: Sidebar */}
        <div className="w-[380px] h-full border-r border-gray-100 bg-white hidden md:block">
          <ChatSidebar
            selectedId={selectedChatId}
            onSelect={setSelectedChatId}
          />
        </div>
        {/* Right Panel: Chat Window or Empty State */}
        <div className="flex-1 flex flex-col h-full">
          {selectedChatId ? (
            <>
              <div className="flex-1 flex flex-col h-0 relative">
                <ChatWindow conversationId={selectedChatId} />
              </div>
              <ChatInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
