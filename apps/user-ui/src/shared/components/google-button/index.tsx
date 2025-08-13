// apps/user-ui/src/components/buttons/GoogleButtonIcon.tsx
import * as React from "react";

const GoogleButtonIcon = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className="inline-flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md bg-white hover:shadow-md transition-all text-sm font-medium text-gray-700 cursor-pointer"
    {...props}
  >
    {/* Centered Icon */}
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.35 11.1h-9.15v2.85h5.28c-.23 1.32-.93 2.44-1.98 3.18v2.64h3.2c1.87-1.72 2.95-4.25 2.95-7.25 0-.48-.05-.95-.15-1.42z"
        fill="#4285F4"
      />
      <path
        d="M12.2 21c2.7 0 4.97-.9 6.63-2.43l-3.2-2.64c-.89.6-2.03.96-3.43.96-2.64 0-4.88-1.78-5.68-4.18h-3.3v2.63C5.98 18.85 8.86 21 12.2 21z"
        fill="#34A853"
      />
      <path
        d="M6.52 12.7c-.2-.6-.32-1.24-.32-1.9s.12-1.3.32-1.9V6.27H3.22C2.44 7.78 2 9.43 2 11.2s.44 3.42 1.22 4.93l3.3-2.63z"
        fill="#FBBC05"
      />
      <path
        d="M12.2 5.27c1.47 0 2.78.51 3.8 1.52l2.85-2.85C17.15 2.44 14.88 1.5 12.2 1.5 8.86 1.5 5.98 3.65 4.52 6.27l3.3 2.63c.8-2.4 3.04-4.18 5.68-4.18z"
        fill="#EA4335"
      />
    </svg>

    {/* Text */}
    <span className="text-base">Sign in with Google</span>
  </div>
);

export default GoogleButtonIcon;
