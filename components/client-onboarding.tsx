"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Puzzle, Clock, Smile, Upload } from "lucide-react"

interface OnboardingData {
  // Step 1 - Personal Information
  profilePicture: File | null
  fullName: string
  email: string
  phoneNumber: string
  gender: string

  // Step 2 - Therapy Reasons
  therapyReasons: string[]

  // Step 3 - Session Preferences
  sessionType: string
  preferredTime: string

  // Step 4 - Mental Health Scale
  mentalHealthScale: number | null
}

const therapyReasonOptions = [
  "I've been feeling depressed",
  "I feel anxious or overwhelmed",
  "My mood is interfering with my work/school life",
  "I struggle with building or maintaining relationships",
  "I can't find purpose and meaning in my life",
  "I want to gain self confidence",
  "I want to improve myself but I don't know where to start",
  "I am just exploring",
  "Other",
]

const sessionTypeOptions = ["Online Sessions", "In-person Sessions", "Hybrid Sessions"]

const preferredTimeOptions = ["Morning Hours", "Afternoon", "Evening Hours", "Night Hours"]

const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say", "Other"]

export default function ClientOnboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    profilePicture: null,
    fullName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    therapyReasons: [],
    sessionType: "",
    preferredTime: "",
    mentalHealthScale: null,
  })

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTherapyReasonChange = (reason: string, checked: boolean) => {
    if (checked) {
      updateData({ therapyReasons: [...data.therapyReasons, reason] })
    } else {
      updateData({ therapyReasons: data.therapyReasons.filter((r) => r !== reason) })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      updateData({ profilePicture: file })
    }
  }

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <User className="w-6 h-6 text-heyrafiki-green" />
      case 2:
        return <Puzzle className="w-6 h-6 text-heyrafiki-green" />
      case 3:
        return <Clock className="w-6 h-6 text-heyrafiki-green" />
      case 4:
        return <Smile className="w-6 h-6 text-heyrafiki-green" />
      default:
        return null
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        {getStepIcon(1)}
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Personal Information</h1>
      </div>

      {/* Profile Picture Upload */}
      <div className="space-y-3">
        <Label className="text-gray-700 font-secondary font-medium">Profile Picture</Label>
        <div className="flex items-center space-x-4">
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
              className="border-heyrafiki-green text-heyrafiki-green hover:bg-heyrafiki-green hover:text-white rounded-xl font-secondary"
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
        {data.profilePicture && (
          <div className="text-sm text-heyrafiki-green font-secondary">Selected: {data.profilePicture.name}</div>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-gray-700 font-secondary font-medium">
            Full Name
          </Label>
          <Input
            id="fullName"
            placeholder="Please enter your full name"
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-12 font-secondary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-secondary font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Please enter your email address"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-12 font-secondary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-gray-700 font-secondary font-medium">
            Phone Number
          </Label>
          <Input
            id="phoneNumber"
            placeholder="Please enter your phone number"
            value={data.phoneNumber}
            onChange={(e) => updateData({ phoneNumber: e.target.value })}
            className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-12 font-secondary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="text-gray-700 font-secondary font-medium">
            Gender
          </Label>
          <Select value={data.gender} onValueChange={(value) => updateData({ gender: value })}>
            <SelectTrigger className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-12 font-secondary">
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
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        {getStepIcon(2)}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">What led you to consider therapy today?</h1>
          <p className="text-gray-600 font-secondary mt-2">Select all that apply</p>
        </div>
      </div>

      <div className="space-y-4">
        {therapyReasonOptions.map((reason) => (
          <div key={reason} className="flex items-center space-x-3">
            <Checkbox
              id={reason}
              checked={data.therapyReasons.includes(reason)}
              onCheckedChange={(checked) => handleTherapyReasonChange(reason, checked as boolean)}
              className="border-gray-300 data-[state=checked]:bg-heyrafiki-green data-[state=checked]:border-heyrafiki-green"
            />
            <Label htmlFor={reason} className="text-gray-700 font-secondary cursor-pointer flex-1">
              {reason}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        {getStepIcon(3)}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Session Preferences</h1>
          <p className="text-gray-600 font-secondary mt-2">Select the timings that work well for you</p>
        </div>
      </div>

      {/* Session Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 font-secondary">
          How would you like to have your therapy sessions?
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {sessionTypeOptions.map((option) => (
            <Button
              key={option}
              type="button"
              variant={data.sessionType === option ? "default" : "outline"}
              onClick={() => updateData({ sessionType: option })}
              className={`h-12 rounded-xl font-secondary ${
                data.sessionType === option
                  ? "bg-heyrafiki-green hover:bg-heyrafiki-green-dark text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      {/* Preferred Time */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 font-secondary">
          What time would you like to have your therapy sessions?
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          {preferredTimeOptions.map((option) => (
            <Button
              key={option}
              type="button"
              variant={data.preferredTime === option ? "default" : "outline"}
              onClick={() => updateData({ preferredTime: option })}
              className={`h-12 rounded-xl font-secondary ${
                data.preferredTime === option
                  ? "bg-heyrafiki-green hover:bg-heyrafiki-green-dark text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        {getStepIcon(4)}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">How are you doing?</h1>
          <p className="text-gray-600 font-secondary mt-2">
            On a scale of 1-10, where 1 = I am really struggling and 10 = I am totally okay, over the past month, has
            you mental health interfered with your work life, social life or how you navigate your personal life?
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 py-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
          <Button
            key={number}
            type="button"
            variant={data.mentalHealthScale === number ? "default" : "outline"}
            onClick={() => updateData({ mentalHealthScale: number })}
            className={`w-16 h-16 rounded-xl font-secondary text-lg font-semibold ${
              data.mentalHealthScale === number
                ? "bg-heyrafiki-green hover:bg-heyrafiki-green-dark text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {number}
          </Button>
        ))}
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-heyrafiki-green transform -skew-y-3 origin-top-left"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-heyrafiki-green rounded-full transform translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-heyrafiki-green rounded-full transform translate-x-40 translate-y-40"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <Image
              src="/images/heyrafiki-logo.png"
              alt="Heyrafiki Logo"
              width={180}
              height={72}
              className="h-10 w-auto"
            />
            <div className="text-gray-400 font-secondary font-medium">STEP {currentStep} OF 4</div>
          </div>

          {/* Main Card */}
          <Card className="bg-white shadow-xl rounded-3xl border-0 overflow-hidden">
            <CardContent className="p-8 lg:p-12">
              {renderCurrentStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="px-8 py-3 rounded-full font-secondary font-medium border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous Step
                </Button>

                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStep === 4}
                  className="px-8 py-3 rounded-full font-secondary font-medium bg-heyrafiki-green hover:bg-heyrafiki-green-dark text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStep === 4 ? "Complete" : "Next Step"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
