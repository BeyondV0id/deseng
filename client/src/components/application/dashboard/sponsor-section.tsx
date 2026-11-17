import { Badge } from '@/components/arc/badge/badge'
import { BrandMark } from '@/components/brand/brand-mark'
import { ArrowUpRight, Box, Grid, Pen, Plus } from '@/components/icons'
import { AccordionContent, AccordionGroup, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { featuredToolSlots, sponsorBooking } from '@/lib/ads'
import styles from './sponsor-section.module.css'

const plans = [
  { name: 'Gold', price: '$150', features: ['A sponsored card in the feed', 'Your mark in the top strip', 'Both placements labelled Sponsored'] },
]

const sponsorFaqs = [
  { value: 'listing', question: 'Does sponsorship include a catalogue listing?', answer: 'No. Catalogue selection stays editorial. Sponsorship buys only the labelled placements on this page.' },
  { value: 'labels', question: 'How are sponsored placements identified?', answer: 'Every paid placement carries a Sponsored label. Your placement never changes the order of the catalogue or its search results.' },
  { value: 'assets', question: 'What do I need to send?', answer: 'A square logo, a preview image, your product name, one line about it and a destination URL. We review the copy and assets with you before launch.' },
  { value: 'updates', question: 'Can I change or remove a placement?', answer: 'Yes. Contact us to update or remove it. Placements run for one month, and refunds depend on the launch date and the reason.' },
]

function FeedPreview() {
  return <div className={styles.feedPreview} aria-hidden="true">
    {[false, true, false].map((sponsored, index) => <div key={index} className={sponsored ? styles.previewCardFeatured : styles.previewCard}>
      <div className={styles.previewMedia}>{sponsored && <><Badge size="sm">Sponsored</Badge><span>Your card</span></>}</div>
      <i /><i /><i />
    </div>)}
  </div>
}

function StripPreview() {
  return <div className={styles.stripPreview} aria-hidden="true">
    <div className={styles.previewBrand}><BrandMark /><span>Reference</span></div>
    <p>Sponsors</p>
    <div className={styles.previewMarks}>
      <span><Grid size={16} /></span><span><Pen size={16} /></span><span><Box size={16} /></span>
      <span className={styles.yourMark}>You</span><Plus size={16} />
    </div>
    <div className={styles.previewLines}><i /><i /><i /></div>
  </div>
}

export function SponsorSection() {
  const href = sponsorBooking.paymentLink ?? sponsorBooking.enquiryHref
  const available = featuredToolSlots.filter(slot => slot === null).length

  return <section id="sponsor" className={styles.sponsor} aria-labelledby="sponsor-title">
    <header className={styles.intro}>
      <h1 id="sponsor-title">Put your tool in the picture</h1>
      <p>Reach designers and developers as they browse for their next useful find. A place in the feed, a mark in the top strip, and a clear Sponsored label.</p>
      <a className={`${styles.primaryLink} app-action-primary`} href="#sponsor-plans">View sponsorship plans</a>
      <span className={styles.availability}>{available > 0 ? `${available} feed ${available === 1 ? 'spot' : 'spots'} available` : 'Ask about the next available spot'} · One month at a time</span>
    </header>

    <div className={styles.body}>
      <section aria-labelledby="sponsor-placements-title">
        <div className={styles.blockHead}>
          <h2 id="sponsor-placements-title">Two places to be found</h2>
          <p className={styles.blockNote}>Your card among the resources. Your mark above the catalogue. Both are included in Gold.</p>
        </div>
        <div className={styles.placements}>
          <figure className={styles.placement}>
            <div className={styles.placementImage} role="img" aria-label="A sponsored resource card sits between two regular cards in the browse feed"><FeedPreview /></div>
            <figcaption>A card in the browse feed, with the same shape as the resources around it</figcaption>
          </figure>
          <figure className={styles.placement}>
            <div className={styles.placementImage} role="img" aria-label="Your logo appears alongside the other marks in the sponsors strip"><StripPreview /></div>
            <figcaption>Your mark in the sponsor strip, visible as people browse the library</figcaption>
          </figure>
        </div>
        <div className={styles.howItWorks}>
          <div><h3>Bring your product</h3><p>A logo, a preview image, one line and a link. We check the details with you before your placement goes live.</p></div>
          <div><h3>Book a month</h3><p>Every placement runs for one month. Choose the space that suits your product and confirm the dates with us.</p></div>
          <div><h3>Keep it current</h3><p>New artwork, a new link or a different line. Contact us when your placement needs an update.</p></div>
        </div>
      </section>

      <section id="sponsor-plans" className={styles.plansBlock} aria-labelledby="sponsor-plans-title">
        <div className={styles.blockHead}><h2 id="sponsor-plans-title">Choose your placement</h2><p className={styles.blockNote}>A fixed place for a month. The catalogue keeps its own order.</p></div>
        <div className={styles.plans}>
          {plans.map(plan => <article key={plan.name} className={styles.plan} aria-labelledby={`sponsor-plan-${plan.name.toLowerCase()}`}>
            <h3 id={`sponsor-plan-${plan.name.toLowerCase()}`} className={styles.planName}>{plan.name}</h3>
            <p className={styles.price}>{plan.price}<span>a month</span></p>
            <ul className={styles.features}>{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
            <a className={`${styles.book} app-action-secondary`} href={href} target="_blank" rel="noreferrer">{sponsorBooking.paymentLink ? `Book ${plan.name}` : `Enquire about ${plan.name}`}<ArrowUpRight size={16} /></a>
          </article>)}
        </div>
        {!sponsorBooking.paymentLink && <p className={styles.bookingNote}>Booking enquiries open our contact page. We confirm availability and payment details with you.</p>}
      </section>

      <section className={styles.faq} aria-labelledby="sponsor-faq-title">
        <div className={styles.blockHead}><h2 id="sponsor-faq-title">Questions</h2></div>
        <AccordionGroup type="single" collapsible defaultValue="listing" className="w-full">
          {sponsorFaqs.map((faq, index) => <AccordionItem key={faq.value} value={faq.value} index={index}><AccordionTrigger>{faq.question}</AccordionTrigger><AccordionContent>{faq.answer}</AccordionContent></AccordionItem>)}
        </AccordionGroup>
      </section>
    </div>
  </section>
}
