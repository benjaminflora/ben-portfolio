declare module 'text-fade-in' {
  import type { CSSProperties, ReactNode } from 'react'
  interface FadeInProps {
    children?: ReactNode
    lines?: boolean
    linear?: boolean
    className?: string
    style?: CSSProperties
  }
  export default function FadeIn(props: FadeInProps): JSX.Element
}
