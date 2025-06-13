"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function ProfileForm() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.onboarding?.phone_number || "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [therapyReasons, setTherapyReasons] = useState(
    user?.onboarding?.therapy_reasons?.join(", ") || ""
  );
  const [sessionTypes, setSessionTypes] = useState(
    user?.onboarding?.session_types?.join(", ") || ""
  );
  const [preferredTimes, setPreferredTimes] = useState(
    user?.onboarding?.preferred_times?.join(", ") || ""
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    const profileData = {
      firstName,
      lastName,
      phone,
      avatar,
      password: password || undefined,
      therapyReasons: therapyReasons
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      sessionTypes: sessionTypes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      preferredTimes: preferredTimes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    console.log("Saving client profile:", profileData);
    toast({
      title: "Profile saved successfully!",
      description: "Your profile has been updated.",
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-20 h-20">
          {avatar ? (
            <AvatarImage src={avatar} alt="Avatar preview" />
          ) : (
            <AvatarFallback>
              {firstName?.[0] || "C"}
              {lastName?.[0] || "L"}
            </AvatarFallback>
          )}
        </Avatar>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Avatar
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>
      <div>
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={user?.email || ""}
          readOnly
          className="bg-gray-100"
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          pattern="[0-9]{10,15}"
          placeholder="e.g. 0712345678"
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold mt-6">Password Change</h2>
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password (optional)"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="therapyReasons">
          Therapy Reasons (comma-separated)
        </Label>
        <Textarea
          id="therapyReasons"
          value={therapyReasons}
          onChange={(e) => setTherapyReasons(e.target.value)}
          placeholder="e.g., anxiety, stress, relationship issues"
        />
      </div>
      <div>
        <Label htmlFor="sessionTypes">
          Preferred Session Types (comma-separated)
        </Label>
        <Textarea
          id="sessionTypes"
          value={sessionTypes}
          onChange={(e) => setSessionTypes(e.target.value)}
          placeholder="e.g., individual, couples, group"
        />
      </div>
      <div>
        <Label htmlFor="preferredTimes">
          Preferred Times (comma-separated)
        </Label>
        <Textarea
          id="preferredTimes"
          value={preferredTimes}
          onChange={(e) => setPreferredTimes(e.target.value)}
          placeholder="e.g., mornings, weekdays, weekends"
        />
      </div>

      <Button type="submit" className="w-full">
        Save Changes
      </Button>
    </form>
  );
}
