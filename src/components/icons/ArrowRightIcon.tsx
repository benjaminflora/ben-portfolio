interface ArrowRightIconProps {
  size?: number;
  className?: string;
}

/* Figma node 304:1296 — arrow-right */
export function ArrowRightIcon({ size = 16, className }: ArrowRightIconProps) {
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
        d="M3.33325 8H12.6666M12.6666 8L7.99992 3.33334M12.6666 8L7.99992 12.6667"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
