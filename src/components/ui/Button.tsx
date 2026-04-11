/**
 * @file Button — shared button primitive
 * @summary 3 variants (primary, secondary, ghost) x 2 sizes (md, lg).
 *          Uses the brand CSS variables from globals.css. Works as a
 *          button OR as a link — pass `href` for link behavior.
 */
import type { ReactNode } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

type CommonProps = {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
}

type ButtonProps = CommonProps & {
  href?: undefined
  type?: 'button' | 'submit'
  /** Click handler. Receives the MouseEvent so callers can read the
   *  click coordinates (for click-located confetti in AddToCartButton)
   *  or fire preventDefault on a nested Link. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  /** React 19 ref-as-prop — lets AddToCartButton's press-bounce
   *  GSAP tween target the underlying <button> element directly. */
  ref?: React.Ref<HTMLButtonElement>
}

type LinkProps = CommonProps & {
  href: string
}

const baseClasses =
  'btn-lift inline-flex items-center justify-center rounded-full font-semibold disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap'

const sizeClasses: Record<Size, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]',
  secondary:
    'border border-[var(--color-border-brand)] bg-[var(--color-surface-warm)] text-[var(--color-accent-deep)] hover:border-[var(--color-primary)]',
  ghost:
    'text-[var(--color-primary-dark)] hover:text-[var(--color-primary)]',
}

export function Button(props: ButtonProps | LinkProps) {
  const {
    children,
    variant = 'primary',
    size = 'md',
    className,
  } = props
  const classes = cn(baseClasses, sizeClasses[size], variantClasses[variant], className)

  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    )
  }

  const { type = 'button', onClick, disabled, ref } = props as ButtonProps
  return (
    <button ref={ref} type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  )
}
