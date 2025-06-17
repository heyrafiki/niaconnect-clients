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

import { calculateClientProfileCompletion } from "@/components/client/profile-completion";

export default function ProfileCompletionModal() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("profile_modal_seen");
    const completion = calculateClientProfileCompletion(user);
    setCompletion(completion);

    // Only show modal if:
    // 1. User is logged in
    // 2. Onboarding is not completed
    // 3. Modal hasn't been seen in this session
    // 4. Profile is not 100% complete
    if (
      user &&
      user.onboarding?.completed === false &&
      !seen &&
      completion.percentage < 100
    ) {
      setOpen(true);
      sessionStorage.setItem("profile_modal_seen", "true");
    }
  }, [user]);

  const handleCompleteNow = () => {
    setOpen(false);
    router.push("/client/profile");
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
            find the right therapist and improves your experience.
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          <span className="font-semibold mr-1">Note:</span> Your profile
          information will be visible to potential therapists.
        </p>

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
