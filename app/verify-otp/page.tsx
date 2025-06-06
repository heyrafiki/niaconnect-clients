"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

import { useEffect } from "react";

export default function VerifyOTP() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [resendActive, setResendActive] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(60);

  // Resend OTP handler with 60s countdown
  const handleResend = () => {
    setResendActive(false);
    setResendCountdown(60);
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

  // Dummy handler for verify
  const handleVerify = () => {
    router.push("/onboarding");
  };

  return (
    <div className="h-screen flex overflow-hidden">
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
        <div className="relative z-10 w-full max-w-md rounded-3xl shadow-2xl p-8 bg-[#f3fcf8] border-2 border-[#36B37E]/20 flex flex-col items-center bg-opacity-95">
          {/* Heyrafiki Logo */}
          <div className="flex justify-center mb-6">
            <Image src="/images/heyrafiki-logo.png" alt="Heyrafiki Logo" width={180} height={72} className="h-10 w-auto" priority />
          </div>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleVerify();
            }}
            className="flex flex-col gap-6 w-full items-center"
            autoComplete="off"
          >
            <div className="text-center w-full">
              <h2 className="text-2xl font-bold text-[#36B37E] mb-1">Verify Your Email</h2>
              <p className="text-gray-700 text-base mb-4">Enter the 6-digit code sent to your email to continue.</p>
            </div>
            {/* OTP Input Centered */}
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              className="justify-center gap-2"
              inputMode="numeric"
              autoFocus
              style={{ letterSpacing: '0.3em' }}
            >
              <InputOTPGroup>
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot key={i} index={i} className="border-2 border-[#36B37E] focus:border-[#2e9e6f] bg-white text-2xl rounded-xl w-12 h-12 text-center transition-all duration-150" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <Button
              type="submit"
              className="mt-2 w-full bg-[#36B37E] hover:bg-[#2e9e6f] text-white font-semibold rounded-xl text-base h-12 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={otp.length !== 6}
            >
              Verify
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
        </div>
      </div>
    </div>
  );
}
