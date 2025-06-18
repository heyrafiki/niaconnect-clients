import React from "react";

interface ProfileAvatarProps {
  profileImgUrl?: string;
  firstName?: string;
  lastName?: string;
  size?: number; // px
  className?: string;
}

const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.[0]?.toUpperCase() || "";
  const last = lastName?.[0]?.toUpperCase() || "";
  return `${first}${last}` || "?";
};

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  profileImgUrl,
  firstName,
  lastName,
  size = 48,
  className = "",
}) => {
  const initials = getInitials(firstName, lastName);
  return (
    <div
      className={`rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border ${className}`}
      style={{ width: size, height: size }}
    >
      {profileImgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profileImgUrl}
          alt="Profile"
          style={{ width: size, height: size, objectFit: "cover" }}
        />
      ) : (
        <span className="text-lg font-bold text-foreground">{initials}</span>
      )}
    </div>
  );
};

export default ProfileAvatar;
