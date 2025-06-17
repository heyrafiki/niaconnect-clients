// profile-completion.ts
// Shared utility for client profile completion calculation
import { User } from "@/lib/auth-context";

export interface ProfileCompletion {
  completedFields: number;
  totalFields: number;
  percentage: number;
  sections: {
    personalInfo: { completed: number; total: number; percentage: number };
    therapyDetails: { completed: number; total: number; percentage: number };
    sessionPreferences: {
      completed: number;
      total: number;
      percentage: number;
    };
    socialMedia: { completed: number; total: number; percentage: number };
  };
}

export function calculateClientProfileCompletion(
  user: User | null
): ProfileCompletion {
  if (!user)
    return {
      completedFields: 0,
      totalFields: 0,
      percentage: 0,
      sections: {
        personalInfo: { completed: 0, total: 0, percentage: 0 },
        therapyDetails: { completed: 0, total: 0, percentage: 0 },
        sessionPreferences: { completed: 0, total: 0, percentage: 0 },
        socialMedia: { completed: 0, total: 0, percentage: 0 },
      },
    };

  // Personal Information Section
  const personalInfoFields = [
    user.firstName,
    user.lastName,
    user.email,
    user.onboarding?.phone_number,
    user.onboarding?.location,
    user.onboarding?.postal_address,
    user.onboarding?.profile_img_url,
  ];

  // Therapy Details Section
  const therapyDetailsFields = [
    user.onboarding?.therapy_reasons,
    user.onboarding?.bio,
  ];

  // Session Preferences Section
  const sessionPreferencesFields = [
    user.onboarding?.session_types,
    user.onboarding?.preferred_times,
  ];

  // Social Media Section
  const socialMediaFields = [
    user.onboarding?.social_media?.instagram,
    user.onboarding?.social_media?.linkedin,
    user.onboarding?.social_media?.twitter,
    user.onboarding?.social_media?.facebook,
  ];

  // Helper function to calculate section completion
  const calculateSectionCompletion = (fields: any[]) => {
    const completed = fields.filter((field) => {
      if (Array.isArray(field)) {
        return field.length > 0;
      }
      return !!field;
    }).length;
    const total = fields.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  // Calculate completion for each section
  const personalInfo = calculateSectionCompletion(personalInfoFields);
  const therapyDetails = calculateSectionCompletion(therapyDetailsFields);
  const sessionPreferences = calculateSectionCompletion(
    sessionPreferencesFields
  );
  const socialMedia = calculateSectionCompletion(socialMediaFields);

  // Calculate overall completion
  const allFields = [
    ...personalInfoFields,
    ...therapyDetailsFields,
    ...sessionPreferencesFields,
    ...socialMediaFields,
  ];

  const completedFields = allFields.filter((field) => {
    if (Array.isArray(field)) {
      return field.length > 0;
    }
    return !!field;
  }).length;

  const totalFields = allFields.length;
  const percentage =
    totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

  return {
    completedFields,
    totalFields,
    percentage,
    sections: {
      personalInfo,
      therapyDetails,
      sessionPreferences,
      socialMedia,
    },
  };
}
