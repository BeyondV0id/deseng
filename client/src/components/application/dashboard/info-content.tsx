import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/brand/brand-mark'
import { categories, collections } from '@/catalog'
import { favorites, moodboardShelf, pathForView } from '@/lib/view-path'
import styles from './info-content.module.css'

export const infoDescription = 'What desgnix is, and how the entries are kept: a working shelf of interface references for design engineers.'

/** The three rules the library is actually edited by. */
const principles = [
  {
    title: 'Chosen by hand',
    body: 'Every entry is read before it is filed. There is no crawler and no leaderboard: a link earns its place because someone looked at the work and thought it was worth keeping.',
  },
  {
    title: 'One fixed order',
    body: 'Rank is captured once, from GitHub stars for repositories and traffic rank for sites. Saving a card, filing it or searching does not move the grid, so the library reads the same on every visit.',
  },
  {
    title: 'Filed by purpose',
    body: 'Tags say what a resource is for, not who made it. That is what makes the library findable by the job in front of you, rather than by a name you already had to know.',
  },
]

/**
 * The library's own page, drawn inside the shell's content column.
 *
 * It is a view like a shelf, not a route with a second layout: the sidebar,
 * the search and the account stay where they are, and the library's grid is
 * simply replaced by the words behind it. There is no artwork here. The
 * preview image belongs to link previews, where it does the work of showing
 * the library before someone opens it.
 */
export function InfoContent({ total }: { total: number }) {
  return <section className={styles.info} aria-labelledby="info-title">
    <header className="resource-section-header">
      <div className="resource-section-title">
        <h1 id="info-title">A library for the details that make an interface feel right.</h1>
        <p className="page-description">{infoDescription}</p>
      </div>
    </header>

    <p className={styles.stats}>
      <span className={styles.stat}>
        <span className={styles.statValue}>{collections.length}</span> shelves,
      </span>
      <span className={styles.stat}>
        <span className={styles.statValue}>{categories.length}</span> tags and
      </span>
      <span className={styles.stat}>
        <span className={styles.statValue}>{total}</span> entries
      </span>
    </p>

    <div className={styles.body}>
      <section className={styles.intro} aria-labelledby="what-title">
        <h2 id="what-title">What desgnix is</h2>
        <div className={styles.introText}>
          <p>
            It is a working shelf, not a feed. The library is made for the moment you know the
            kind of thing you need but not its name: an empty state, a chart that has to read at a
            glance, a typeface with a very particular voice, a shader that behaves under a thumb.
          </p>
          <p>
            Each card opens the source. There is no article between you and the work, no score, and
            no sponsored slot. If an entry stops being useful, it leaves.
          </p>
        </div>
      </section>

      <section className={styles.principles} aria-labelledby="kept-title">
        <h2 id="kept-title">How the library is kept</h2>
        <div className={styles.principleGrid}>
          {principles.map((principle, index) => <article key={principle.title} className={styles.principle}>
            <span className={styles.principleNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <h3>{principle.title}</h3>
            <p>{principle.body}</p>
          </article>)}
        </div>
      </section>
    </div>

    <footer className={styles.footer}>
      <Link to={pathForView('All resources')} className={styles.footerBrand}>
        <BrandMark />
        <span>desgnix</span>
      </Link>
      <p className={styles.footerNote}>Links chosen by hand, filed by purpose.</p>
      <div className={styles.footerMeta}>
        <Link to={pathForView(favorites)} className={styles.footerLink}>Favourites</Link>
        <Link to={pathForView(moodboardShelf)} className={styles.footerLink}>Moodboards</Link>
        <span>© 2026</span>
      </div>
    </footer>
  </section>
}
