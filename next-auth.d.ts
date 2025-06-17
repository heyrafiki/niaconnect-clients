import { DefaultSession, DefaultUser } from "next-auth";
import "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      avatar?: string;
      isOnboarded?: boolean;
      onboarding?: {
        completed?: boolean;
        phone_number?: string;
        gender?: string;
        date_of_birth?: string;
        location?: string;
        profile_img_url?: string;
        therapy_reasons?: string[];
        session_types?: string[];
        preferred_times?: string[];
        mental_health_scale?: number;
        postal_address?: string;
      };
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    avatar?: string;
    isOnboarded?: boolean;
    onboarding?: {
      completed?: boolean;
      phone_number?: string;
      gender?: string;
      date_of_birth?: string;
      location?: string;
      profile_img_url?: string;
      therapy_reasons?: string[];
      session_types?: string[];
      preferred_times?: string[];
      mental_health_scale?: number;
      postal_address?: string;
    };
  }
}
