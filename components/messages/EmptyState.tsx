import { Card } from "@/components/ui/card";

export default function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center h-full w-full bg-white">
      <Card className="flex flex-col items-center justify-center p-8 rounded-2xl max-w-md mx-8">
        {/* Chatbot Illustration */}
        <div className="mb-6">
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="80" cy="80" r="80" fill="#E6F7F0" />
            <ellipse cx="80" cy="120" rx="40" ry="8" fill="#C2EBDD" />
            <path
              d="M50 70C50 58.9543 58.9543 50 70 50H90C101.046 50 110 58.9543 110 70V90C110 101.046 101.046 110 90 110H70C58.9543 110 50 101.046 50 90V70Z"
              fill="#3AB47D"
            />
            <circle cx="80" cy="80" r="12" fill="white" />
            <circle cx="68" cy="78" r="2.5" fill="#222" />
            <circle cx="92" cy="78" r="2.5" fill="#222" />
            <path
              d="M75 86C75 86 77 88 80 88C83 88 85 86 85 86"
              stroke="#222"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect x="76" y="36" width="8" height="16" rx="4" fill="#3AB47D" />
            <circle
              cx="80"
              cy="36"
              r="4"
              fill="#3AB47D"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="text-xl font-semibold text-[#3AB47D] mb-2">
          No Selected Chat
        </div>
        <div className="text-gray-600 text-center text-sm leading-relaxed max-w-sm">
          Click on a chat from the list on the left to view and respond to
          messages. Stay connected and manage your conversations effortlessly.
        </div>
      </Card>
    </div>
  );
}
