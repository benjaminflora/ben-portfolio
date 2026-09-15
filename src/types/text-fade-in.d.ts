declare module "text-fade-in" {
  import type { CSSProperties, ReactNode } from "react";

  export default function FadeIn(props: {
    children?: ReactNode;
    lines?: boolean;
    linear?: boolean;
    className?: string;
    style?: CSSProperties;
  }): ReactNode;
}
