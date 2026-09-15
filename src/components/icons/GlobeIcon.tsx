interface GlobeIconProps {
  size?: number;
  className?: string;
}

/* Figma node 211:1360 — globe icon asset */
export function GlobeIcon({ size = 16, className }: GlobeIconProps) {
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
      <g clipPath="url(#globe-clip)">
        <path
          d="M14.6666 8.00001C14.6666 11.6819 11.6818 14.6667 7.99992 14.6667M14.6666 8.00001C14.6666 4.31811 11.6818 1.33334 7.99992 1.33334M14.6666 8.00001H1.33325M7.99992 14.6667C4.31802 14.6667 1.33325 11.6819 1.33325 8.00001M7.99992 14.6667C6.28807 12.8692 5.33325 10.4822 5.33325 8.00001C5.33325 5.51784 6.28807 3.13078 7.99992 1.33334M7.99992 14.6667C9.71176 12.8692 10.6666 10.4822 10.6666 8.00001C10.6666 5.51784 9.71176 3.13078 7.99992 1.33334M1.33325 8.00001C1.33325 4.31811 4.31802 1.33334 7.99992 1.33334"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="globe-clip">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
