"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface ChatWindowProps {
  conversationId: string;
}

const mockMessages: Record<string, Message[]> = {
  "2": [
    {
      id: "1",
      senderId: "therapist",
      senderName: "Dr. Emily Makena",
      content:
        "Hi Grace, how have you been feeling since our last session? Any improvements?",
      timestamp: "3:09PM",
      isCurrentUser: true,
    },
    {
      id: "2",
      senderId: "2",
      senderName: "Grace Muthoni",
      content:
        "Hi! I've been feeling slightly better, especially with the breathing exercises you taught me.",
      timestamp: "3:00PM",
      isCurrentUser: false,
    },
  ],
};

const conversationDetails: Record<
  string,
  { name: string; profile_img_url: string; isOnline: boolean }
> = {
  "1": {
    name: "John Ndegwa",
    profile_img_url: "https://randomuser.me/api/portraits/men/32.jpg",
    isOnline: false,
  },
  "2": {
    name: "Grace Muthoni",
    profile_img_url: "https://randomuser.me/api/portraits/women/44.jpg",
    isOnline: true,
  },
  "3": {
    name: "Peter Mwangi",
    profile_img_url: "/placeholder.svg?height=40&width=40",
    isOnline: false,
  },
  "4": {
    name: "Lucy Wambui",
    profile_img_url: "/placeholder.svg?height=40&width=40",
    isOnline: false,
  },
  "5": {
    name: "Samuel Karanja",
    profile_img_url: "/placeholder.svg?height=40&width=40",
    isOnline: false,
  },
  "6": {
    name: "Mary Waithera",
    profile_img_url: "/placeholder.svg?height=40&width=40",
    isOnline: false,
  },
  "7": {
    name: "David Otieno",
    profile_img_url: "/placeholder.svg?height=40&width=40",
    isOnline: false,
  },
  "8": {
    name: "Faith Njeri",
    profile_img_url: "/placeholder.svg?height=40&width=40",
    isOnline: false,
  },
};

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const messages = mockMessages[conversationId] || [];
  const conversation = conversationDetails[conversationId];

  if (!conversation) {
    return <div className="flex-1 bg-gray-50" />;
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={conversation.profile_img_url || "/placeholder.svg"}
                alt={conversation.name}
              />
              <AvatarFallback className="bg-[#256E4D] text-white">
                {conversation.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {conversation.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{conversation.name}</h3>
            <p className="text-sm text-green-600">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 transition-colors duration-200"
          >
            <Archive className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 transition-colors duration-200"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
        {messages.length > 0 ? (
          <>
            {/* Date Separator */}
            <div className="flex justify-center">
              <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                Thursday
              </span>
            </div>

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 max-w-[80%]",
                  message.isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {!message.isCurrentUser && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage
                      src={conversation.profile_img_url || "/placeholder.svg"}
                      alt={message.senderName}
                    />
                    <AvatarFallback className="bg-[#256E4D] text-white text-xs">
                      {message.senderName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "flex flex-col gap-1",
                    message.isCurrentUser ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-2 rounded-2xl max-w-md",
                      message.isCurrentUser
                        ? "bg-[#256E4D] text-white rounded-br-md"
                        : "bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <span className="text-xs text-gray-500 px-2">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-500">
              <p className="font-semibold text-lg">No messages yet</p>
              <p className="text-sm">
                Start the conversation with {conversation.name}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
