"use client";

import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { User } from "@/lib/auth-context"; // Import the base User type

interface ProfileCompletionTrackerProps {
  user: User | null; // Directly use the User type
}

import { calculateClientProfileCompletion } from "@/components/client/profile-completion";
export default function ProfileCompletionTracker({
  user,
}: ProfileCompletionTrackerProps) {
  const [completion, setCompletion] = useState({
    completedFields: 0,
    totalFields: 0,
    percentage: 0,
  });

  useEffect(() => {
    setCompletion(calculateClientProfileCompletion(user));
  }, [user]);

  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <Label className="font-semibold">Profile Completion</Label>
        <span className="text-sm text-gray-600">
          {completion.completedFields} of {completion.totalFields} fields
          completed
        </span>
      </div>
      <Progress value={completion.percentage} className="w-full" />
      <div className="text-right text-sm text-gray-600 mt-1">
        {completion.percentage}%
      </div>
    </div>
  );
}
