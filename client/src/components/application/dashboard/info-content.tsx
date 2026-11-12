import { AccordionContent, AccordionGroup, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { categories, collections } from '@/catalog'
import { LibraryFooter } from './library-footer'

import styles from './info-content.module.css'

export const infoDescription = 'Design resources, tools, and references, all in one place.'

const faqItems = [
  {
    value: 'what-is-reference',
    title: 'What is Reference?',
    content: 'Reference is a small, hand-kept library of tools, references, and examples for making interfaces. It is for the moment when you know what you need to do, but do not know the name of the thing that can help. Open a card to go straight to the source.',
  },
  {
    value: 'how-to-use',
    title: 'How do I use it?',
    content: 'Search by name, tag, or purpose when you have a specific job in mind. You can also browse a shelf and open cards one by one. When you find something worth keeping, save it to your favourites or file it in a moodboard.',
  },
  {
    value: 'need-an-account',
    title: 'Do I need an account?',
    content: 'No. You can browse every shelf, search the catalogue, and open any source without signing in. An account is only needed for favourites, moodboards, and submitting a resource.',
  },
  {
    value: 'how-entries-are-chosen',
    title: 'How are entries chosen?',
    content: 'Every link is looked at before it is added. We keep things that are useful, clear, or unusually good at solving a particular problem. Paid placements are labelled and kept separate from the catalogue order.',
  },
  {
    value: 'saving-and-order',
    title: 'Does saving change the order?',
    content: 'No. Each entry has a fixed position when it enters the catalogue. Saving, filing, and searching do not move the grid, so the same resource stays in the same place when you come back.',
  },
  {
    value: 'how-tags-work',
    title: 'How do tags work?',
    content: 'Tags describe the job a resource helps with, such as fonts, image tools, or hosting. They are meant to help you find something by purpose instead of needing to know its name first.',
  },
  {
    value: 'submit-a-resource',
    title: 'How do I submit a resource?',
    content: 'Sign in and choose Submit a resource from the top bar. Add the link, name, description, and tag that best explain what it does. We review every submission before it can appear in the shared catalogue, and a submission is not guaranteed to be accepted.',
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
        <h1 id="info-title">Find What You Need.</h1>
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
        <h2 id="what-title">About Reference</h2>
        <div className={styles.introText}>
          <p>
            Reference is a small library of tools, references, and examples for making interfaces.
            Search by the job you need to do, or browse a shelf when you do not know the name yet.
          </p>
          <p>
            Open a card to visit the source. Save a useful find or put it in a moodboard. Entries
            are checked by hand. Paid placements are labelled and do not change the catalogue order.
            If a link stops being useful, we take it out.
          </p>
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="faq-title">
        <h2 id="faq-title">Questions</h2>
        <AccordionGroup type="single" collapsible defaultValue="what-is-reference" className="mx-auto w-full max-w-4xl">
          {faqItems.map((item, index) => (
            <AccordionItem key={item.value} value={item.value} index={index}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </AccordionGroup>
      </section>

    </div>

    <LibraryFooter />
  </section>
}
