"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ProfileAvatar from "@/components/client/ProfileAvatar";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";

export default function ProfileForm() {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.onboarding?.phone_number || "");
  const [avatar, setAvatar] = useState<string | null>(
    user?.onboarding?.profile_img_url || null
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [therapyReasonsDisplay, setTherapyReasonsDisplay] = useState(
    user?.onboarding?.therapy_reasons?.join(", ") || ""
  );
  const [sessionTypes, setSessionTypes] = useState<string[]>(
    user?.onboarding?.session_types || []
  );
  const [preferredTimes, setPreferredTimes] = useState<string[]>(
    user?.onboarding?.preferred_times || []
  );
  const [location, setLocation] = useState(user?.onboarding?.location || "");
  const [postalAddress, setPostalAddress] = useState(
    user?.onboarding?.postal_address || ""
  );

  const [isEditingFirstName, setIsEditingFirstName] = useState(false);
  const [isEditingLastName, setIsEditingLastName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingPostalAddress, setIsEditingPostalAddress] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sessionTypeOptions = [
    { label: "Individual", value: "individual" },
    { label: "Couples", value: "couples" },
    { label: "Group", value: "group" },
  ];

  const preferredTimeOptions = [
    { label: "Mornings", value: "mornings" },
    { label: "Afternoons", value: "afternoons" },
    { label: "Evenings", value: "evenings" },
    { label: "Weekdays", value: "weekdays" },
    { label: "Weekends", value: "weekends" },
  ];

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.onboarding?.phone_number || "");
      setAvatar(user.avatar || null);
      setTherapyReasonsDisplay(
        user.onboarding?.therapy_reasons?.join(", ") || ""
      );
      setSessionTypes(user.onboarding?.session_types || []);
      setPreferredTimes(user.onboarding?.preferred_times || []);
      setLocation(user.onboarding?.location || "");
      setPostalAddress(user.onboarding?.postal_address || "");
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      sessionTypes: sessionTypes,
      preferredTimes: preferredTimes,
      location,
      postalAddress,
    };

    try {
      const res = await fetch("/api/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        toast({
          title: "Profile saved successfully!",
          description: "Your profile has been updated.",
        });
        setIsEditingFirstName(false);
        setIsEditingLastName(false);
        setIsEditingPhone(false);
        setIsEditingLocation(false);
        setIsEditingPostalAddress(false);
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update profile.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.onboarding?.phone_number || "");
      setAvatar(user.avatar || null);
      setPassword("");
      setConfirmPassword("");
      setSessionTypes(user.onboarding?.session_types || []);
      setPreferredTimes(user.onboarding?.preferred_times || []);
      setLocation(user.onboarding?.location || "");
      setPostalAddress(user.onboarding?.postal_address || "");
    }
    setIsEditingFirstName(false);
    setIsEditingLastName(false);
    setIsEditingPhone(false);
    setIsEditingLocation(false);
    setIsEditingPostalAddress(false);
    toast({
      title: "Changes cancelled.",
    });
  };

  const EditableField = ({
    id,
    label,
    value,
    isEditing,
    setIsEditing,
    type = "text",
    placeholder = "",
    onChange,
    onBlur,
    onKeyDown,
  }: {
    id: string;
    label: string;
    value: string;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    type?: string;
    placeholder?: string;
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onBlur: () => void;
    onKeyDown?: (
      e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
  }) => {
    const [showEditIcon, setShowEditIcon] = useState(false);
    const InputComponent = type === "textarea" ? Textarea : Input;

    return (
      <div
        className="relative group py-2 px-3 border border-transparent rounded-md flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
        onMouseEnter={() => setShowEditIcon(true)}
        onMouseLeave={() => setShowEditIcon(false)}
        onClick={() => !isEditing && setIsEditing(true)}
      >
        <Label htmlFor={id} className="sr-only">
          {label}
        </Label>
        {isEditing ? (
          <InputComponent
            id={id}
            value={value}
            onChange={onChange}
            type={type}
            placeholder={placeholder}
            autoFocus
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className="w-full"
          />
        ) : (
          <p className="text-sm w-full">{value || <em>Not set</em>}</p>
        )}
        {!isEditing && showEditIcon && (
          <Button
            variant="ghost"
            size="icon"
            className="p-1.5 h-auto w-auto opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {/* Profile Avatar and Upload */}
      <div className="flex flex-col items-center gap-4">
        <ProfileAvatar
          profileImgUrl={avatar || user?.onboarding?.profile_img_url}
          firstName={firstName}
          lastName={lastName}
          size={80}
        />
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

      {/* --- Personal Info Section --- */}
      <div className="rounded-lg border p-6 bg-white space-y-6">
        <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <EditableField
              id="firstName"
              label="First Name"
              value={firstName}
              isEditing={isEditingFirstName}
              setIsEditing={setIsEditingFirstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => setIsEditingFirstName(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setIsEditingFirstName(false);
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <EditableField
              id="lastName"
              label="Last Name"
              value={lastName}
              isEditing={isEditingLastName}
              setIsEditing={setIsEditingLastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => setIsEditingLastName(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setIsEditingLastName(false);
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <EditableField
              id="phone"
              label="Phone Number"
              value={phone}
              isEditing={isEditingPhone}
              setIsEditing={setIsEditingPhone}
              type="tel"
              placeholder="e.g. 0712345678"
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setIsEditingPhone(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setIsEditingPhone(false);
                }
              }}
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
            <Label htmlFor="location">Location</Label>
            <EditableField
              id="location"
              label="Location"
              value={location}
              isEditing={isEditingLocation}
              setIsEditing={setIsEditingLocation}
              placeholder="e.g. Nairobi, Kenya"
              onChange={(e) => setLocation(e.target.value)}
              onBlur={() => setIsEditingLocation(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setIsEditingLocation(false);
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor="postalAddress">Postal Address</Label>
            <EditableField
              id="postalAddress"
              label="Postal Address"
              value={postalAddress}
              isEditing={isEditingPostalAddress}
              setIsEditing={setIsEditingPostalAddress}
              placeholder="e.g. P.O. Box 12345"
              onChange={(e) => setPostalAddress(e.target.value)}
              onBlur={() => setIsEditingPostalAddress(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setIsEditingPostalAddress(false);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* --- Therapy Details Section --- */}
      <div className="rounded-lg border p-6 bg-white space-y-4">
        <h2 className="text-lg font-semibold mb-2">Therapy Details</h2>
        <div>
          <Label htmlFor="therapyReasons">Therapy Reasons</Label>
          <p className="py-2 px-3 border border-transparent rounded-md text-sm bg-gray-100">
            {therapyReasonsDisplay || <em>Not set</em>}
          </p>
        </div>
      </div>

      {/* --- Session Preferences Section --- */}
      <div className="rounded-lg border p-6 bg-white space-y-4">
        <h2 className="text-lg font-semibold mb-2">Session Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sessionTypes">Preferred Session Types</Label>
            <MultiSelect
              options={sessionTypeOptions}
              selected={sessionTypes}
              onChange={setSessionTypes}
              placeholder="Select session types"
              label="Preferred Session Types"
            />
          </div>
          <div>
            <Label htmlFor="preferredTimes">Preferred Times</Label>
            <MultiSelect
              options={preferredTimeOptions}
              selected={preferredTimes}
              onChange={setPreferredTimes}
              placeholder="Select preferred times"
              label="Preferred Times"
            />
          </div>
        </div>
      </div>

      {/* --- Security Section --- */}
      {user?.provider !== "google" && (
        <div className="rounded-lg border p-6 bg-white space-y-4">
          <h2 className="text-lg font-semibold mb-2">Security</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
        {/* Account Deletion */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive">
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete your account? This action cannot
                be undone and will permanently remove your data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/update-profile", {
                        method: "DELETE",
                      });
                      if (res.ok) {
                        toast({
                          title: "Account deleted",
                          description:
                            "Your account has been permanently deleted.",
                        });
                        // Optionally sign out or redirect
                        window.location.href = "/goodbye";
                      } else {
                        const error = await res.json();
                        toast({
                          title: "Error",
                          description:
                            error.error || "Failed to delete account.",
                          variant: "destructive",
                        });
                      }
                    } catch (err) {
                      toast({
                        title: "Error",
                        description: "Failed to delete account.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Confirm Delete
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </form>
  );
}
