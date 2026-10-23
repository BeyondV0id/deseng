import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type CardProps = HTMLAttributes<HTMLElement> & { href?: string; target?: string; rel?: string }
type CardSectionProps = HTMLAttributes<HTMLDivElement>

/** One card surface for the whole app. Pass `href` and it renders a link, so a
 *  card that goes somewhere is still a card, not a card around a link. */
export function Card({ className, href, target, rel, ...props }: CardProps) {
  if (href !== undefined) {
    return <a className={cn('ui-card', className)} href={href} target={target} rel={rel} {...props} />
  }
  return <article className={cn('ui-card', className)} {...props} />
}

export function CardHeader({ className, ...props }: CardSectionProps) {
  return <div className={cn('ui-card-header', className)} {...props} />
}

export function CardContent({ className, ...props }: CardSectionProps) {
  return <div className={cn('ui-card-content', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardSectionProps) {
  return <div className={cn('ui-card-footer', className)} {...props} />
}
