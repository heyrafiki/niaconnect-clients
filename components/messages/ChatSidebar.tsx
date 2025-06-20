"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Conversation {
  id: string;
  name: string;
  profile_img_url: string;
  lastMessage: string;
  timestamp: string;
  isOnline?: boolean;
  unreadCount?: number;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "John Ndegwa",
    profile_img_url: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "Thank you! I've been practicing the relaxation",
    timestamp: "2 mins ago",
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Grace Muthoni",
    profile_img_url: "https://randomuser.me/api/portraits/women/44.jpg",
    lastMessage: "Hi! I've been feeling slightly better, especially with the",
    timestamp: "10 mins ago",
    isOnline: true,
  },
  {
    id: "3",
    name: "Peter Mwangi",
    profile_img_url: "/placeholder.svg?height=48&width=48",
    lastMessage: "Got it. I'll make sure to update it every evening.",
    timestamp: "25 mins ago",
  },
  {
    id: "4",
    name: "Lucy Wambui",
    profile_img_url: "/placeholder.svg?height=48&width=48",
    lastMessage: "Hi Lucy, can we reschedule our session to Thursday",
    timestamp: "45 mins ago",
  },
  {
    id: "5",
    name: "Samuel Karanja",
    profile_img_url: "/placeholder.svg?height=48&width=48",
    lastMessage: "Good morning Samuel, have you had a chance to try",
    timestamp: "3 hours ago",
  },
  {
    id: "6",
    name: "Mary Waithera",
    profile_img_url: "/placeholder.svg?height=48&width=48",
    lastMessage: "Hi, it's been a tough week, but the stress management",
    timestamp: "1 day ago",
  },
  {
    id: "7",
    name: "David Otieno",
    profile_img_url: "/placeholder.svg?height=48&width=48",
    lastMessage: "Hi David, please remember to bring your completed",
    timestamp: "3 days ago",
  },
];

interface ChatSidebarProps {
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
}

export default function ChatSidebar({
  selectedId,
  onSelect,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = mockConversations.filter(
    (conversation) =>
      conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full transition-colors duration-200"
          >
            <Plus className="h-5 w-5 text-[#256E4D]" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for a conversation"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full min-h-0">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "flex items-center gap-3 px-6 py-4 hover:bg-accent cursor-pointer transition-all duration-200 border-l-2 border-transparent relative",
              selectedId === conversation.id &&
                "bg-blue-50/50 border-l-[#256E4D]"
            )}
          >
            <div className="relative flex-shrink-0">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={conversation.profile_img_url}
                  alt={conversation.name}
                />
                <AvatarFallback className="bg-[#256E4D] text-white">
                  {conversation.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate text-base">
                {conversation.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {conversation.lastMessage}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-xs text-gray-500">
                {conversation.timestamp}
              </span>
              {conversation.unreadCount && (
                <div className="h-5 w-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {conversation.unreadCount}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
