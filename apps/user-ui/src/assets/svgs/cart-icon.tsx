// apps/user-ui/src/assets/svgs/CartIcon.tsx
import * as React from "react";

const CartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3 3h2l1.2 6m0 0L7 14h10l1.5-5.5H6.2z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="9"
      cy="19"
      r="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle
      cx="17"
      cy="19"
      r="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export default CartIcon;
