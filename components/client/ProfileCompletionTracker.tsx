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
    sections: {
      personalInfo: { completed: 0, total: 0, percentage: 0 },
      therapyDetails: { completed: 0, total: 0, percentage: 0 },
      sessionPreferences: { completed: 0, total: 0, percentage: 0 },
      socialMedia: { completed: 0, total: 0, percentage: 0 },
    },
  });

  useEffect(() => {
    setCompletion(calculateClientProfileCompletion(user));
  }, [user]);

  return (
    <div className="mb-6 p-4 border-border rounded-lg bg-muted">
      <div className="flex justify-between items-center mb-2">
        <Label className="font-semibold">Profile Completion</Label>
        <span className="text-sm text-muted-foreground">
          {completion.completedFields} of {completion.totalFields} fields
          completed
        </span>
      </div>
      <Progress value={completion.percentage} className="w-full mb-4" />
      <div className="text-right text-sm text-muted-foreground mb-4">
        {completion.percentage}%
      </div>

      {/* Section-wise completion */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-sm">Personal Information</Label>
            <span className="text-xs text-muted-foreground">
              {completion.sections.personalInfo.completed}/
              {completion.sections.personalInfo.total}
            </span>
          </div>
          <Progress
            value={completion.sections.personalInfo.percentage}
            className="w-full h-1"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-sm">Therapy Details</Label>
            <span className="text-xs text-muted-foreground">
              {completion.sections.therapyDetails.completed}/
              {completion.sections.therapyDetails.total}
            </span>
          </div>
          <Progress
            value={completion.sections.therapyDetails.percentage}
            className="w-full h-1"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-sm">Session Preferences</Label>
            <span className="text-xs text-muted-foreground">
              {completion.sections.sessionPreferences.completed}/
              {completion.sections.sessionPreferences.total}
            </span>
          </div>
          <Progress
            value={completion.sections.sessionPreferences.percentage}
            className="w-full h-1"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-sm">Social Media</Label>
            <span className="text-xs text-muted-foreground">
              {completion.sections.socialMedia.completed}/
              {completion.sections.socialMedia.total}
            </span>
          </div>
          <Progress
            value={completion.sections.socialMedia.percentage}
            className="w-full h-1"
          />
        </div>
      </div>
    </div>
  );
}
