"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Upload } from "lucide-react"
import ExpertStepNavigation from "@/components/onboarding/expert-step-navigation"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { generateAvatarUrl } from "@/lib/avatar-utils"
import Image from "next/image"

const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say", "Other"]

export default function ExpertPersonalInformationStep() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [gender, setGender] = useState("")

  // Redirect if not authenticated or not an expert
  useEffect(() => {
    if (!isLoading && (!user || user.userType !== "expert")) {
      router.push("/auth/practitioner")
    }
  }, [user, isLoading, router])

  // Pre-fill data from auth context
  useEffect(() => {
    if (user) {
      // Pre-fill name from signup
      setFullName(`${user.firstName} ${user.lastName}`)
      setEmail(user.email)

      // Generate avatar placeholder
      if (!user.avatar) {
        const generatedAvatar = generateAvatarUrl(user.firstName, user.lastName)
        setAvatarUrl(generatedAvatar)
      } else {
        setAvatarUrl(user.avatar)
      }
    }
  }, [user])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      // Create a local URL for preview
      const objectUrl = URL.createObjectURL(file)
      setAvatarUrl(objectUrl)
    }
  }

  if (isLoading || !user || user.userType !== "expert") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-heyrafiki-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="text-gray-400 font-secondary font-medium text-right mb-4">STEP 1 OF 3</div>
      <Card className="bg-white shadow-xl rounded-3xl border-0 overflow-hidden">
        <CardContent className="p-8 lg:p-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <User className="w-6 h-6 text-heyrafiki-green" />
              </div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Personal Information</h1>
            </div>

            {/* Profile Picture Upload with Preview */}
            <div className="space-y-3">
              <Label className="text-sm text-gray-700 font-secondary font-medium">Profile Picture</Label>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar Preview */}
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-heyrafiki-green">
                  {avatarUrl && (
                    <Image src={avatarUrl || "/placeholder.svg"} alt="Profile avatar" fill className="object-cover" />
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
                      className="border-heyrafiki-green text-heyrafiki-green hover:bg-whitesmoke hover:text-gray-900 rounded-xl font-secondary"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
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
                <Label htmlFor="fullName" className="text-sm text-gray-700 font-secondary font-medium">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="Please enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-12 font-secondary bg-[#f5f5f5]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-700 font-secondary font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Please enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-12 font-secondary bg-[#f5f5f5]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm text-gray-700 font-secondary font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="Please enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-12 font-secondary bg-[#f5f5f5]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm text-gray-700 font-secondary font-medium">
                  Gender
                </Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-12 font-secondary bg-[#f5f5f5]">
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
            </div>

            <ExpertStepNavigation currentStep={1} totalSteps={3} />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
