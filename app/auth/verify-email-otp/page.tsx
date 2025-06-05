import VerifyEmailOTP from "@/components/verify-email-otp"

export default function VerifyEmailOTPPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0">
          <img src="/images/girl-hero.webp" alt="Happy woman using phone" className="object-cover w-full h-full" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>

      {/* Right Panel - Verify Email OTP */}
      <VerifyEmailOTP />
    </div>
  )
} 