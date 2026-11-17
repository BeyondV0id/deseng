/**
 * The ad inventory.
 *
 * One object per place a sponsor can sit. A slot draws its creative, and a
 * slot set to `null` draws nothing at all, so a campaign is switched on and off
 * here rather than in a component. The card's shape never depends on who is
 * paying: it is the same frame at every size, and it always says it is an ad.
 *
 * The house card below is the place drawn at its real size. Replace the object
 * on a slot to go live, and give it an `href` so the card is a link.
 */
export type AdSlotName = 'navbar' | 'toast'

export type AdCreative = {
  /** The headline. Only the sizes with room for one print it. */
  title: string
  /** One sentence under the headline. */
  description: string
  /** The advertiser, as the foot names it. */
  name: string
  /** The line under the name, which is what the card is about. */
  tagline: string
  /** The artwork over the card. It is cropped to the frame, never letterboxed. */
  imageUrl?: string
  /** The advertiser's mark in the foot; the name's first letter stands in. */
  logoUrl?: string
  /** Where the card goes. A card without one is a reserved place, not a link. */
  href?: string
}

/**
 * The place, waiting for a sponsor. It points at the page about the library.
 *
 * It carries no artwork of its own: a reservation is drawn with the app's `+`
 * mark, not with a picture of a brand that does not exist yet.
 */
const houseAd: AdCreative = {
  title: 'Your Brand Here',
  description: 'Become a Sponsor',
  name: 'Your Brand Here',
  tagline: 'Become a Sponsor',
  href: '/sponsor',
}

export const adInventory: Record<AdSlotName, AdCreative | null> = {
  toast: houseAd,
  navbar: houseAd,
}

/**
 * Selling a placement.
 *
 * Whatever takes the money (a UPI QR, a Razorpay or Stripe link, an invoice),
 * the page only needs one address to send the sponsor to. Point `paymentLink`
 * at it and every sponsor control books through it.
 *
 * While it is null the section offers the contact channel instead, so the place
 * is never a dead end. A payment link is public by design: it is the address a
 * buyer is sent to, and it holds no secret.
 */
export const sponsorBooking: { paymentLink: string | null; enquiryHref: string } = {
  paymentLink: null,
  enquiryHref: 'https://github.com/BeyondV0id/deseng/issues',
}

/**
 * The Featured Tools band on Explore.
 *
 * Each entry is one card in reading order. A booked slot draws its creative; a
 * `null` slot draws the dotted reservation, so the band shows the place a
 * campaign will sit without pretending a tool is already there. Replace a
 * `null` with a creative to take the slot live, and give the creative an
 * `href` so the card becomes a link.
 */
export const featuredToolSlots: Array<AdCreative | null> = [
  null,
  null,
  null,
  null,
]
