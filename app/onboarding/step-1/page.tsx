"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Upload } from "lucide-react"
import StepNavigation from "@/components/onboarding/step-navigation"
import { useRouter } from "next/navigation"
import { generateAvatarUrl } from "@/lib/avatar-utils"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useAuth } from "@/lib/auth-context"

const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say", "Other"]
const countryOptions = [
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Ethiopia",
  "Nigeria",
  "South Africa",
  "Ghana",
  "Other"
]

export default function PersonalInformationStep() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { data: session, status } = useSession();
  const router = useRouter()

  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneError, setPhoneError] = useState<string>("")
  const [gender, setGender] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [location, setLocation] = useState("")
  const [locationError, setLocationError] = useState<string>("")
  const [formTouched, setFormTouched] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)

  // Wait for session/context to load, then redirect if truly unauthenticated
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qpFirst = params.get("first_name");
    const qpLast = params.get("last_name");
    const qpEmail = params.get("email");
    const sessionUser = session?.user;

    // Wait for both session and auth context to be ready
    if (!isAuthLoading && status !== "loading") {
      if (
        status === "unauthenticated" &&
        !sessionUser &&
        !user &&
        !(qpFirst && qpLast && qpEmail)
      ) {
        router.push("/auth");
      }
    }
  }, [user, status, session, isAuthLoading, router]);

  // Restore onboarding state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("onboarding_step1");
    if (saved) {
      try {
        const { data, expires } = JSON.parse(saved);
        if (Date.now() < expires) {
          setPhoneNumber(data.phoneNumber || "");
          setGender(data.gender || "");
          setDateOfBirth(data.dateOfBirth || "");
          setLocation(data.location || "");
          setAvatarUrl(data.profile_img_url || "");
        } else {
          localStorage.removeItem("onboarding_step1");
        }
      } catch {}
    }
  }, []);

  // Pre-fill from session, context, or query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qpFirst = params.get("first_name");
    const qpLast = params.get("last_name");
    const qpEmail = params.get("email");
    const sessionUser = session?.user;

    let fullName = "";
    let email = "";
    let avatar = "";

    if (sessionUser) {
      // Credentials sign-in (preferred)
      if (
        typeof sessionUser === "object" &&
        ("first_name" in sessionUser || "last_name" in sessionUser)
      ) {
        const safeFirst = (sessionUser as any).first_name ?? "";
        const safeLast = (sessionUser as any).last_name ?? "";
        fullName = `${safeFirst} ${safeLast}`.trim();
        email = sessionUser.email ?? "";
        avatar = generateAvatarUrl(safeFirst, safeLast);
      } else if (sessionUser.name) {
        // Google OAuth
        const parts = sessionUser.name.split(" ");
        const safeFirst = parts[0] ?? "";
        const safeLast = parts.slice(1).join(" ") ?? "";
        fullName = `${safeFirst} ${safeLast}`.trim();
        email = sessionUser.email ?? "";
        avatar = sessionUser.image || generateAvatarUrl(safeFirst, safeLast);
      }
    } else if (user) {
      // Auth context (email/password, immediate login)
      const safeFirst = user.firstName ?? "";
      const safeLast = user.lastName ?? "";
      fullName = `${safeFirst} ${safeLast}`.trim();
      email = user.email ?? "";
      avatar = user.avatar || generateAvatarUrl(safeFirst, safeLast);
    } else if (qpFirst && qpLast && qpEmail) {
      // From query params
      fullName = `${qpFirst} ${qpLast}`;
      email = qpEmail;
      avatar = generateAvatarUrl(qpFirst, qpLast);
    } else {
      // Fallback: show 'User' and empty email
      fullName = "User";
      email = "";
      avatar = generateAvatarUrl("User", "");
    }

    setFullName(fullName);
    setEmail(email);
    setAvatarUrl(avatar);
  }, [session, user]);

  // Save onboarding state to localStorage on change
  useEffect(() => {
    if (!formTouched) return;
    localStorage.setItem("onboarding_step1", JSON.stringify({
      data: {
        phoneNumber,
        gender,
        dateOfBirth,
        location,
        profile_img_url: avatarUrl
      },
      expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    }));
  }, [phoneNumber, gender, dateOfBirth, location, avatarUrl, formTouched]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      // Create a local URL for preview
      const objectUrl = URL.createObjectURL(file)
      setAvatarUrl(objectUrl)
    }
  }

  // Show loading spinner if session or context is loading
  if (status === "loading" || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-gray-400 font-secondary font-medium text-right mb-4">STEP 1 OF 4</div>
      <Card className="bg-[var(--card-bg)] shadow-xl shadow-[var(--card-shadow)] rounded-3xl border-0 overflow-hidden">
        <CardContent className="p-8 lg:p-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground/90">Personal Information</h1>
            </div>

            {/* Profile Picture Upload with Preview */}
            <div className="space-y-3">
              <Label className="text-foreground font-secondary font-medium text-sm">Profile Picture</Label>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar Preview */}
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                  {avatarUrl && (
                    <Image 
                      src={avatarUrl} 
                      alt="Profile avatar" 
                      fill 
                      className="object-cover"
                      unoptimized={avatarUrl.startsWith('http')} // Skip optimization for external URLs
                    />
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <input
                      type="file"
                      id="profilePicture"
                      accept=".png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("profilePicture")?.click()}
                      className="border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-secondary bg-whitesmoke"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change Image
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500 font-secondary">
                    <div>Supported file types: .png, .jpeg</div>
                    <div>File Size: 2MB max</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground/80 font-secondary font-medium text-sm">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="Full name"
                  value={fullName}
                  readOnly
                  className="border-border focus:border-primary focus:ring-primary rounded-xl h-12 font-secondary bg-muted opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Full name is set from your account and cannot be changed.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80 font-secondary font-medium text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  readOnly
                  className="border-border focus:border-primary focus:ring-primary rounded-xl h-12 font-secondary bg-muted opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email is set from your account and cannot be changed.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-foreground/80 font-secondary font-medium text-sm">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="e.g. +254712345678"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setPhoneError("");
                    setFormTouched(true);
                  }}
                  onBlur={() => {
                    if (phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
                      setPhoneError("Invalid phone number format. Use international format e.g. +254712345678");
                    }
                  }}
                  className={`border-border focus:border-primary focus:ring-primary rounded-xl h-12 font-secondary bg-muted ${phoneError ? 'border-red-500' : ''}`}
                />
                {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-foreground/80 font-secondary font-medium text-sm">
                  Gender
                </Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="border-border focus:border-primary focus:ring-primary rounded-xl h-12 font-secondary">
                    <SelectValue placeholder="Please select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option} value={option} className="font-secondary">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-foreground/80 font-secondary font-medium text-sm">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="border-border focus:border-primary focus:ring-primary rounded-xl h-12 font-secondary bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground/80 font-secondary font-medium text-sm">
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="City, State/County, Country"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setFormTouched(true);
                  }}
                  className="border-border focus:border-primary focus:ring-primary rounded-xl h-12 font-secondary bg-muted"
                />
                <button type="button" className="text-xs text-blue-600 underline mt-1" onClick={async () => {
                  setLoadingLocation(true);
                  setLocationError("");
                  if (!navigator.geolocation) {
                    setLocationError("Geolocation is not supported by your browser.");
                    setLoadingLocation(false);
                    return;
                  }
                  navigator.geolocation.getCurrentPosition(async (pos) => {
                    try {
                      const { latitude, longitude } = pos.coords;
                      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                      if (!res.ok) throw new Error("Failed to fetch location");
                      const data = await res.json();
                      const city = data.address.city || data.address.town || data.address.village || "";
                      const state = data.address.state || data.address.county || "";
                      const country = data.address.country || "";
                      const loc = [city, state, country].filter(Boolean).join(", ");
                      setLocation(loc);
                      setFormTouched(true);
                    } catch {
                      setLocationError("Could not determine location. Please enter manually.");
                    } finally {
                      setLoadingLocation(false);
                    }
                  }, (err) => {
                    setLocationError("Location permission denied or unavailable.");
                    setLoadingLocation(false);
                  });
                }} disabled={loadingLocation}>
                  {loadingLocation ? 'Autofilling...' : 'Autofill Location'}
                </button>
                {locationError && <p className="text-xs text-red-500 mt-1">{locationError}</p>}
              </div>
            </div>

            <StepNavigation
  currentStep={1}
  totalSteps={4}
  disableNext={
    !fullName ||
    !email ||
    !phoneNumber ||
    !!phoneError ||
    !gender ||
    !dateOfBirth ||
    !location ||
    !!locationError
  }
/>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
