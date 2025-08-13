// apps/user-ui/src/assets/svgs/ProfileIcon.tsx
import * as React from "react";

const ProfileIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Head */}
    <circle
      cx="12"
      cy="8"
      r="4"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
    />
    
    {/* Shoulders / Body */}
    <path
      d="M4.5 19.5C5.2 16.5 8.2 14.5 12 14.5C15.8 14.5 18.8 16.5 19.5 19.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export default ProfileIcon;
