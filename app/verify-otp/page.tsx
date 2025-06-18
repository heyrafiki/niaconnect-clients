"use client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { useEffect } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function VerifyOTP() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [otp, setOtp] = useState("");
  const [resendActive, setResendActive] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Resend OTP handler with 60s countdown
  const handleResend = async () => {
    setResendActive(false);
    setResendCountdown(60);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      setSuccess("OTP resent successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!resendActive && resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setResendActive(true);
      setResendCountdown(60);
    }
    return () => clearTimeout(timer);
  }, [resendActive, resendCountdown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!resendActive && resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setResendActive(true);
    }
    return () => clearTimeout(timer);
  }, [resendActive, resendCountdown]);

  // Handler for OTP verification
  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP verification failed");
      
      setSuccess("Email verified! Signing you in...");
      
      // Get password from session storage
      const password = sessionStorage.getItem('temp_auth_password');
      if (!password) {
        throw new Error("Authentication data not found. Please try signing in again.");
      }

      // Sign in directly using NextAuth after verification
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      // Clear temporary auth data
      sessionStorage.removeItem('temp_auth_password');

      // Redirect to onboarding after successful sign in
      router.push("/onboarding/step-1");
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>
      {/* Left Side - Hero Image with Welcome Message (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image src="/images/girl-hero.webp" alt="Happy woman using phone" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20" />
        {/* Welcome Message Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-white text-center max-w-lg">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">Welcome to Heyrafiki</h1>
            <h2 className="text-lg lg:text-xl font-semibold mb-3 font-secondary">
              Support That Feels Like It Gets You
            </h2>
            <p className="text-base lg:text-lg opacity-90 font-secondary leading-relaxed">
              Take charge of your mental well-being through culturally-informed therapy, peer support, and tools that
              adapt to your journey.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - OTP Card, overlays image on mobile/tablet, split on desktop */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-4 lg:p-8 h-screen overflow-y-auto">
        {/* Mobile Background */}
        <div className="absolute inset-0 lg:hidden">
          <Image src="/images/girl-hero.webp" alt="Happy woman using phone" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        {/* OTP Card */}
        <div className="relative z-10 w-full max-w-md"> 
          <Card className="shadow-2xl shadow-[var(--card-shadow)] rounded-3xl">
            {/* Heyrafiki Logo */}
            <CardHeader className="text-center space-y-2 pb-4">
              <div className="flex justify-center mb-4">
                <Image src="/images/heyrafiki-logo.png" alt="Heyrafiki Logo" width={180} height={72} className="h-10 w-auto" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground/90">Verify Your Email</CardTitle>
              <CardDescription className="text-gray-600 font-secondary text-sm">
                Enter the 6-digit code sent to your email to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleVerify();
                }}
                className="flex flex-col gap-6 w-full items-center"
                autoComplete="off"
              >
                {/* Show error if email is missing from query param */}
                {!email && (
                  <div className="w-full text-xs text-center text-red-600 font-medium mb-2">
                    Error: Email is missing from the link. Please use the verification link sent to your email.
                  </div>
                )}
                {/* OTP Input Centered */}
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  className="justify-center gap-2"
                  inputMode="numeric"
                  autoFocus={!!email}
                  style={{ letterSpacing: '0.3em' }}
                >
                  <InputOTPGroup>
                    {[...Array(6)].map((_, i) => (
                      <InputOTPSlot key={i} index={i} className="border-2 border-[#36B37E] focus:border-[#2e9e6f] bg-[var(--card-bg)] text-2xl rounded-xl w-12 h-12 text-center transition-all duration-150" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {error && <div className="w-full text-center text-red-600 font-medium mb-2">{error}</div>}
                {success && <div className="w-full text-center text-green-600 font-medium mb-2">{success}</div>}
                <Button
                  type="submit"
                  className="mt-2 w-full bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-base h-12 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={otp.length !== 6 || !email || loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>Verifying...</span>
                  ) : (
                    "Verify"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full mt-2"
                  onClick={handleResend}
                  disabled={!resendActive}
                >
                  {resendActive ? "Resend OTP" : `Resend in ${resendCountdown}s`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
