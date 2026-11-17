import type { MouseEvent as ReactMouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from '@/components/brand/brand-mark'
import { SiteFooter, type SiteFooterColumn, type SiteFooterLink } from '@/components/arc/blocks/site-footer/site-footer'
import { NAV_SECTIONS } from '@/components/sidebar-preset/nav-data'
import { allResources, cookiesView, infoView, licenceView, pathForView, privacyView, refundsView, sponsorView, submitView, termsView } from '@/lib/view-path'
import styles from './library-footer.module.css'

const browseLinks: SiteFooterLink[] = NAV_SECTIONS
  .flatMap(section => section.items)
  .map(item => ({ label: item.label, href: pathForView(item.view) }))

const legalLinks: SiteFooterLink[] = [
  { label: 'Privacy', href: pathForView(privacyView) },
  { label: 'Terms', href: pathForView(termsView) },
  { label: 'Licence', href: pathForView(licenceView) },
  { label: 'Refunds', href: pathForView(refundsView) },
  { label: 'Cookies', href: pathForView(cookiesView) },
]

/**
 * Three columns and nothing else: where the catalogue goes, where the app
 * goes, and the pages that say what the library is. The account's own views
 * are not here, because the footer is the same page for a visitor without one.
 */
const columns: SiteFooterColumn[] = [
  { title: 'Browse', links: browseLinks },
  {
    title: 'Reference',
    links: [
      { label: 'Info', href: pathForView(infoView) },
      { label: 'Submit', href: pathForView(submitView) },
      { label: 'Sponsor', href: pathForView(sponsorView) },
      { label: 'Contact', href: 'https://github.com/BeyondV0id/deseng/issues', external: true },
      { label: 'X', href: 'https://x.com', external: true },
    ],
  },
  { title: 'Legal', links: legalLinks },
]

/**
 * Shared footer and closing wordmark for Info and the legal pages.
 *
 * The left column is one sentence about the library rather than the brand row,
 * because the oversized wordmark directly under the footer already says the
 * name. The block's own closing row is not drawn either: the legal pages moved
 * up into the third column, so there is no second row to hold them.
 */
export function LibraryFooter() {
  const navigate = useNavigate()

  function handleFooterClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = (event.target as HTMLElement).closest('a')
    const href = anchor?.getAttribute('href')
    if (!href || !href.startsWith('/')) return
    event.preventDefault()
    navigate(href)
  }

  return <div className={styles.footer} onClickCapture={handleFooterClick}>
    <SiteFooter
      variant="columns"
      className={styles.siteFooter}
      brand={{ name: 'Reference', href: pathForView(allResources), mark: <BrandMark /> }}
      tagline="Interface references, kept in one order"
      columns={columns}
      newsletter={null}
      status={null}
      legal={[]}
      socials={[]}
    />
    <div className={styles.footerWordmark} aria-hidden="true">Reference</div>
  </div>
}
