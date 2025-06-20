"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useState, KeyboardEvent } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full bg-white border-t border-gray-200 flex items-end gap-2 p-4">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="flex-1 resize-none border-gray-200 focus:ring-[#256E4D] focus:border-transparent min-h-[44px] py-3 px-4"
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim()}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2.5 h-auto transition-colors duration-200"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}
