import type { CSSProperties } from 'react'
import { ArrowUpRight, Plus, X } from '@/components/icons'
import { Badge } from '@/components/arc/badge/badge'
import { Button } from '@/components/arc/button/button'
import { cn } from '@/lib/utils'
import type { AdCreative } from '@/lib/ads'
import styles from './ads.module.css'

type SponsoredCardProps = {
  /** The slot's creative. A paid place with nothing booked draws nothing. */
  creative: AdCreative | null
  /**
   * `rail` is the size a resource card takes, `wide` adds the headline and
   * sentence, `featured` is the larger Explore card, and `toast` is the compact
   * horizontal corner placement.
   */
  size?: 'rail' | 'wide' | 'featured' | 'toast'
  /** Drawn over the artwork's top corner, for a card that interrupted. */
  onDismiss?: () => void
  /** Replaces house-slot artwork with the neutral plus placeholder. */
  placeholder?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * A sponsored card, in the one shape every ad in the app uses: an artwork band
 * carrying the `Sponsored` label, an optional headline, then a foot naming who
 * paid and the way to them.
 *
 * The frame is deliberately the same at every size, so a sponsor in the column
 * and a sponsor in the corner read as the same thing, and neither can be
 * mistaken for a resource the library chose.
 */
export function SponsoredCard({ creative, size = 'rail', onDismiss, placeholder = false, className, style }: SponsoredCardProps) {
  if (!creative) return null

  const initial = creative.name.trim().charAt(0).toUpperCase() || '•'
  const classNameFor = cn(styles.card, size === 'toast' ? styles.toastCard : styles[size], className)
  const mark = placeholder
    ? <Plus size={16} aria-hidden="true" />
    : creative.logoUrl
      ? <img className={styles.markImage} src={creative.logoUrl} alt="" loading="lazy" decoding="async" />
      : initial
  const body = size === 'toast'
    ? <div className={styles.toastBody}>
      <span className={styles.toastMark} aria-hidden="true">{mark}</span>
      <span className={styles.toastCopy}>
        <span className={styles.toastHeading}>
          <span className={styles.toastName}>{creative.name}</span>
          <Badge size="sm" aria-hidden="true">Ad</Badge>
        </span>
        <span className={styles.toastDescription}>{creative.description}</span>
      </span>
    </div>
    : <>
      <div className={styles.media}>
        {placeholder
          ? <div className={styles.placeholderMedia}>
            <Plus size={20} aria-hidden="true" />
            <span>Your Brand Here</span>
          </div>
          : creative.imageUrl && <img
            className={styles.mediaImage}
            src={creative.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
          />}
        <Badge className={styles.sponsorBadge} size="sm" aria-hidden="true">Sponsored</Badge>
      </div>
      {size === 'wide' && <div className={styles.copy}>
        <p className={styles.title}>{creative.title}</p>
        <p className={styles.description}>{creative.description}</p>
      </div>}
      <div className={styles.foot}>
        <span className={styles.mark} aria-hidden="true">{mark}</span>
        <span className={styles.brand}>
          <span className={styles.name}>{creative.name}</span>
          <span className={styles.tagline}>{creative.tagline}</span>
        </span>
        {creative.href && <span className={styles.cta} aria-hidden="true"><ArrowUpRight size={16} /></span>}
      </div>
    </>

  return <div className={styles.wrap} style={style}>
    {creative.href
      ? <a
        className={classNameFor}
        href={creative.href}
        // A sponsor's own site opens beside the library. The house card points
        // at the sponsor page, which is still this app, so it stays in the tab
        // that is already open.
        {...(/^https?:/i.test(creative.href)
          ? { target: '_blank', rel: 'sponsored noopener noreferrer' }
          : { rel: 'sponsored' })}
        aria-label={`Sponsored: ${creative.name}. ${creative.tagline}`}
      >{body}</a>
      : <div className={classNameFor}>{body}</div>}
    {onDismiss && <Button
      type="button"
      variant="ghost"
      size="sm"
      className={styles.dismiss}
      aria-label="Dismiss sponsored card"
      onClick={onDismiss}
    ><X size={14} /></Button>}
  </div>
}
