"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Progress } from "@/components/ui/progress";

function isProfileIncomplete(user: any) {
  if (!user) return false;
  // Current simplified check. This will be more accurate with the tracker logic.
  return !user.firstName || !user.lastName || !user.onboarding?.completed;
}

// Helper function (duplicate from ProfileCompletionTracker for modal's internal calculation)
function calculateClientProfileCompletionForModal(user: any) {
  if (!user) return { completedFields: 0, totalFields: 0, percentage: 0 };

  const requiredFields = [
    user.firstName,
    user.lastName,
    user.email,
    user.onboarding?.phone_number,
    user.onboarding?.gender,
    user.onboarding?.date_of_birth,
    user.onboarding?.location,
    user.onboarding?.profile_img_url,
  ];

  const completedFields = requiredFields.filter((field) => {
    if (Array.isArray(field)) {
      return field.length > 0;
    }
    return !!field;
  }).length;

  const totalFields = requiredFields.length;
  const percentage =
    totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

  return { completedFields, totalFields, percentage };
}

export default function ProfileCompletionModal() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [completion, setCompletion] = useState({
    completedFields: 0,
    totalFields: 0,
    percentage: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("profile_modal_seen");
    // Only show if user exists, profile is incomplete, and not seen this session
    if (user && isProfileIncomplete(user) && !seen) {
      setOpen(true);
      sessionStorage.setItem("profile_modal_seen", "true");
    }
  }, [user]);

  useEffect(() => {
    setCompletion(calculateClientProfileCompletionForModal(user));
  }, [user]);

  const handleCompleteNow = () => {
    setOpen(false);
    router.push("/profile");
  };

  const handleLater = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] p-6 text-center">
        <DialogHeader className="space-y-4 mb-4">
          {/* Circular Progress Placeholder - Visual representation of percentage */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-gray-200 text-heyrafiki-green border-2 border-heyrafiki-green">
              <span className="text-3xl font-bold font-sans">
                {completion.percentage}%
              </span>
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold font-sans">
            Complete your profile.
          </DialogTitle>
          <DialogDescription className="text-base text-gray-700 mx-auto max-w-sm">
            To make the most of our platform, please complete your profile by
            adding all necessary details. A fully completed profile helps you
            stand out and improves your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm text-gray-600 mt-4 flex items-center justify-center">
          <span className="mr-2 text-red-500">&#9733;</span>
          <span className="font-semibold mr-1">Note:</span> Your education
          background and work experience contribute to the profile completion
          percentage.
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-center gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleLater}
            className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <span className="mr-2">&#x2715;</span> Later
          </Button>
          <Button
            onClick={handleCompleteNow}
            className="w-full sm:w-auto bg-heyrafiki-green text-white hover:bg-heyrafiki-green-dark"
          >
            Complete <span className="ml-2">&rarr;</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
