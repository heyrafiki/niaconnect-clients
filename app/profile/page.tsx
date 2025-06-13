"use client";

import { useAuth } from "@/lib/auth-context";
import ProfileForm from "@/components/client/ProfileForm";
import ProfileCompletionTracker from "@/components/client/ProfileCompletionTracker";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Client Profile</h1>
      <ProfileCompletionTracker user={user} />
      <ProfileForm />
    </div>
  );
}
