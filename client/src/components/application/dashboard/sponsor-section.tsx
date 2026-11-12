import { Badge } from '@/components/arc/badge/badge'
import { Button } from '@/components/arc/button/button'
import {
  AccordionContent,
  AccordionGroup,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { sponsorBooking } from '@/lib/ads'
import styles from './sponsor-section.module.css'

/**
 * The two placements a sponsor can buy, in the order the inventory uses them.
 * Each one is a plan card: the feed position, and that position plus the
 * sidebar. Both run for a month, both are labelled, and both are booked
 * through the same address.
 */
const plans = [
  {
    name: 'Gold',
    price: '$150',
    recommended: false,
    features: [
      'A sponsored row in the feed',
      'Your mark in the top strip',
      'A Sponsored label on both',
      'One month at a time',
    ],
  },
  {
    name: 'Sidebar',
    price: '$250',
    recommended: true,
    features: [
      'Everything in Gold',
      'A card in the sidebar',
      'One line about your product',
      'A link to your site for the month',
    ],
  },
]

const sponsorFaqs = [
  {
    value: 'does-sponsorship-include-a-listing',
    question: 'Does sponsorship include a catalogue listing?',
    answer: 'No. Catalogue selection stays editorial. Sponsorship buys only the labelled placements on this page.',
  },
  {
    value: 'how-are-placements-identified',
    question: 'How are sponsored placements identified?',
    answer: 'Every paid placement carries a Sponsored label, so it reads apart from the catalogue.',
  },
  {
    value: 'what-assets-are-required',
    question: 'What assets are required?',
    answer: 'A square mark, your product name, one line about it and a destination URL. We review the copy and assets before launch.',
  },
  {
    value: 'can-i-change-or-remove-a-placement',
    question: 'Can I change or remove a placement?',
    answer: 'Yes. Contact us to update or remove it. Refunds depend on the launch date and the reason.',
  },
]

/**
 * The sponsor page, at `/sponsor`, which every `Your Brand Here` card links to.
 *
 * It reads like the rest of the library: a page heading, the argument in two
 * sentences, the two plans as cards, and the questions a sponsor asks before
 * booking. The cards are resting surfaces, not buttons: only the book action
 * answers the pointer.
 */
export function SponsorSection() {
  const paymentLink = sponsorBooking.paymentLink
  const href = paymentLink ?? sponsorBooking.enquiryHref

  return <section id="sponsor" className={styles.sponsor} aria-labelledby="sponsor-title">
    <header className="resource-section-header">
      <div className="resource-section-title">
        <h1 id="sponsor-title">Sponsor</h1>
        <p className="page-description">
          Reach designers and developers while they look for something to use.
          Every placement is labelled and fixed in place, so it never moves the catalogue.
        </p>
      </div>
    </header>

    <div className={styles.body}>
      <section className={styles.plansBlock} aria-labelledby="sponsor-plans-title">
        <div className={styles.blockHead}>
          <h2 id="sponsor-plans-title">Plans</h2>
          <p className={styles.blockNote}>
            One month each. The sidebar plan adds a card to everything Gold already buys.
          </p>
        </div>

        <div className={styles.plans}>
          {plans.map(plan => <article
            key={plan.name}
            className={styles.plan}
            aria-labelledby={`sponsor-plan-${plan.name.toLowerCase()}`}
          >
            <div className={styles.planHead}>
              <h3 id={`sponsor-plan-${plan.name.toLowerCase()}`} className={styles.planName}>{plan.name}</h3>
              {plan.recommended ? <Badge size="sm" className={styles.planBadge}>Most reach</Badge> : null}
            </div>

            <p className={styles.price}>
              {plan.price}
              <span className={styles.period}>a month</span>
            </p>

            <ul className={styles.features}>
              {plan.features.map(feature => <li key={feature}>{feature}</li>)}
            </ul>

            <Button
              variant={plan.recommended ? 'primary' : 'secondary'}
              className={styles.book}
              onClick={() => { window.location.href = href }}
            >
              Book {plan.name}
            </Button>
          </article>)}
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="sponsor-faq-title">
        <div className={styles.blockHead}>
          <h2 id="sponsor-faq-title">Frequently asked questions</h2>
        </div>

        <AccordionGroup type="single" collapsible defaultValue={sponsorFaqs[0].value} className="w-full">
          {sponsorFaqs.map((faq, index) => (
            <AccordionItem key={faq.value} value={faq.value} index={index}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </AccordionGroup>
      </section>
    </div>

    <p className={styles.submissionTerms}>
      By booking, you agree to our terms and privacy policy.
    </p>
  </section>
}
