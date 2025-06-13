"use client";

import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { User } from "@/lib/auth-context"; // Import the base User type

interface ProfileCompletionTrackerProps {
  user: User | null; // Directly use the User type
}

// Helper function to calculate completion percentage for clients
function calculateClientProfileCompletion(user: User | null) {
  if (!user) return { completedFields: 0, totalFields: 0, percentage: 0 };

  const requiredFields = [
    user.firstName, // Use firstName as per User type
    user.lastName, // Use lastName as per User type
    user.email, // Always present for logged-in user
    user.onboarding?.phone_number,
    user.onboarding?.gender,
    user.onboarding?.date_of_birth,
    user.onboarding?.location,
    user.onboarding?.profile_img_url,
    user.onboarding?.therapy_reasons,
    user.onboarding?.session_types,
    user.onboarding?.preferred_times,
  ];

  const completedFields = requiredFields.filter((field) => {
    if (Array.isArray(field)) {
      return field.length > 0; // Check if array has items
    }
    return !!field; // Check for non-empty/non-null/non-undefined values
  }).length;

  const totalFields = requiredFields.length;
  const percentage =
    totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

  return { completedFields, totalFields, percentage };
}

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
