import { useNavigate } from 'react-router-dom'
import { LibraryFooter } from './library-footer'
import { ResourceSectionHeader } from './resource-section-header'
import styles from './legal-content.module.css'

type LegalDocument = {
  title: string
  summary: string
  sections: { heading: string; paragraphs: string[] }[]
}

const updated = 'November 2, 2026'

export const legalDocuments: Record<string, LegalDocument> = {
  Privacy: {
    title: 'Privacy',
    summary: 'What Reference stores, why it is needed, and the choices you have.',
    sections: [
      { heading: 'Account information', paragraphs: [
        'If you create an account, Reference stores the name and email address you provide, along with authentication and session data needed to sign you in and keep your account secure.',
        'If you use a social sign-in provider, that provider handles its own sign-in flow. Reference receives the account details needed to create or access your account.',
      ] },
      { heading: 'Your library and submissions', paragraphs: [
        'Favourites, moodboards, and the resources you file are saved to your account so they are available when you return.',
        'A resource you submit is reviewed before it may be added to the shared catalogue. Once published, its link and catalogue details are visible to visitors. Do not submit private information or material you do not have permission to share.',
      ] },
      { heading: 'Service providers', paragraphs: [
        'The service uses its configured database and authentication providers to operate accounts and store library data. Password-reset email is sent through the configured email provider when that service is enabled.',
        'The app does not currently use analytics or advertising cookies. See the Cookies page for the small amount of browser storage used to operate the site.',
      ] },
      { heading: 'Your choices', paragraphs: [
        'You can edit your name in account settings and remove saved items or moodboards from your account. For questions about personal data or an account request, contact the maintainer through the Reference GitHub repository. Please do not post private information in a public issue.',
      ] },
      { heading: 'Changes', paragraphs: [
        'If the service begins collecting or using information in a materially different way, this page will be updated.',
      ] },
    ],
  },
  Terms: {
    title: 'Terms',
    summary: 'The basic rules for browsing, saving, and contributing to Reference.',
    sections: [
      { heading: 'Using Reference', paragraphs: [
        'You may browse the catalogue without an account. An account is required to save favourites, create moodboards, or submit a resource. Keep your sign-in details secure and use the service lawfully.',
        'The catalogue is provided for discovery. We may change, remove, or temporarily interrupt parts of the service as it develops.',
      ] },
      { heading: 'Submissions', paragraphs: [
        'Submit only links and descriptions you are allowed to share. You remain responsible for your submission and must not submit unlawful, private, misleading, or infringing material.',
        'Submissions are reviewed and may be edited for clarity, declined, or removed. If a submission is published, you allow Reference to store, format, display, and distribute its link and accompanying catalogue details as part of the public library. Submission does not guarantee acceptance or placement.',
      ] },
      { heading: 'Paid placements', paragraphs: [
        'Some placements may be paid for by a sponsor. Paid content is labelled as sponsored and kept distinct from the catalogue’s editorial ordering. Payment does not buy a ranking, endorsement, or guaranteed traffic or results.',
        'Sponsors are responsible for the accuracy and legality of their creative and destination. Placement dates, fees, cancellation, and any campaign-specific commitments are governed by the written agreement for that placement.',
      ] },
      { heading: 'Third-party links', paragraphs: [
        'Catalogue entries link to independent websites and products. Their content, availability, terms, and privacy practices are controlled by their respective operators, not Reference.',
      ] },
      { heading: 'Changes', paragraphs: [
        'Continued use after an update means you are using the service under the revised terms.',
      ] },
    ],
  },
  Licence: {
    title: 'Licence',
    summary: 'How the Reference site and the linked resources may be used.',
    sections: [
      { heading: 'Reference materials', paragraphs: [
        'Unless a page says otherwise, the Reference name, original interface, writing, and other site materials are not offered under an open-source or reuse licence. You may browse the site and share links to its pages; other use requires permission from the rights holder.',
        'The source repository is public, but it does not currently include a licence file. Public access to the code does not by itself grant permission to copy, modify, or redistribute it.',
      ] },
      { heading: 'Linked resources', paragraphs: [
        'Each linked product, repository, image, font, or other resource remains the property of its creator. Its own licence and terms apply. A listing on Reference does not grant rights to that work or imply endorsement.',
      ] },
      { heading: 'Submissions', paragraphs: [
        'By submitting a catalogue entry, you confirm that you have the rights needed to share the link and your description. The permission to publish catalogue details is described in the Terms page; it does not transfer ownership of the linked work.',
      ] },
    ],
  },
  Refunds: {
    title: 'Refunds',
    summary: 'How refunds work for Reference services and sponsored placements.',
    sections: [
      { heading: 'What can be paid for', paragraphs: [
        'Reference does not sell subscriptions, and creating an account and using the library are free. The only paid thing on the site is a sponsored placement, which is bought through a checkout page hosted by our payment provider. The library itself never takes a card.',
      ] },
      { heading: 'Sponsored placements', paragraphs: [
        'If you booked a placement through the checkout page, its fee, dates, and cancellation window are the ones shown there and on your receipt. If you arranged it directly with us instead, your written campaign agreement or invoice governs it. Either way, contact the address on the receipt or the agreement before the placement runs.',
        'If a payment was processed by a separate platform, use that platform’s refund process as well as any terms in your placement agreement.',
      ] },
      { heading: 'Changes', paragraphs: [
        'If Reference adds other paid features, the applicable refund terms will be shown before payment.',
      ] },
    ],
  },
  Cookies: {
    title: 'Cookies',
    summary: 'The cookies and browser storage Reference uses to keep the service working.',
    sections: [
      { heading: 'Essential cookies', paragraphs: [
        'When you sign in, an authentication session cookie keeps your session available across requests. It is needed for account features such as favourites, moodboards, and submissions. In production, the authentication cookie is configured for secure transport.',
      ] },
      { heading: 'Other browser storage', paragraphs: [
        'The theme preference and sound setting are stored in your browser storage so the site can remember your choices. They are not cookies and are not used to track you across other sites.',
      ] },
      { heading: 'Analytics and advertising', paragraphs: [
        'The current app does not set analytics or behavioural advertising cookies. Sponsored placements, when present, are labelled and link to the sponsor; they are not used to build an advertising profile.',
      ] },
      { heading: 'Your controls', paragraphs: [
        'You can clear cookies and site storage in your browser settings. Clearing the session cookie signs you out; clearing other storage resets the related preferences. Blocking essential cookies may prevent sign-in from working.',
      ] },
    ],
  },
}

export function LegalContent({ page }: { page: LegalDocument }) {
  const navigate = useNavigate()

  return <section className={styles.page}>
    <ResourceSectionHeader
      heading={page.title}
      subheading={page.summary}
      meta={`Last updated ${updated}`}
      back={{ label: 'Info', onClick: () => navigate('/info') }}
    />
    <article className={styles.document}>
      {page.sections.map(section => {
        const sectionId = `legal-section-${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        return <section key={section.heading} aria-labelledby={sectionId}>
          <h2 id={sectionId}>{section.heading}</h2>
          {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </section>
      })}
      {page === legalDocuments.Licence && <section aria-labelledby="icon-credits">
        <h2 id="icon-credits">Icon credits</h2>
        <p><a href="https://www.figma.com/community/file/1166831539721848736">Solar icons by 480 Design</a> are licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p>
      </section>}
    </article>
    <LibraryFooter />
  </section>
}
