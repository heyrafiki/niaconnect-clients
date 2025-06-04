"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase } from "lucide-react"
import ExpertStepNavigation from "@/components/onboarding/expert-step-navigation"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

const licenseTypes = [
  "Licensed Clinical Social Worker (LCSW)",
  "Licensed Professional Counselor (LPC)",
  "Licensed Marriage and Family Therapist (LMFT)",
  "Licensed Mental Health Counselor (LMHC)",
  "Psychologist (PhD/PsyD)",
  "Psychiatrist (MD)",
  "Licensed Addiction Counselor (LAC)",
  "Other",
]

const experienceYears = ["0-1 years", "2-5 years", "6-10 years", "11-15 years", "16-20 years", "20+ years"]

const ageGroups = [
  "Children (5-12)",
  "Adolescents (13-17)",
  "Young Adults (18-25)",
  "Adults (26-64)",
  "Seniors (65+)",
  "All Age Groups",
]

const specializationAreas = [
  "Substance Abuse & Addiction",
  "Anxiety",
  "Stress Management",
  "Depression",
  "Relationships & Marriages",
  "Family",
  "Careers Counselling",
  "Grief & Loss",
  "Trauma & PTSD",
  "Self-esteem",
]

export default function ExpertProfessionalBackgroundStep() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [licenseType, setLicenseType] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [yearsOfExperience, setYearsOfExperience] = useState("")
  const [ageGroup, setAgeGroup] = useState("")
  const [specializations, setSpecializations] = useState<string[]>([])

  // Redirect if not authenticated or not an expert
  useEffect(() => {
    if (!isLoading && (!user || user.userType !== "expert")) {
      router.push("/auth/practitioner")
    }
  }, [user, isLoading, router])

  const handleSpecializationToggle = (specialization: string) => {
    setSpecializations((prev) =>
      prev.includes(specialization) ? prev.filter((s) => s !== specialization) : [...prev, specialization],
    )
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
      <div className="text-gray-400 font-secondary font-medium text-right mb-4">STEP 2 OF 3</div>
      <Card className="bg-white shadow-xl rounded-3xl border-0 overflow-hidden">
        <CardContent className="p-8 lg:p-12">
          <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-heyrafiki-green" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Professional Background</h1>
            </div>

            {/* License Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="licenseType" className="text-gray-700 font-secondary font-medium">
                  What type of license do you have?
                </Label>
                <Select value={licenseType} onValueChange={setLicenseType}>
                  <SelectTrigger className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-12 font-secondary">
                    <SelectValue placeholder="Please select your license type" />
                  </SelectTrigger>
                  <SelectContent>
                    {licenseTypes.map((type) => (
                      <SelectItem key={type} value={type} className="font-secondary">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber" className="text-gray-700 font-secondary font-medium">
                  What is your license number
                </Label>
                <Input
                  id="licenseNumber"
                  placeholder="Please enter your license number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-12 font-secondary"
                />
              </div>
            </div>

            {/* Experience and Age Group */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-gray-700 font-secondary font-medium">
                  How many years of experience do you have?
                </Label>
                <Select value={yearsOfExperience} onValueChange={setYearsOfExperience}>
                  <SelectTrigger className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-12 font-secondary">
                    <SelectValue placeholder="Select your years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceYears.map((years) => (
                      <SelectItem key={years} value={years} className="font-secondary">
                        {years}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageGroup" className="text-gray-700 font-secondary font-medium">
                  What age group do you offer services to?
                </Label>
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-12 font-secondary">
                    <SelectValue placeholder="Please select the age group" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroups.map((group) => (
                      <SelectItem key={group} value={group} className="font-secondary">
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Specialization Areas */}
            <div className="space-y-4">
              <Label className="text-gray-700 font-secondary font-medium">What area(s) do you specialize in?</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {specializationAreas.map((area) => (
                  <Button
                    key={area}
                    type="button"
                    variant={specializations.includes(area) ? "default" : "outline"}
                    onClick={() => handleSpecializationToggle(area)}
                    className={`h-auto min-h-[48px] py-2 px-3 text-sm rounded-xl font-secondary text-center whitespace-normal ${
                      specializations.includes(area)
                        ? "bg-heyrafiki-green hover:bg-heyrafiki-green-dark text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-[#f5f5f5]"
                    }`}
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </div>

            <ExpertStepNavigation currentStep={2} totalSteps={3} />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
