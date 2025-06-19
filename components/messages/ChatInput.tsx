import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function ChatInput({
  onSend,
}: {
  onSend?: (msg: string) => void;
}) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend?.(message);
      setMessage("");
    }
  };

  return (
    <div className="w-full bg-white border-t flex items-center gap-2 px-4 py-3 shadow-md rounded-b-xl">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type out something"
        className="flex-1 resize-none border-none focus:ring-0 focus:outline-none bg-gray-50 rounded-lg text-sm min-h-[40px] max-h-24"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <Button
        onClick={handleSend}
        className="ml-2 px-4 py-2 bg-[#3AB47D] hover:bg-[#319e6c] text-white rounded-lg shadow transition-colors"
        size="icon"
        aria-label="Send message"
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path d="M3 20l18-8-18-8v6l14 2-14 2v6z" fill="currentColor" />
        </svg>
      </Button>
    </div>
  );
}
