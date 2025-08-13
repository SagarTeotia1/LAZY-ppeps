import * as React from "react";

const PaymentIcon = ({
  fill = "#000000",
  size = 24,
  ...props
}: {
  fill?: string;
  size?: number | string;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 16V13H7C6.44772 13 6 12.5523 6 12V8C6 7.44772 6.44772 7 7 7H10V4C10 3.44772 10.4477 3 11 3H13C13.5523 3 14 3.44772 14 4V7H17C17.5523 7 18 7.44772 18 8V12C18 12.5523 17.5523 13 17 13H14V16C14 16.5523 13.5523 17 13 17H11C10.4477 17 10 16.5523 10 16ZM8 9V11H11C11.5523 11 12 11.4477 12 12V15H13V12C13 11.4477 13.4477 11 14 11H17V9H14C13.4477 9 13 8.55228 13 8V5H12V8C12 8.55228 11.5523 9 11 9H8Z"
        fill={fill}
      />
    </svg>
  );
};

export default PaymentIcon;
