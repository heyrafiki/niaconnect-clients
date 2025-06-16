// profile-completion.ts
// Shared utility for client profile completion calculation
import { User } from "@/lib/auth-context";

export interface ProfileCompletion {
  completedFields: number;
  totalFields: number;
  percentage: number;
}

export function calculateClientProfileCompletion(user: User | null): ProfileCompletion {
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
    user.onboarding?.therapy_reasons,
    user.onboarding?.session_types,
    user.onboarding?.preferred_times,
    user.onboarding?.bio,
  ];

  const completedFields = requiredFields.filter((field) => {
    if (Array.isArray(field)) {
      return field.length > 0;
    }
    return !!field;
  }).length;

  const totalFields = requiredFields.length;
  const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

  return { completedFields, totalFields, percentage };
}
