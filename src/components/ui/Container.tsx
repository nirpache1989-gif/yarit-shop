/**
 * @file Container — centered max-width wrapper
 * @summary Thin layout primitive used by every storefront section.
 *          Caps content width at `max-w-7xl` and adds horizontal
 *          padding. Use this instead of writing the same wrapper
 *          classes over and over in each section.
 */
import { cn } from '@/lib/cn'

type Props = {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'section' | 'header' | 'footer' | 'main'
}

export function Container({ children, className, as = 'div' }: Props) {
  const Comp = as
  return (
    <Comp className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </Comp>
  )
}
