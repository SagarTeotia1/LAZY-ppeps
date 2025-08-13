import * as React from "react";

const StripeLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Background in Stripe purple */}
    <rect width="24" height="24" rx="4" fill="#635BFF" />

    {/* Stripe 'S'-like Path */}
    <path
      fill="#FFFFFF"
      fillRule="evenodd"
      d="M11.12 9.19c0-.6.5-.83 1.31-.83 1.17 0 2.66.36 3.84 1.0V5.71C15.0 5.2 13.72 5 12.43 5 9.3 5 7.21 6.64 7.21 9.37c0 4.27 5.87 3.59 5.87 5.43 0 .71-.62.94-1.48.94-1.28 0-2.91-.52-4.22-1.24v3.68c1.44.62 2.89.89 4.22.89 3.21 0 5.43-1.59 5.43-4.33-.02-4.61-5.91-3.79-5.91-5.61z"
    />
  </svg>
);

export default StripeLogo;
