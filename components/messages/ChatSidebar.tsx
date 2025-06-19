import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Mock data for conversations
const conversations = [
  {
    id: "1",
    name: "John Ndegwa",
    avatar: "/avatars/1.png",
    lastMessage: "Thank you! I've been practicing the relaxation",
    time: "2 mins ago",
    unread: true,
  },
  {
    id: "2",
    name: "Grace Muthoni",
    avatar: "/avatars/2.png",
    lastMessage:
      "Hi! I've been feeling slightly better, especially with the...",
    time: "10 mins ago",
    unread: false,
  },
  {
    id: "3",
    name: "Peter Mwangi",
    avatar: "/avatars/3.png",
    lastMessage: "Got it. I'll make sure to update it every evening.",
    time: "25 mins ago",
    unread: false,
  },
  {
    id: "4",
    name: "Lucy Wambui",
    avatar: "/avatars/4.png",
    lastMessage: "Hi Lucy, can we reschedule our session to Thursday",
    time: "45 mins ago",
    unread: false,
  },
  // ...add more mock conversations as needed
];

type ChatSidebarProps = {
  selectedId?: string;
  onSelect: (id: string) => void;
};

export default function ChatSidebar({
  selectedId,
  onSelect,
}: ChatSidebarProps) {
  return (
    <aside className="w-full md:w-1/3 max-w-xs h-full bg-white border-r shadow-md flex flex-col">
      <div className="p-4 pb-2 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Messages</h2>
        <button
          className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          aria-label="New conversation"
        >
          <span className="text-2xl text-[#3AB47D]">+</span>
        </button>
      </div>
      <div className="px-4 py-2">
        <input
          type="text"
          placeholder="Search for a conversation"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3AB47D] bg-gray-50 text-sm"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <Card
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 mb-1 cursor-pointer transition-all border border-transparent",
              selectedId === conv.id
                ? "bg-[#E6F7F0] border-[#3AB47D] shadow-sm"
                : "hover:bg-gray-50"
            )}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={conv.avatar} alt={conv.name} />
              <AvatarFallback>{conv.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm truncate">
                  {conv.name}
                </span>
                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                  {conv.time}
                </span>
              </div>
              <div className="text-xs text-gray-600 truncate">
                {conv.lastMessage}
              </div>
            </div>
            {conv.unread && (
              <span className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-[#3AB47D] text-white text-xs font-bold">
                2
              </span>
            )}
          </Card>
        ))}
      </div>
    </aside>
  );
}
