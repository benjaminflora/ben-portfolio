import styles from "./Button.module.css";

/* Figma node 310:1343 — rounded button (enabled / hover / press) */

/** `ghost` is secondary with no fill until hovered or current. */
export type ButtonVariant = "primary" | "secondary" | "ghost";

/** Which corners are rounded. `start`/`end` are halves of a SplitButton. */
export type ButtonShape = "pill" | "start" | "end";

interface ButtonBaseProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  /** Icon-only trigger (e.g. a split-button chevron): tighter leading padding. */
  iconOnly?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-haspopup"?: React.AriaAttributes["aria-haspopup"];
  "aria-expanded"?: boolean;
  /** Marks the current page in a set of nav buttons (ghost shows it filled). */
  "aria-current"?: React.AriaAttributes["aria-current"];
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: undefined;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  /** Opens in a new tab. */
  external?: boolean;
  download?: boolean | string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function buttonClassName({
  variant = "primary",
  shape = "pill",
  iconOnly = false,
  className,
}: Pick<ButtonBaseProps, "variant" | "shape" | "iconOnly" | "className">) {
  return [
    styles.button,
    styles[variant],
    styles[shape],
    iconOnly && styles.iconOnly,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: ButtonProps) {
  const { children, variant, shape, iconOnly, className, ...rest } = props;
  const classes = buttonClassName({ variant, shape, iconOnly, className });
  const aria = {
    "aria-label": rest["aria-label"],
    "aria-haspopup": rest["aria-haspopup"],
    "aria-expanded": rest["aria-expanded"],
    "aria-current": rest["aria-current"],
  };

  if (props.href !== undefined) {
    const { href, external, download, onClick } = props;
    return (
      <a
        href={href}
        className={classes}
        download={download}
        onClick={onClick}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...aria}
      >
        {children}
      </a>
    );
  }

  const { onClick, type = "button", disabled } = props;
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...aria}
    >
      {children}
    </button>
  );
}
