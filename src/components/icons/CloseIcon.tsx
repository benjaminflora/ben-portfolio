interface CloseIconProps {
  size?: number;
  className?: string;
}

/* An × in the same 16px, 1px-stroke style as the other icons. */
export function CloseIcon({ size = 16, className }: CloseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
