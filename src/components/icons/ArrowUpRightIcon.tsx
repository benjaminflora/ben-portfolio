interface ArrowUpRightIconProps {
  size?: number;
  className?: string;
}

/* arrow-right (Figma node 304:1296), turned up-right: leaves the site */
export function ArrowUpRightIcon({ size = 16, className }: ArrowUpRightIconProps) {
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
        d="M4.66675 11.3333L11.3334 4.66666M11.3334 4.66666H5.33341M11.3334 4.66666V10.6667"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
