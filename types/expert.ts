export interface Client {
  _id: string;
  first_name: string;
  last_name: string;
  profile_img_url?: string;
}

export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Session {
  _id: string;
  client_id: Client;
  expert_id: string;
  session_type: string;
  reason?: string;
  notes?: string;
  start_time: string;
  end_time: string;
  meeting_url?: string;
  status: SessionStatus;
  feedback?: {
    rating?: number;
    comment?: string;
  };
  created_at: string;
  updated_at: string;
}

export type SessionRequestStatus = 'pending' | 'accepted' | 'declined' | 'rescheduled';

export interface SessionRequest {
  _id: string;
  client_id: Client;
  expert_id: string;
  requested_time: string;
  session_type: string;
  reason?: string;
  status: SessionRequestStatus;
  proposed_alternatives?: string[];
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  _id?: string;
  expert_id: string;
  day_of_week?: number; // 0=Sunday, 6=Saturday
  time_slots: { start_time: string; end_time: string }[];
  is_recurring: boolean;
  date?: string;
  timezone: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExpertFilters {
  specialization: string;
  location: string;
  search: string;
  sessionType: string;
  clientDemographic: string;
  availableDay: string; // Day of week as string (e.g., 'Monday')
  availableTime: string; // Time slot string (e.g., '09:00-12:00')
}

export interface IExpert {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_img_url?: string;
  location?: string;
  onboarding?: {
    completed: boolean;
    specialties?: string[];
    session_types?: string[];
    client_demographics?: string[];
    treatment_modalities?: string[];
    session_rate?: string;
    preferred_times?: string[]; // Note: this is for onboarding, not main availability
    bio?: string;
    license_number?: string;
    license_type?: string;
    years_of_experience?: string;
  };
} 