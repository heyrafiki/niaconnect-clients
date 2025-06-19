import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Mock data for a selected chat
const mockChatUser = {
  id: "2",
  name: "Grace Muthoni",
  avatar: "/avatars/2.png",
  status: "Online",
};

const mockMessages = [
  {
    id: 1,
    sender: "me",
    text: "Hi Grace, how have you been feeling since our last session? Any improvements?",
    time: "3:09PM",
    date: "Thursday",
  },
  {
    id: 2,
    sender: "Grace Muthoni",
    text: "Hi! I've been feeling slightly better, especially with the breathing exercises you taught me.",
    time: "3:00PM",
    date: "Thursday",
  },
];

type ChatWindowProps = {
  chatUser?: typeof mockChatUser;
  messages?: typeof mockMessages;
};

export default function ChatWindow({
  chatUser = mockChatUser,
  messages = mockMessages,
}: ChatWindowProps) {
  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-white">
        <Avatar className="h-10 w-10">
          <AvatarImage src={chatUser.avatar} alt={chatUser.name} />
          <AvatarFallback>{chatUser.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base truncate">
            {chatUser.name}
          </div>
          <div className="text-xs text-[#3AB47D] font-medium">
            {chatUser.status}
          </div>
        </div>
        {/* Placeholder for actions (calendar, menu, etc.) */}
        <div className="flex gap-2">
          <button
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="Calendar"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="4"
                stroke="#3AB47D"
                strokeWidth="2"
              />
              <path
                d="M16 2v4M8 2v4M3 10h18"
                stroke="#3AB47D"
                strokeWidth="2"
              />
            </svg>
          </button>
          <button
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="More"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1.5" fill="#3AB47D" />
              <circle cx="19" cy="12" r="1.5" fill="#3AB47D" />
              <circle cx="5" cy="12" r="1.5" fill="#3AB47D" />
            </svg>
          </button>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50 flex flex-col gap-4">
        {/* Date label */}
        <div className="flex justify-center mb-2">
          <span className="bg-[#E6F7F0] text-[#3AB47D] text-xs px-4 py-1 rounded-full font-medium shadow-sm">
            {messages[0]?.date}
          </span>
        </div>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.sender === "me" ? "flex justify-end" : "flex justify-start"
            }
          >
            <div
              className={
                msg.sender === "me"
                  ? "bg-[#E6F7F0] text-gray-900 rounded-xl rounded-br-none px-4 py-2 max-w-xs shadow-md"
                  : "bg-white text-gray-900 rounded-xl rounded-bl-none px-4 py-2 max-w-xs shadow border"
              }
            >
              <div className="text-sm whitespace-pre-line">{msg.text}</div>
              <div className="text-xs text-gray-400 text-right mt-1">
                {msg.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
