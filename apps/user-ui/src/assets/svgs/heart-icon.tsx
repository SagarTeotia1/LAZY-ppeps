// apps/user-ui/src/assets/svgs/HeartIcon.tsx
import * as React from "react";

const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12.001 20.728l-1.305-1.188C6.087 15.38 3 12.552 3 8.999 3 6.243 5.243 4 8 4c1.657 0 3.157.805 4.001 2.07C12.843 4.805 14.343 4 16 4c2.757 0 5 2.243 5 4.999 0 3.553-3.087 6.381-7.696 10.541L12.001 20.728Z"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export default HeartIcon;


