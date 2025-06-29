"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  isOnboarded?: boolean;
  provider?: "email" | "google";
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
    social_media?: {
      instagram?: string;
      linkedin?: string;
      twitter?: string;
      facebook?: string;
    };
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type SessionUser = {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar?: string;
  onboarding?: any;
  provider?: string;
  sub?: string;
};

function getProvider(sUser: SessionUser): "email" | "google" {
  if (sUser.provider === "google" || sUser.sub) return "google";
  return "email";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const sUser = session.user as SessionUser;
      setUser({
        id: sUser.id as string,
        firstName: sUser.first_name || "",
        lastName: sUser.last_name || "",
        email: sUser.email || "",
        avatar: sUser.avatar || "",
        isOnboarded: sUser.onboarding?.completed || false,
        onboarding: sUser.onboarding || undefined,
        provider: getProvider(sUser),
      });
    } else if (status === "unauthenticated") {
      setUser(null);
    }
    setIsLoading(false);
  }, [session, status]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (
          data.error === "Email not verified. Please verify your email via OTP."
        ) {
          // Store password temporarily in session storage
          sessionStorage.setItem("temp_auth_password", password);
          router.push(
            "/verify-otp?email=" + encodeURIComponent(email) + "&from=signin"
          );
          return;
        }
        throw new Error(data.error || "Signin failed");
      }
      const user = data.user;
      setUser({
        id: user.id,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email,
        isOnboarded: user.onboarding?.completed || false,
        onboarding: user.onboarding || undefined,
        provider: "email",
      });
      // Clear any temporary auth data
      sessionStorage.removeItem("temp_auth_password");

      // --- Set NextAuth session cookie for backend authentication ---
      if (user.is_verified) {
        const { signIn } = await import("next-auth/react");
        await signIn("credentials", {
          email,
          password,
          first_name: user.first_name,
          last_name: user.last_name,
          redirect: false,
        });
      }
      // ---

      if (!user.is_verified) {
        router.push(
          "/verify-otp?email=" + encodeURIComponent(user.email) + "&from=signin"
        );
      } else if (!user.onboarding?.completed) {
        router.push("/onboarding/step-1");
      } else {
        router.push("/client/dashboard");
      }
    } catch (error: any) {
      alert(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      // Store password temporarily in session storage
      sessionStorage.setItem("temp_auth_password", password);

      setUser({
        id: data.user.id,
        firstName,
        lastName,
        email,
        isOnboarded: false,
        provider: "email",
      });
      // Do NOT call signIn here, as user must verify OTP first
      router.push(
        "/verify-otp?email=" + encodeURIComponent(email) + "&from=signup"
      );
    } catch (error: any) {
      alert(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
