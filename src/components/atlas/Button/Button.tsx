import styles from "./Button.module.css";

type ButtonVariant = "secondary";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  href?: string;
  download?: boolean | string;
  onClick?: () => void;
  className?: string;
}

export function Button({
  children,
  variant = "secondary",
  href,
  download = true,
  onClick,
  className,
}: ButtonProps) {
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a href={href} className={classes} download={download}>
        <span className={styles.label}>{children}</span>
      </a>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      <span className={styles.label}>{children}</span>
    </button>
  );
}
