"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle"
import HeyrafikiLogo from "@/components/HeyrafikiLogo";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimeout, setOtpTimeout] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpTimeout > 0) {
      timer = setTimeout(() => setOtpTimeout(otpTimeout - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpTimeout]);

  const handleRequestOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setOtpSent(true);
      setOtpTimeout(60);
      setSuccess("Verification code sent to your email.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/auth"), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>
      {/* Left Side - Image and Message */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image src="/images/girl-hero.webp" alt="Happy woman using phone" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20" />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-white text-center max-w-lg">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">Reset Your Password</h1>
            <h2 className="text-lg lg:text-xl font-semibold mb-3 font-secondary">For Clients</h2>
            <p className="text-base lg:text-lg opacity-90 font-secondary leading-relaxed">
              Enter your email and a new password. We'll send you a verification code to confirm your identity.
            </p>
          </div>
        </div>
      </div>
      {/* Right Side - Reset Form */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-4 lg:p-8 h-screen overflow-y-auto">
        <div className="absolute inset-0 lg:hidden">
          <Image src="/images/girl-hero.webp" alt="Happy woman using phone" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <Card className="shadow-2xl shadow-[var(--card-shadow)] rounded-3xl">
            <CardHeader className="text-center space-y-2 pb-4">
              <div className="flex justify-center mb-4">
                <HeyrafikiLogo />
              </div>
              <CardTitle className="text-lg font-bold text-foreground/90">Reset Password</CardTitle>
              <CardDescription className="text-gray-600 font-secondary text-sm">
                Enter your email, new password, and the code sent to your email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <form className="space-y-4" onSubmit={handleReset}>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-foreground font-secondary font-medium text-sm">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="border-border focus:border-primary focus:ring-primary rounded-xl h-10 font-secondary text-sm bg-muted" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="newPassword" className="text-foreground font-secondary font-medium text-sm">New Password</Label>
                  <div className="relative">
                    <Input id="newPassword" type={showNewPassword ? "text" : "password"} placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="border-border focus:border-primary focus:ring-primary rounded-xl h-10 font-secondary text-sm bg-muted pr-10" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(v => !v)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-foreground font-secondary font-medium text-sm">Confirm New Password</Label>
                  <div className="relative">
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="border-border focus:border-primary focus:ring-primary rounded-xl h-10 font-secondary text-sm bg-muted pr-10" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="otp" className="text-foreground font-secondary font-medium text-sm">Verification Code</Label>
                  <div className="flex gap-2">
                    <Input id="otp" type="text" placeholder="6-digit code" value={otp} onChange={e => setOtp(e.target.value)} required className="border-border focus:border-primary focus:ring-primary rounded-xl h-10 font-secondary text-sm bg-muted" />
                    <Button type="button" variant="outline" className="text-primary border-primary min-w-[120px]" onClick={handleRequestOtp} disabled={loading || otpTimeout > 0 || !email}>
                      {otpTimeout > 0 ? `Resend (${otpTimeout}s)` : otpSent ? "Resend Code" : "Request Code"}
                    </Button>
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
                <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl font-secondary text-sm">
                  {loading ? "Processing..." : "Reset Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 