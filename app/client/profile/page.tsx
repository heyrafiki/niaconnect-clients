"use client";

import { useAuth } from "@/lib/auth-context";
import ProfileForm from "@/components/client/ProfileForm";
import ProfileCompletionTracker from "@/components/client/ProfileCompletionTracker";

export default function ClientProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Client Profile</h1>
      <ProfileCompletionTracker user={user} />
      <ProfileForm />
    </div>
  );
}
