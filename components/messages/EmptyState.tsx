import { Card } from "@/components/ui/card";

export default function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center h-full w-full bg-white">
      <Card className="flex flex-col items-center justify-center p-8 rounded-xl shadow-md border-dashed border-2 border-[#3AB47D] max-w-md w-full">
        {/* Chatbot Illustration Placeholder */}
        <div className="mb-6">
          <svg
            width="140"
            height="140"
            viewBox="0 0 140 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="70" cy="70" r="70" fill="#E6F7F0" />
            <ellipse cx="70" cy="90" rx="40" ry="10" fill="#C2EBDD" />
            <rect x="40" y="50" width="60" height="40" rx="20" fill="#3AB47D" />
            <circle cx="70" cy="70" r="10" fill="white" />
            <circle cx="60" cy="68" r="2" fill="#222" />
            <circle cx="80" cy="68" r="2" fill="#222" />
            <rect x="65" y="75" width="10" height="3" rx="1.5" fill="#222" />
            <rect x="66" y="40" width="8" height="12" rx="4" fill="#3AB47D" />
            <circle
              cx="70"
              cy="40"
              r="3"
              fill="#3AB47D"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="text-xl font-semibold text-[#3AB47D] mb-2">
          No Selected Chat
        </div>
        <div className="text-gray-500 text-center text-sm max-w-xs">
          Click on a chat from the list on the left to view and respond to
          messages. Stay connected and manage your conversations effortlessly.
        </div>
      </Card>
    </div>
  );
}
