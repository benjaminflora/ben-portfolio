interface ArrowDownIconProps {
  size?: number;
  className?: string;
}

/* arrow-right (Figma node 304:1296), pointing down */
export function ArrowDownIcon({ size = 16, className }: ArrowDownIconProps) {
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
        d="M8 3.33325V12.6666M8 12.6666L3.33334 7.99992M8 12.6666L12.6667 7.99992"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
