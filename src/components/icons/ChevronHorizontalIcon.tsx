interface ChevronIconProps {
  size?: number;
  className?: string;
}

/* Same stroke as ChevronDownIcon (Figma node 1:2134), turned sideways. */
function Chevron({
  d,
  size = 20,
  className,
}: ChevronIconProps & { d: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronLeftIcon(props: ChevronIconProps) {
  return <Chevron {...props} d="M12.5 5L7.5 10L12.5 15" />;
}

export function ChevronRightIcon(props: ChevronIconProps) {
  return <Chevron {...props} d="M7.5 5L12.5 10L7.5 15" />;
}
